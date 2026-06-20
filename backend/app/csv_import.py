import pandas as pd
import json
import io
import ast
import logging
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from psycopg2.extras import execute_values

from app.database import get_db, engine
from app.models import ParkingViolation

router = APIRouter()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def clean_violation_type(val):
    if pd.isna(val):
        return None
    
    val_str = str(val).strip()
    if val_str.startswith('['):
        try:
            parsed = json.loads(val_str)
            if isinstance(parsed, list):
                return ", ".join(str(x) for x in parsed)
        except json.JSONDecodeError:
            try:
                parsed = ast.literal_eval(val_str)
                if isinstance(parsed, list):
                    return ", ".join(str(x) for x in parsed)
            except (ValueError, SyntaxError):
                pass
    return val_str

def clean_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str) and value.strip().lower() in ["nan", "nat", "none", ""]:
        return None
    return value

@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV allowed.")
    
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    chunksize = 25000
    
    total_rows = 0
    rows_skipped = 0
    invalid_coordinate_rows = 0
    sample_errors = []
    
    datetime_cols = [
        'created_datetime', 'closed_datetime', 'modified_datetime',
        'action_taken_timestamp', 'data_sent_to_scita_timestamp', 'validation_timestamp'
    ]
    model_columns = [c.name for c in ParkingViolation.__table__.columns if c.name != 'geom']

    raw_conn = engine.raw_connection()
    cursor = raw_conn.cursor()

    try:
        # Check initial DB count
        cursor.execute("SELECT COUNT(*) FROM parking_violations")
        initial_count = cursor.fetchone()[0]

        for chunk in pd.read_csv(io.BytesIO(contents), chunksize=chunksize, dtype=str):
            chunk_len = len(chunk)
            total_rows += chunk_len
            
            # Clean columns
            chunk.columns = chunk.columns.str.strip().str.lower().str.replace(' ', '_')
            logger.info(f"Cleaned columns: {chunk.columns.tolist()}")
            
            # Make sure id is always present
            if 'id' not in chunk.columns:
                chunk['id'] = [f"AUTO_{uuid.uuid4()}" for _ in range(chunk_len)]
            else:
                chunk['id'] = chunk['id'].replace(['', 'nan', 'None'], pd.NA)
                chunk['id'] = chunk['id'].apply(lambda x: f"AUTO_{uuid.uuid4()}" if pd.isna(x) else x)
            
            # Numeric coercions
            if 'latitude' in chunk.columns and 'longitude' in chunk.columns:
                chunk['latitude'] = pd.to_numeric(chunk['latitude'], errors='coerce')
                chunk['longitude'] = pd.to_numeric(chunk['longitude'], errors='coerce')
            else:
                raise HTTPException(status_code=400, detail="Missing latitude or longitude columns")

            # Date coercions
            for col in datetime_cols:
                if col in chunk.columns:
                    chunk[col] = pd.to_datetime(chunk[col], errors='coerce', utc=True)
                    # explicitly convert NaT to Python None
                    chunk[col] = chunk[col].apply(lambda x: None if pd.isna(x) else x)

            # Find invalid coordinates
            invalid_coords_mask = chunk['latitude'].isna() | chunk['longitude'].isna()
            invalid_count = invalid_coords_mask.sum()
            invalid_coordinate_rows += invalid_count

            # Clean violation type
            if 'violation_type' in chunk.columns:
                chunk['violation_type'] = chunk['violation_type'].apply(clean_violation_type)

            # Filter valid rows (drop invalid coords)
            chunk = chunk[~invalid_coords_mask]

            # Replace NaN/NaT with None for postgres
            chunk = chunk.where(pd.notnull(chunk), None)
            
            logger.info(f"First 3 rows after cleaning:\n{chunk.head(3)}")
            
            cols_to_insert = [c for c in model_columns if c in chunk.columns]
            
            if not cols_to_insert or chunk.empty:
                rows_skipped += int(invalid_count)
                logger.info(f"Processed {total_rows} rows...")
                continue

            raw_records = [tuple(x) for x in chunk[cols_to_insert].to_numpy()]
            # Apply clean_value to every field in every row
            records = [tuple(clean_value(val) for val in rec) for rec in raw_records]
            
            cols_str = ', '.join(cols_to_insert)
            
            # The Timescale DB partitioned primary key constraint
            conflict_cols = 'id, created_datetime'
            
            bulk_insert_query = f"""
                INSERT INTO parking_violations ({cols_str})
                VALUES %s
                ON CONFLICT ({conflict_cols}) DO NOTHING
            """
            
            placeholders = ', '.join(['%s'] * len(cols_to_insert))
            single_insert_query = f"""
                INSERT INTO parking_violations ({cols_str})
                VALUES ({placeholders})
                ON CONFLICT ({conflict_cols}) DO NOTHING
            """
            
            try:
                execute_values(cursor, bulk_insert_query, records, page_size=5000)
                raw_conn.commit()
                rows_skipped += int(invalid_count)
            except Exception as e:
                raw_conn.rollback()
                logger.exception("Bulk database insert error:")
                
                logger.info("Falling back to row-by-row insertion for failed chunk...")
                rows_skipped += int(invalid_count)
                
                for rec in records:
                    try:
                        cursor.execute(single_insert_query, rec)
                        raw_conn.commit()
                    except Exception as row_e:
                        raw_conn.rollback()
                        rows_skipped += 1
                        if len(sample_errors) < 5:
                            row_data_dict = dict(zip(cols_to_insert, rec))
                            row_data_dict = {k: str(v) if v is not None else None for k, v in row_data_dict.items()}
                            sample_errors.append({
                                "error": str(row_e).strip(),
                                "row_data": row_data_dict
                            })

            logger.info(f"Processed {total_rows} rows...")



        # Calculate exact final imported rows
        cursor.execute("SELECT COUNT(*) FROM parking_violations")
        final_count = cursor.fetchone()[0]
        rows_imported = final_count - initial_count
        
        # Back-calculate duplicate rows accurately
        duplicate_rows = total_rows - rows_imported - rows_skipped
        if duplicate_rows < 0:
            duplicate_rows = 0

    except Exception as e:
        raw_conn.rollback()
        logger.exception(f"Fatal error during import: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        raw_conn.close()

    message = "CSV import completed"
    if sample_errors:
        message = "CSV import completed with errors"
    if rows_imported == 0 and rows_skipped > 0:
        if sample_errors:
            message = f"CSV import failed. Likely reason: {sample_errors[0]['error']}"
        elif duplicate_rows == total_rows:
            message = "CSV import skipped. All rows were duplicates."
        elif invalid_coordinate_rows == total_rows:
            message = "CSV import skipped. All rows had invalid coordinates."

    return {
        "message": message,
        "total_rows": total_rows,
        "rows_imported": rows_imported,
        "rows_skipped": rows_skipped,
        "invalid_coordinate_rows": int(invalid_coordinate_rows),
        "duplicate_rows": int(duplicate_rows),
        "sample_errors": sample_errors
    }
