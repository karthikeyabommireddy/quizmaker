# 🚀 Deployment Guide - Netlify

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Netlify account (sign up at https://netlify.com)
- ✅ Supabase project with database setup

---

## 🔧 Step 1: Push to GitHub

Your code is ready to push. Follow these steps:

```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Quiz Platform with admin signup"

# Add remote repository
git remote add origin https://github.com/karthikeyabommireddy/quizmaker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Netlify

### Option A: Using Netlify Dashboard (Recommended)

1. **Login to Netlify**: https://app.netlify.com
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub**: Select your repository `karthikeyabommireddy/quizmaker`
4. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - (These are already set in `netlify.toml`)
5. **Add Environment Variables**:
   - Go to **Site settings** → **Environment variables**
   - Add the following:
     - `VITE_SUPABASE_URL` = `https://oxiglgetwzjquzaibsyz.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-from-.env-file`
6. **Click "Deploy site"**

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Deploy
netlify deploy --prod
```

---

## 🔐 Step 3: Set Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** → **Environment variables** → **Add a variable**
2. Add these variables:

```
VITE_SUPABASE_URL = https://oxiglgetwzjquzaibsyz.supabase.co
VITE_SUPABASE_ANON_KEY = [your-anon-key-here]
```

⚠️ **Important**: Get your anon key from the `.env` file (don't commit this file!)

---

## 🎯 Step 4: Update Admin Signup URL

After deployment, your admin signup URL will be:

```
https://your-site-name.netlify.app/admin-signup-secret-2024
```

### Optional: Use Custom Domain

1. In Netlify Dashboard → **Domain management**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Your admin URL will be: `https://yourdomain.com/admin-signup-secret-2024`

---

## ✅ Step 5: Configure Supabase

### Update Supabase URL Settings

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Scroll to **Site URL Configuration**
3. Add your Netlify URL:
   ```
   https://your-site-name.netlify.app
   ```
4. In **Redirect URLs**, add:
   ```
   https://your-site-name.netlify.app/**
   ```

This ensures authentication redirects work correctly.

---

## 🧪 Step 6: Test Your Deployment

### Test Student Signup
1. Visit: `https://your-site-name.netlify.app/`
2. Click "Sign Up"
3. Verify only "Student" option is visible
4. Create a test student account

### Test Admin Signup
1. Visit: `https://your-site-name.netlify.app/admin-signup-secret-2024`
2. Click "Sign Up"
3. Verify purple theme and admin registration
4. Create a test admin account

### Test Login
1. Login with student account → Should see Student Dashboard
2. Login with admin account → Should see Admin Dashboard

---

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push

# Netlify will automatically build and deploy!
```

---

## 🛠️ Troubleshooting

### Build Fails
- Check build logs in Netlify Dashboard
- Ensure environment variables are set correctly
- Verify `node_modules` is in `.gitignore`

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding environment variables
- Clear cache and redeploy if needed

### Routes Not Working (404 errors)
- Check `netlify.toml` exists with correct redirects
- The redirect rule `/* → /index.html` is crucial for SPA

### Authentication Issues
- Verify Supabase URL and anon key
- Check Supabase redirect URLs include your Netlify domain
- Look at browser console for errors

---

## 📊 Monitoring

### Netlify Analytics
- Site settings → Analytics
- Track visitors, page views, bandwidth

### Supabase Logs
- Supabase Dashboard → Logs
- Monitor authentication, database queries

### Check Database
- Regularly check `users_profile` table
- Monitor admin account creation
- Review quiz attempts and responses

---

## 🔒 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ Environment variables set in Netlify
- ✅ Admin signup URL is secret
- ✅ Supabase RLS policies are enabled
- ✅ HTTPS is enabled (automatic with Netlify)
- ✅ Security headers configured in `netlify.toml`

---

## 📚 Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

## 🆘 Need Help?

1. Check Netlify build logs
2. Check browser console for errors
3. Review Supabase logs
4. Check network tab for API errors

---

## 🎉 You're Done!

Your quiz platform is now live and ready to use!

**Student URL**: `https://your-site-name.netlify.app/`
**Admin URL**: `https://your-site-name.netlify.app/admin-signup-secret-2024` (Keep secret!)
