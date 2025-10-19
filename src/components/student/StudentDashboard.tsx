import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LogOut, BookOpen, Trophy, TrendingUp, Clock, Award } from 'lucide-react';
import { QuizBrowser } from './QuizBrowser';
import { QuizAttempt } from './QuizAttempt';
import type { Database } from '../../lib/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

export function StudentDashboard() {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'history' | 'badges'>('browse');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    badgesEarned: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, max_score')
      .eq('user_id', profile.user_id)
      .eq('status', 'completed');

    const totalScore = attempts?.reduce((sum, a) => sum + a.score, 0) || 0;
    const totalMaxScore = attempts?.reduce((sum, a) => sum + a.max_score, 0) || 0;

    setStats({
      totalAttempts: attempts?.length || 0,
      averageScore: totalMaxScore ? (totalScore / totalMaxScore) * 100 : 0,
      badgesEarned: profile.badges_earned,
      currentStreak: profile.current_streak,
    });
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleEndQuiz = () => {
    setSelectedQuiz(null);
    loadStats();
  };

  if (selectedQuiz) {
    return <QuizAttempt quiz={selectedQuiz} onEnd={handleEndQuiz} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Quizzes Taken</h3>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Badges Earned</h3>
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.badgesEarned}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.currentStreak}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'browse'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Browse Quizzes
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'history'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                My History
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'badges'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                My Badges
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'browse' && (
              <QuizBrowser onStartQuiz={handleStartQuiz} />
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz History</h3>
                <p className="text-gray-600">Your quiz attempt history will appear here.</p>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">My Badges</h3>
                <p className="text-gray-600">Your earned badges and achievements will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
