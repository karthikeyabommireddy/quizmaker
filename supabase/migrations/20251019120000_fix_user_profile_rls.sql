-- Fix RLS policy for users_profile table to allow signup
-- This migration fixes the "new row violates row-level security policy" error during user registration

-- The issue: When a user signs up, they're authenticated but their profile doesn't exist yet
-- The solution: Simplify the insert policy to just check that the user_id matches auth.uid()

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;

-- Create a simplified policy that allows any authenticated user to insert their own profile
-- This works because:
-- 1. User signs up with Supabase Auth (gets authenticated)
-- 2. User can then insert their profile where user_id = auth.uid()
-- 3. The WITH CHECK ensures they can only insert a profile for themselves
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No need for additional policies since this covers the signup case
