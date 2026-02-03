-- Make storage buckets private (policies already exist)
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('entregas-fotos', 'materiais-separacao');