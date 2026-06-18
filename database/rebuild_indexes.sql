-- Drop indexes to speed up bulk imports
DROP INDEX IF EXISTS idx_parking_violations_geom;
DROP INDEX IF EXISTS idx_parking_violations_latitude;
DROP INDEX IF EXISTS idx_parking_violations_longitude;
DROP INDEX IF EXISTS idx_parking_violations_created_datetime;
DROP INDEX IF EXISTS idx_parking_violations_police_station;
DROP INDEX IF EXISTS idx_parking_violations_junction_name;
DROP INDEX IF EXISTS idx_parking_violations_violation_type;
DROP INDEX IF EXISTS idx_parking_violations_vehicle_type;
DROP INDEX IF EXISTS idx_parking_violations_validation_status;

-- Recreate indexes
CREATE INDEX idx_parking_violations_geom ON parking_violations USING GIST (geom);
CREATE INDEX idx_parking_violations_latitude ON parking_violations (latitude);
CREATE INDEX idx_parking_violations_longitude ON parking_violations (longitude);
CREATE INDEX idx_parking_violations_created_datetime ON parking_violations (created_datetime DESC);
CREATE INDEX idx_parking_violations_police_station ON parking_violations (police_station);
CREATE INDEX idx_parking_violations_junction_name ON parking_violations (junction_name);
CREATE INDEX idx_parking_violations_violation_type ON parking_violations (violation_type);
CREATE INDEX idx_parking_violations_vehicle_type ON parking_violations (vehicle_type);
CREATE INDEX idx_parking_violations_validation_status ON parking_violations (validation_status);
