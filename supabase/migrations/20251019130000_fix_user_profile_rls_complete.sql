-- Complete RLS Policy Fix for users_profile table
-- This migration completely replaces all RLS policies for users_profile
-- to fix the "new row violates row-level security policy" error

-- Step 1: Drop ALL existing policies on users_profile
DROP POLICY IF EXISTS "Users can view all profiles" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can delete own profile" ON users_profile;

-- Step 2: Recreate policies with proper permissions

-- Allow authenticated users to view all profiles (needed for leaderboards, etc.)
CREATE POLICY "Users can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CRITICAL FIX: Allow authenticated users to insert their own profile during signup
-- This is the key policy that was causing the error
-- During signup, the user is authenticated but doesn't have a profile yet
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to delete their own profile (if needed)
CREATE POLICY "Users can delete own profile"
  ON users_profile FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 3: Verify RLS is enabled
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
