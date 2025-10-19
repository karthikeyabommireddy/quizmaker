# 🎓 QuizMaster Pro - Advanced Interactive Quiz Platform

A full-featured quiz platform built with React, TypeScript, Supabase, and Tailwind CSS. Supports dual-role authentication (Admin & Student) with comprehensive quiz management and gamification features.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

### 👨‍🎓 Student Features
- 📚 Browse and search available quizzes
- ⏱️ Real-time countdown timer
- 🎯 Multiple question types (MCQ, MSQ, True/False, Fill-in-the-blank, Short Answer)
- 🚩 Flag questions for review
- 📊 Instant feedback and detailed results
- 🏆 Badge system and achievements
- 📈 Performance tracking and statistics
- ⭐ Difficulty-based filtering

### 👨‍💼 Admin Features
- ➕ Create and manage quizzes
- 📝 Question builder with rich options
- 🔀 Quiz settings (shuffle, time limits, feedback timing)
- 📋 Duplicate quizzes with all questions
- 📊 View quiz statistics and analytics
- ✅ Activate/deactivate quizzes
- 🎨 Question animations and transitions
- ⚙️ Advanced quiz configuration

### 🔐 Security
- Separate admin signup URL (restricted access)
- Row Level Security (RLS) with Supabase
- Secure authentication with email/password
- Role-based access control
- Protected routes and API calls

---

## 🏗️ Tech Stack

- **Frontend**: React 18.3.1, TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with RLS
- **Deployment**: Netlify (ready)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karthikeyabommireddy/quizmaker.git
   cd quizmaker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up database**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/20251019065558_create_quiz_system_schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173/
   ```

---

## 🔑 Access URLs

### Student Access (Public)
```
http://localhost:5173/
```
Anyone can sign up as a student.

### Admin Access (Restricted)
```
http://localhost:5173/admin-signup-secret-2024
```
⚠️ **Keep this URL secret!** Only share with authorized administrators.

> 💡 **Tip**: Change this URL in `src/App.tsx` line 10 to something unique.

---

## 📁 Project Structure

```
quizmaker/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── QuizBuilder.tsx
│   │   │   ├── QuizList.tsx
│   │   │   └── QuestionBuilder.tsx
│   │   ├── auth/           # Authentication components
│   │   │   └── AuthPage.tsx
│   │   └── student/        # Student dashboard components
│   │       ├── StudentDashboard.tsx
│   │       ├── QuizBrowser.tsx
│   │       ├── QuizAttempt.tsx
│   │       └── QuizResults.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   └── database.types.ts # TypeScript types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── netlify.toml           # Netlify configuration
├── .env.example           # Environment variables template
├── DEPLOYMENT.md          # Deployment guide
├── ADMIN_SETUP.md         # Admin setup instructions
└── package.json           # Dependencies

```

---

## 🗄️ Database Schema

### Tables
1. **users_profile** - User profiles and statistics
2. **quizzes** - Quiz metadata and settings
3. **questions** - Quiz questions
4. **question_options** - MCQ/MSQ answer options
5. **feedback_tiers** - Performance feedback tiers
6. **quiz_attempts** - Student attempt records
7. **student_responses** - Individual answers
8. **badges** - Achievement definitions
9. **user_badges** - User earned badges
10. **audit_log** - System activity logs

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

---

## 🌐 Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Login to [Netlify](https://app.netlify.com)
   - Import from GitHub
   - Select repository
   - Build settings are auto-configured via `netlify.toml`

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://your-site-name.netlify.app`

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎮 Usage Guide

### For Students

1. **Sign Up**
   - Visit the homepage
   - Click "Sign Up"
   - Fill in details (role will be "Student")
   - Verify email and login

2. **Take a Quiz**
   - Browse available quizzes
   - Click "Start Quiz"
   - Answer questions within time limit
   - Submit and view results

3. **Track Progress**
   - View statistics on dashboard
   - Earn badges for achievements
   - Maintain quiz streaks

### For Admins

1. **Sign Up** (Admin)
   - Visit the secret admin URL
   - Click "Sign Up"
   - Fill in details (role will be "Admin")
   - Login

2. **Create Quiz**
   - Click "Create Quiz"
   - Configure settings (duration, difficulty, etc.)
   - Add questions with options
   - Activate quiz

3. **Manage Quizzes**
   - Edit existing quizzes
   - Duplicate quizzes
   - View analytics
   - Activate/deactivate quizzes

---

## 🎨 Question Types Supported

- ✅ Single Select (MCQ)
- ✅ Multiple Select (MSQ)
- ✅ True/False
- ✅ Fill in the Blank
- ✅ Short Answer
- 🔄 Matching (schema ready)
- 🔄 Drag & Drop (schema ready)
- 🔄 Numerical (schema ready)
- 🔄 Matrix (schema ready)
- 🔄 Hotspot (schema ready)

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Separate admin signup URL
- ✅ Role-based access control
- ✅ Secure password hashing
- ✅ Environment variables for secrets
- ✅ HTTPS enforced (production)
- ✅ Security headers configured

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
- Verify `.env` file exists and has correct values
- Check Supabase project is active
- Ensure RLS policies are applied

### Authentication Problems
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify email confirmation (if enabled)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Karthikeya Bommireddy**

- GitHub: [@karthikeyabommireddy](https://github.com/karthikeyabommireddy)
- Repository: [quizmaker](https://github.com/karthikeyabommireddy/quizmaker)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend and authentication
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [ADMIN_SETUP.md](./ADMIN_SETUP.md) for admin configuration

---

## 🗺️ Roadmap

- [ ] Advanced analytics dashboard
- [ ] Export quiz results to CSV
- [ ] Quiz scheduling/timed release
- [ ] Question bank management
- [ ] Bulk question import
- [ ] Real-time leaderboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Dark mode

---

## ⭐ Star this repository if you find it helpful!

Made with ❤️ by Karthikeya Bommireddy
