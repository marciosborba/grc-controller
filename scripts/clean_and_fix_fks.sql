-- Clean up invalid data before adding constraints
-- Delete orphans in child tables first
DELETE FROM incident_history WHERE incident_id NOT IN (SELECT id FROM incidents);
DELETE FROM incident_comments WHERE incident_id NOT IN (SELECT id FROM incidents);

-- Delete incidents with invalid references
DELETE FROM incidents WHERE reporter_id NOT IN (SELECT id FROM profiles);
DELETE FROM incidents WHERE assignee_id IS NOT NULL AND assignee_id NOT IN (SELECT id FROM profiles);
DELETE FROM incidents WHERE tenant_id NOT IN (SELECT id FROM tenants);

-- Now clean child tables again in case incidents were deleted
DELETE FROM incident_history WHERE incident_id NOT IN (SELECT id FROM incidents);
DELETE FROM incident_comments WHERE incident_id NOT IN (SELECT id FROM incidents);

-- Recreate Foreign Keys for incidents table
ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_reporter_id_fkey,
DROP CONSTRAINT IF EXISTS incidents_assignee_id_fkey,
DROP CONSTRAINT IF EXISTS incidents_tenant_id_fkey;

ALTER TABLE incidents
ADD CONSTRAINT incidents_reporter_id_fkey
FOREIGN KEY (reporter_id) REFERENCES profiles(id),
ADD CONSTRAINT incidents_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES profiles(id),
ADD CONSTRAINT incidents_tenant_id_fkey
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Also for comments and history
ALTER TABLE incident_comments
DROP CONSTRAINT IF EXISTS incident_comments_user_id_fkey,
DROP CONSTRAINT IF EXISTS incident_comments_incident_id_fkey;

ALTER TABLE incident_comments
ADD CONSTRAINT incident_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id),
ADD CONSTRAINT incident_comments_incident_id_fkey
FOREIGN KEY (incident_id) REFERENCES incidents(id);

ALTER TABLE incident_history
DROP CONSTRAINT IF EXISTS incident_history_user_id_fkey,
DROP CONSTRAINT IF EXISTS incident_history_incident_id_fkey;

ALTER TABLE incident_history
ADD CONSTRAINT incident_history_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id),
ADD CONSTRAINT incident_history_incident_id_fkey
FOREIGN KEY (incident_id) REFERENCES incidents(id);
