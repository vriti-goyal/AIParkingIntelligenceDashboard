-- 2. Create table parking_violations
CREATE TABLE IF NOT EXISTS parking_violations (
    id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location TEXT,
    vehicle_number TEXT,
    vehicle_type TEXT,
    description TEXT,
    violation_type TEXT,
    offence_code TEXT,
    created_datetime TIMESTAMPTZ NOT NULL,
    closed_datetime TIMESTAMPTZ,
    modified_datetime TIMESTAMPTZ,
    device_id TEXT,
    created_by_id TEXT,
    center_code TEXT,
    police_station TEXT,
    data_sent_to_scita TEXT,
    junction_name TEXT,
    action_taken_timestamp TIMESTAMPTZ,
    data_sent_to_scita_timestamp TIMESTAMPTZ,
    updated_vehicle_number TEXT,
    updated_vehicle_type TEXT,
    validation_status TEXT,
    validation_timestamp TIMESTAMPTZ,
    PRIMARY KEY (id, created_datetime)
);

-- 4. Create indexes safely
CREATE INDEX IF NOT EXISTS idx_parking_violations_created_datetime ON parking_violations (created_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_parking_violations_police_station ON parking_violations (police_station);
CREATE INDEX IF NOT EXISTS idx_parking_violations_junction_name ON parking_violations (junction_name);
CREATE INDEX IF NOT EXISTS idx_parking_violations_violation_type ON parking_violations (violation_type);
CREATE INDEX IF NOT EXISTS idx_parking_violations_vehicle_type ON parking_violations (vehicle_type);
CREATE INDEX IF NOT EXISTS idx_parking_violations_validation_status ON parking_violations (validation_status);
