import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, TrendingUp, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
type StudentResponse = Database['public']['Tables']['student_responses']['Row'];

interface QuizResultsProps {
  attemptId: string;
  onClose: () => void;
}

export function QuizResults({ attemptId, onClose }: QuizResultsProps) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    const { data: attemptData } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    const { data: responsesData } = await supabase
      .from('student_responses')
      .select('*')
      .eq('attempt_id', attemptId);

    if (attemptData) setAttempt(attemptData);
    if (responsesData) setResponses(responsesData);

    setLoading(false);
  };

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const grade = getGrade(attempt.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            attempt.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {attempt.passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {attempt.passed ? 'Congratulations!' : 'Quiz Completed'}
          </h1>
          <p className="text-xl text-gray-600">
            {attempt.passed ? 'You passed the quiz!' : 'Keep practicing to improve!'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{attempt.percentage.toFixed(1)}%</div>
              <div className="text-xl opacity-90">Your Score</div>
              <div className={`text-5xl font-bold mt-4 ${grade.color.replace('text-', 'text-white opacity-')}`}>
                Grade: {grade.grade}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{attempt.score}/{attempt.max_score}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{attempt.correct_answers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{attempt.wrong_answers}</div>
                <div className="text-sm text-gray-600">Wrong</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatTime(attempt.time_taken_seconds)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Correct Answers</span>
                    <span className="text-sm text-gray-600">
                      {attempt.correct_answers} / {attempt.total_questions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(attempt.correct_answers / attempt.total_questions) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Wrong Answers</span>
                    <span className="text-sm text-gray-600">
                      {attempt.wrong_answers} / {attempt.total_questions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(attempt.wrong_answers / attempt.total_questions) * 100}%` }}
                    />
                  </div>
                </div>

                {attempt.unattempted > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Unattempted</span>
                      <span className="text-sm text-gray-600">
                        {attempt.unattempted} / {attempt.total_questions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${(attempt.unattempted / attempt.total_questions) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>

          <div className="space-y-4">
            {attempt.passed ? (
              <>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Great Performance!</h3>
                    <p className="text-sm text-green-700">
                      You've successfully passed this quiz. Try more challenging quizzes to continue improving.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Browse More Quizzes
                </button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Keep Practicing</h3>
                    <p className="text-sm text-yellow-700">
                      Review the concepts and try again. You're making progress with each attempt!
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
