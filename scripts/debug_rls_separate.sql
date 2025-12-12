DROP POLICY IF EXISTS "Public assessment access" ON "vendor_assessments";
DROP POLICY IF EXISTS "Public assessment update" ON "vendor_assessments";
DROP POLICY IF EXISTS "Debug Public Select" ON "vendor_assessments";

CREATE POLICY "Public Select" ON "vendor_assessments"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public Update" ON "vendor_assessments"
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
