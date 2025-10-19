import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Plus, Settings, MessageSquare } from 'lucide-react';
import { QuestionBuilder } from './QuestionBuilder';
import type { Database } from '../../lib/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

interface QuizBuilderProps {
  quiz: Quiz | null;
  onClose: () => void;
}

export function QuizBuilder({ quiz, onClose }: QuizBuilderProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'feedback'>('settings');
  const [saving, setSaving] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(quiz);

  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    difficulty: quiz?.difficulty || 'medium',
    duration_minutes: quiz?.duration_minutes || 30,
    shuffle_questions: quiz?.shuffle_questions || false,
    shuffle_options: quiz?.shuffle_options || false,
    show_feedback: quiz?.show_feedback || 'immediate',
    allow_review: quiz?.allow_review !== false,
    allow_navigation: quiz?.allow_navigation !== false,
    passing_percentage: quiz?.passing_percentage || 50,
    max_attempts: quiz?.max_attempts || null,
    category: quiz?.category || '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (currentQuiz) {
      loadQuestions();
    }
  }, [currentQuiz]);

  const loadQuestions = async () => {
    if (!currentQuiz) return;

    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', currentQuiz.id)
      .order('question_order');

    if (data) {
      setQuestions(data);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      if (currentQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentQuiz.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            ...formData,
            created_by: profile?.user_id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setCurrentQuiz(data);
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuiz) {
      alert('Please save quiz settings first');
      return;
    }
    setEditingQuestion(null);
    setShowQuestionBuilder(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionBuilder(true);
  };

  const handleQuestionSaved = () => {
    setShowQuestionBuilder(false);
    setEditingQuestion(null);
    loadQuestions();
    updateQuizStats();
  };

  const updateQuizStats = async () => {
    if (!currentQuiz) return;

    const { data: questionData } = await supabase
      .from('questions')
      .select('marks')
      .eq('quiz_id', currentQuiz.id);

    if (questionData) {
      const totalMarks = questionData.reduce((sum, q) => sum + q.marks, 0);
      await supabase
        .from('quizzes')
        .update({
          total_questions: questionData.length,
          total_marks: totalMarks,
        })
        .eq('id', currentQuiz.id);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (!error) {
      loadQuestions();
      updateQuizStats();
    }
  };

  if (showQuestionBuilder) {
    return (
      <QuestionBuilder
        quizId={currentQuiz!.id}
        question={editingQuestion}
        questionOrder={questions.length + 1}
        onClose={() => setShowQuestionBuilder(false)}
        onSave={handleQuestionSaved}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {quiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>
                <p className="text-sm text-gray-600">Configure your quiz settings and questions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Questions ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'feedback'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Feedback Tiers
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Describe your quiz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Percentage
                    </label>
                    <input
                      type="number"
                      value={formData.passing_percentage}
                      onChange={(e) => setFormData({ ...formData, passing_percentage: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attempts (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.max_attempts || ''}
                      onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show Feedback
                  </label>
                  <select
                    value={formData.show_feedback}
                    onChange={(e) => setFormData({ ...formData, show_feedback: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="immediate">Immediately after each answer</option>
                    <option value="after_submission">After submitting all answers</option>
                    <option value="at_end">At the end of quiz</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.shuffle_questions}
                      onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Shuffle questions</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.shuffle_options}
                      onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Shuffle answer options</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allow_review}
                      onChange={(e) => setFormData({ ...formData, allow_review: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow students to review answers</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allow_navigation}
                      onChange={(e) => setFormData({ ...formData, allow_navigation: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow navigation between questions</span>
                  </label>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving || !formData.title}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
                  <button
                    onClick={handleAddQuestion}
                    disabled={!currentQuiz}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                {!currentQuiz ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Save quiz settings first to add questions</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-12">
                    <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-600">Add your first question to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Q{index + 1}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                {question.marks} marks
                              </span>
                              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 capitalize">
                                {question.question_type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-900">{question.question_text}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback Tiers</h3>
                <p className="text-gray-600">Configure time-based performance feedback tiers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
