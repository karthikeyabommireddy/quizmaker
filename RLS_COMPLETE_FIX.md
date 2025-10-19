# 🔴 CRITICAL FIX: RLS Policy Error - Complete Solution

## Problem
Getting "new row violates row-level security policy for table users_profile" error even after applying the previous fix.

## Root Cause
The original migration file created a basic RLS policy, but there may be conflicts or the policy wasn't properly updated. We need to completely drop and recreate all policies.

---

## ✅ IMMEDIATE FIX (Do This Now)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/oxiglgetwzjquzaibsyz/sql/new

### Step 2: Run This Complete Fix

Copy and paste this entire SQL script:

```sql
-- Complete RLS Policy Fix for users_profile table
-- This completely replaces all RLS policies

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can delete own profile" ON users_profile;

-- Recreate policies with proper permissions

-- Allow viewing all profiles (for leaderboards, etc.)
CREATE POLICY "Users can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (true);

-- Allow updating own profile only
CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CRITICAL: Allow inserting own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow deleting own profile
CREATE POLICY "Users can delete own profile"
  ON users_profile FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
```

### Step 3: Verify It Worked
You should see: **Success. No rows returned**

### Step 4: Check Current Policies
Run this diagnostic query to verify policies are correct:

```sql
-- Check all policies on users_profile table
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
WHERE tablename = 'users_profile';
```

You should see 4 policies:
1. ✅ "Users can view all profiles" - SELECT
2. ✅ "Users can update own profile" - UPDATE  
3. ✅ "Users can insert own profile" - INSERT (this is the critical one!)
4. ✅ "Users can delete own profile" - DELETE

### Step 5: Test Registration
1. Try registering as a **student** first (http://localhost:5173)
2. Then try registering as an **admin** (http://localhost:5173/admin-signup-secret-2024)

---

## 🔍 If Still Not Working - Debug Steps

### Debug 1: Check if RLS is enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users_profile';
```
Should return: `rowsecurity = true`

### Debug 2: Check table structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users_profile'
ORDER BY ordinal_position;
```

### Debug 3: Test INSERT permission directly
```sql
-- This will tell you if your current user can insert
SELECT has_table_privilege('users_profile', 'INSERT');
```

### Debug 4: Check auth.uid()
After logging in, run:
```sql
SELECT auth.uid();
```
This should return your user UUID. If it returns NULL, you're not authenticated properly.

---

## 🚨 Alternative Fix (If Above Doesn't Work)

If you're still getting the error, we may need to temporarily disable RLS for testing:

```sql
-- TEMPORARY: Disable RLS (DO NOT USE IN PRODUCTION!)
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
```

Then try registering. If it works, re-enable RLS:

```sql
-- Re-enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
```

This will tell us if the problem is specifically with RLS policies or something else in the signup code.

---

## 📝 What Changed From Previous Fix

**Previous fix:**
- Only tried to recreate the INSERT policy
- Didn't drop existing policies first
- Could have conflicting policies

**This fix:**
- ✅ Drops ALL existing policies first (clean slate)
- ✅ Recreates all 4 policies in correct order
- ✅ Explicitly verifies RLS is enabled
- ✅ Includes diagnostic queries to troubleshoot

---

## 💡 Understanding the Fix

The INSERT policy:
```sql
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

This means:
- **TO authenticated**: Only logged-in users can insert
- **WITH CHECK (auth.uid() = user_id)**: They can only insert a row where the `user_id` matches their auth ID
- This prevents users from creating profiles for other users
- But allows them to create their OWN profile during signup

---

## 📞 Next Steps

1. **Apply the complete SQL fix above**
2. **Run the diagnostic queries** to verify
3. **Test registration** for both student and admin
4. **Let me know if you see any errors** - share the exact error message

The diagnostic queries will help us pinpoint exactly what's wrong if the issue persists!
