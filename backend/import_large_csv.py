import sys
import os
import pandas as pd
import json
import ast
import uuid
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment.")
    sys.exit(1)

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

def main():
    if len(sys.argv) < 2:
        print('Usage: python import_large_csv.py <path_to_csv>')
        sys.exit(1)
        
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        sys.exit(1)

    chunksize = 25000
    total_rows = 0
    rows_skipped = 0
    invalid_coordinate_rows = 0
    sample_errors = []
    
    datetime_cols = [
        'created_datetime', 'closed_datetime', 'modified_datetime',
        'action_taken_timestamp', 'data_sent_to_scita_timestamp', 'validation_timestamp'
    ]
    
    model_columns = [
        'id', 'latitude', 'longitude', 'location', 'vehicle_number', 
        'vehicle_type', 'description', 'violation_type', 'offence_code', 
        'created_datetime', 'closed_datetime', 'modified_datetime', 
        'device_id', 'created_by_id', 'center_code', 'police_station', 
        'data_sent_to_scita', 'junction_name', 'action_taken_timestamp', 
        'data_sent_to_scita_timestamp', 'updated_vehicle_number', 
        'updated_vehicle_type', 'validation_status', 'validation_timestamp'
    ]

    try:
        raw_conn = psycopg2.connect(DATABASE_URL)
        cursor = raw_conn.cursor()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        sys.exit(1)

    try:
        # Check initial DB count
        cursor.execute("SELECT COUNT(*) FROM parking_violations")
        initial_count = cursor.fetchone()[0]

        for chunk in pd.read_csv(file_path, chunksize=chunksize, dtype=str):
            chunk_len = len(chunk)
            total_rows += chunk_len
            
            # Clean columns
            chunk.columns = chunk.columns.str.strip().str.lower().str.replace(' ', '_')
            
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
                print("Missing latitude or longitude columns in this chunk")
                continue

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
            
            cols_to_insert = [c for c in model_columns if c in chunk.columns]
            
            if not cols_to_insert or chunk.empty:
                rows_skipped += int(invalid_count)
                print(f"Processed {total_rows} rows...")
                print(f"Imported so far: {total_rows - rows_skipped - invalid_coordinate_rows} (approx)")
                print(f"Skipped so far: {rows_skipped}")
                continue

            raw_records = [tuple(x) for x in chunk[cols_to_insert].to_numpy()]
            # Apply clean_value to every field in every row
            records = [tuple(clean_value(val) for val in rec) for rec in raw_records]
            
            cols_str = ', '.join(cols_to_insert)
            
            # Using id, created_datetime as per the existing csv_import.py models logic 
            # to accommodate timescale partitioned PK, but we can just use id if it isn't timescale.
            # We'll use id, created_datetime to be safe against schema requirements
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
                # If conflict is only on id, we might hit an error above, fallback
                if "constraint" in str(e).lower() and "id" in str(e).lower():
                    # Attempt a retry with just 'id' as conflict column if needed
                    bulk_insert_query = f"""
                        INSERT INTO parking_violations ({cols_str})
                        VALUES %s
                        ON CONFLICT (id) DO NOTHING
                    """
                    single_insert_query = f"""
                        INSERT INTO parking_violations ({cols_str})
                        VALUES ({placeholders})
                        ON CONFLICT (id) DO NOTHING
                    """
                    try:
                        execute_values(cursor, bulk_insert_query, records, page_size=5000)
                        raw_conn.commit()
                        rows_skipped += int(invalid_count)
                    except Exception as fallback_e:
                        raw_conn.rollback()
                        print("Bulk database insert error:", fallback_e)
                        print("Falling back to row-by-row insertion for failed chunk...")
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
                else:
                    print("Bulk database insert error:", e)
                    print("Falling back to row-by-row insertion for failed chunk...")
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

            print(f"Processed {total_rows} rows...")
            print(f"Imported so far: {total_rows - rows_skipped} (approx, excluding duplicates)")
            print(f"Skipped so far: {rows_skipped}")



        # Calculate exact final imported rows
        cursor.execute("SELECT COUNT(*) FROM parking_violations")
        final_count = cursor.fetchone()[0]
        rows_imported = final_count - initial_count
        
        # Back-calculate duplicate rows accurately
        duplicate_rows = total_rows - rows_imported - rows_skipped
        if duplicate_rows < 0:
            duplicate_rows = 0

    except Exception as e:
        if raw_conn:
            raw_conn.rollback()
        print(f"Fatal error during import: {e}")
        sys.exit(1)
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'raw_conn' in locals() and raw_conn:
            raw_conn.close()

    print("\n--- Import Summary ---")
    print(f"total_rows: {total_rows}")
    print(f"rows_imported: {rows_imported}")
    print(f"rows_skipped: {rows_skipped}")
    print(f"invalid_coordinate_rows: {invalid_coordinate_rows}")
    print(f"duplicate_rows: {duplicate_rows}")
    print(f"sample_errors: {sample_errors}")

if __name__ == '__main__':
    main()
