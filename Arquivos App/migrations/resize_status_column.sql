-- Increase status column length to support longer custom statuses
ALTER TABLE vulnerabilities ALTER COLUMN status TYPE VARCHAR(100);

-- Also update history table to match (pre-emptively)
ALTER TABLE vulnerability_status_history ALTER COLUMN old_status TYPE VARCHAR(100);
ALTER TABLE vulnerability_status_history ALTER COLUMN new_status TYPE VARCHAR(100);
