# 🚨 URGENT FIX NEEDED - Apply This SQL Now!

## ❌ Error You're Getting:
```
new row violates row-level security policy for table "users_profile"
```

## ✅ Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/oxiglgetwzjquzaibsyz/sql/new

### Step 2: Copy This SQL
```sql
-- Fix RLS policy for signup
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Run It
- Paste the SQL in the editor
- Click "Run" button
- Wait for "Success. No rows returned"

### Step 4: Test
- Try registering as admin or student
- Should work now! ✅

---

## 🎯 What This Does

**Problem**: RLS policy was blocking profile creation during signup

**Solution**: Allows authenticated users to create their own profile

**Security**: Users can ONLY create profiles for themselves (auth.uid() = user_id)

---

## 📱 After Applying

Registration will work for:
- ✅ Admin signup (`/admin-signup-secret-2024`)
- ✅ Student signup (homepage)

---

## 📚 Full Documentation

See `RLS_FIX.md` for complete details and troubleshooting.

---

## ⏱️ Time Required

- **Apply Fix**: 2 minutes
- **Test**: 1 minute
- **Total**: 3 minutes

---

**DO THIS NOW** → Then try registering again! 🚀
