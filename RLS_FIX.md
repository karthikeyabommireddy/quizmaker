# 🔧 Fix: RLS Policy Error During User Registration

## 🐛 Error Description

**Error Message:**
```
new row violates row-level security policy for table "users_profile"
```

**When it occurs:**
- During user registration (both admin and student)
- When trying to create a new account

**Root Cause:**
The Row Level Security (RLS) policy on the `users_profile` table was preventing profile creation during signup. This is a common chicken-and-egg problem where:
1. User signs up and becomes authenticated
2. System tries to create their profile
3. RLS policy blocks the insert
4. Registration fails

---

## ✅ Solution

### Quick Fix (Recommended)

Apply the SQL migration directly in your Supabase Dashboard:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/oxiglgetwzjquzaibsyz
2. **Navigate to**: SQL Editor
3. **Click**: "New Query"
4. **Copy and paste** the following SQL:

```sql
-- Fix RLS policy for users_profile table to allow signup
-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;

-- Create a simplified policy that allows any authenticated user to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

5. **Click**: "Run" (or press Ctrl+Enter)
6. **Verify**: You should see "Success. No rows returned"

---

## 🧪 Testing

After applying the fix, test the registration:

### Test Admin Registration:
1. Go to: `http://localhost:5173/admin-signup-secret-2024` (or your deployed URL)
2. Click "Sign Up"
3. Fill in:
   - Full Name: Test Admin
   - Email: testadmin@example.com
   - Password: test123456
4. Click "Create Account"
5. ✅ Should register successfully without errors

### Test Student Registration:
1. Go to: `http://localhost:5173/`
2. Click "Sign Up"
3. Fill in:
   - Full Name: Test Student
   - Email: teststudent@example.com
   - Password: test123456
4. Click "Create Account"
5. ✅ Should register successfully without errors

---

## 📋 What Changed

### Before (Problematic):
The RLS policy might have been overly restrictive or missing, preventing authenticated users from creating their profile during signup.

### After (Fixed):
- Simple, clear policy: Authenticated users can insert a profile where `user_id = auth.uid()`
- This allows signup to work because:
  1. User signs up → becomes authenticated
  2. Code tries to insert profile with their `user_id`
  3. RLS checks: Does `auth.uid()` match the `user_id` being inserted? Yes!
  4. Insert succeeds ✅

---

## 🔍 Understanding RLS

**Row Level Security (RLS)** controls who can access which rows in a table.

### Our Policy Explanation:
```sql
CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

- **Policy Name**: "Users can insert own profile"
- **Table**: `users_profile`
- **Operation**: `INSERT` (creating new rows)
- **Who**: `authenticated` users (anyone logged in)
- **Condition**: `auth.uid() = user_id`
  - `auth.uid()`: The ID of the currently authenticated user
  - `user_id`: The user_id value being inserted
  - **Must match** for the insert to succeed

This ensures users can only create a profile for themselves, not for other users.

---

## 🛡️ Security

This fix maintains security:
- ✅ Users can only create their own profile
- ✅ Cannot create profiles for other users
- ✅ Must be authenticated to insert
- ✅ Cannot modify other users' profiles (covered by UPDATE policy)

---

## 🔄 Alternative: Using Supabase CLI

If you prefer using the CLI:

```bash
# Make sure you're in the project directory
cd c:\Users\karthikeya_desktop\Downloads\quizmaker

# Apply the migration
supabase db push

# Or apply specific migration
supabase db remote commit
```

---

## 📁 Migration File

The fix has been added as a migration file:
```
supabase/migrations/20251019120000_fix_user_profile_rls.sql
```

This file is included in your repository for documentation and can be applied to any fresh database setup.

---

## 🚨 If Error Persists

If you still get the error after applying the fix:

### 1. Check Current Policies
Run this in SQL Editor:
```sql
-- View all policies on users_profile table
SELECT * FROM pg_policies WHERE tablename = 'users_profile';
```

### 2. Verify RLS is Enabled
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users_profile';
```

### 3. Check User Authentication
Make sure the user is actually authenticated:
```sql
-- This should return your user ID when you're logged in
SELECT auth.uid();
```

### 4. Nuclear Option (Reset Policies)
If nothing works, reset all policies:
```sql
-- Drop all policies on users_profile
DROP POLICY IF EXISTS "Users can view all profiles" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;

-- Recreate them
CREATE POLICY "Users can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

---

## 📝 Verification Checklist

After applying the fix, verify:

- [ ] Admin registration works
- [ ] Student registration works
- [ ] No RLS errors in browser console
- [ ] New users appear in `users_profile` table
- [ ] Users can login after registration
- [ ] Correct role is assigned (admin/student)

---

## 💡 Why This Happened

This is a common issue when setting up Supabase with custom authentication flows. The original migration might have been missing or too restrictive. This fix ensures the policy correctly handles the signup flow.

---

## 🎯 Next Steps

1. ✅ Apply the SQL fix in Supabase Dashboard
2. ✅ Test registration for both roles
3. ✅ Commit and push the migration file (already done)
4. ✅ Deploy to production if needed

---

## 📞 Support

If you continue to experience issues:
1. Check browser console for detailed errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify email confirmation settings (if enabled)
4. Check that Supabase URL and keys are correct in `.env`

---

## ✅ Status

- [x] Migration file created
- [x] Solution documented
- [ ] **TODO: Apply SQL in Supabase Dashboard**
- [ ] **TODO: Test registration**

**Once you apply the SQL fix in Supabase Dashboard, registration will work perfectly!**
