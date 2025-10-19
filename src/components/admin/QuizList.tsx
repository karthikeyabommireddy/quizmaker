import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Edit, Trash2, Copy, Archive, Play, BarChart3 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface QuizListProps {
  onEdit: (quiz: Quiz) => void;
  onRefresh: () => void;
}

export function QuizList({ onEdit, onRefresh }: QuizListProps) {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, [profile]);

  const loadQuizzes = async () => {
    if (!profile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('created_by', profile.user_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (!error) {
      loadQuizzes();
      onRefresh();
    }
  };

  const handleToggleActive = async (quiz: Quiz) => {
    const { error } = await supabase
      .from('quizzes')
      .update({ is_active: !quiz.is_active })
      .eq('id', quiz.id);

    if (!error) {
      loadQuizzes();
      onRefresh();
    }
  };

  const handleDuplicate = async (quiz: Quiz) => {
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        ...quiz,
        id: undefined,
        title: `${quiz.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
      })
      .select()
      .single();

    if (!quizError && newQuiz) {
      const { data: questions } = await supabase
        .from('questions')
        .select('*, question_options(*)')
        .eq('quiz_id', quiz.id);

      if (questions) {
        for (const question of questions) {
          const { data: newQuestion, error: questionError } = await supabase
            .from('questions')
            .insert({
              ...question,
              id: undefined,
              quiz_id: newQuiz.id,
              created_at: undefined,
              updated_at: undefined,
            })
            .select()
            .single();

          if (!questionError && newQuestion && question.question_options) {
            await supabase
              .from('question_options')
              .insert(
                question.question_options.map((opt: any) => ({
                  ...opt,
                  id: undefined,
                  question_id: newQuestion.id,
                  created_at: undefined,
                }))
              );
          }
        }
      }

      loadQuizzes();
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
        <p className="text-gray-600">Create your first quiz to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    quiz.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {quiz.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 capitalize">
                  {quiz.difficulty}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {quiz.total_questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {quiz.total_marks} marks
                </span>
                <span className="flex items-center gap-1">
                  <Archive className="w-4 h-4" />
                  {quiz.duration_minutes} min
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleToggleActive(quiz)}
                className="p-2 text-gray-600 hover:bg-white rounded-lg transition"
                title={quiz.is_active ? 'Deactivate' : 'Activate'}
              >
                <Play className={`w-4 h-4 ${quiz.is_active ? 'text-green-600' : ''}`} />
              </button>
              <button
                onClick={() => onEdit(quiz)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDuplicate(quiz)}
                className="p-2 text-gray-600 hover:bg-white rounded-lg transition"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(quiz.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
