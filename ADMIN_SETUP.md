# Admin Access Setup

## 🔐 Admin Registration URL

To create an administrator account, use the following special URL:

```
http://localhost:5173/admin-signup-secret-2024
```

**For Production:**
```
https://yourdomain.com/admin-signup-secret-2024
```

---

## 🚨 Security Notice

⚠️ **IMPORTANT:** This URL should be kept confidential and only shared with authorized personnel who need administrator access.

### Best Practices:

1. **Change the URL Path**: Edit the path in `src/App.tsx` line 10 to something unique and hard to guess:
   ```typescript
   const isAdminSignupPage = window.location.pathname === '/your-custom-secret-path-here';
   ```

2. **Share Securely**: Only share this URL through secure channels (encrypted messages, password managers, etc.)

3. **Monitor Admin Accounts**: Regularly review the list of admin accounts in your database

4. **Rotate the URL**: Consider changing the admin signup path periodically

---

## 📋 How It Works

- **Regular Signup** (`/` or any path): Only allows student registration
- **Admin Signup** (`/admin-signup-secret-2024`): Allows administrator registration
- **Login**: Works the same way for both admins and students

---

## 🔄 Changing the Admin Signup Path

1. Open `src/App.tsx`
2. Find line 10:
   ```typescript
   const isAdminSignupPage = window.location.pathname === '/admin-signup-secret-2024';
   ```
3. Replace `/admin-signup-secret-2024` with your custom path
4. Save the file

Example:
```typescript
const isAdminSignupPage = window.location.pathname === '/my-super-secret-admin-path-2024';
```

---

## 👥 User Roles

### Student (Default)
- Can browse and take quizzes
- Can view their own results and history
- Can earn badges and achievements
- Cannot create or manage quizzes

### Administrator
- Can create, edit, and delete quizzes
- Can view all quiz attempts and analytics
- Can manage questions and quiz settings
- Full access to admin dashboard

---

## 🆘 Support

If you need to grant someone admin access:
1. Share the admin signup URL with them securely
2. Have them create an account using that URL
3. Verify their account was created with admin role in your Supabase dashboard

To check user roles in Supabase:
1. Go to your Supabase Dashboard
2. Navigate to Table Editor → `users_profile`
3. Look at the `role` column to verify admin accounts
