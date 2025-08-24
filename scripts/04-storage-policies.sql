-- Supabase Storage Policies for Documents Bucket
-- Run this script in your Supabase SQL Editor after creating the 'documents' bucket

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Policy: "Users can upload their own files"
-- This allows users to upload files to folders named with their user ID
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: "Users can view their own files"  
-- This allows users to view/download only files in their own folder
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: "Users can delete their own files"
-- This allows users to delete only files in their own folder
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.buckets if not already enabled
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy for bucket access (allow authenticated users to access the documents bucket)
DROP POLICY IF EXISTS "Allow authenticated access to documents bucket" ON storage.buckets;
CREATE POLICY "Allow authenticated access to documents bucket" ON storage.buckets
  FOR SELECT USING (
    id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Instructions for manual setup in Supabase Dashboard:
-- 
-- 1. Go to Storage > Buckets
-- 2. Create a new bucket named 'documents'
-- 3. Set bucket as 'Private' (not public)
-- 4. The above policies will automatically apply
-- 
-- File structure will be: documents/{user_id}/{timestamp}-{random}-{filename}
-- This ensures users can only access files in their own folder
