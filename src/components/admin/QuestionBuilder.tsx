import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Question = Database['public']['Tables']['questions']['Row'];
type QuestionOption = Database['public']['Tables']['question_options']['Row'];

interface QuestionBuilderProps {
  quizId: string;
  question: Question | null;
  questionOrder: number;
  onClose: () => void;
  onSave: () => void;
}

export function QuestionBuilder({ quizId, question, questionOrder, onClose, onSave }: QuestionBuilderProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question_type: question?.question_type || 'single_select',
    question_text: question?.question_text || '',
    marks: question?.marks || 1,
    time_limit_seconds: question?.time_limit_seconds || null,
    difficulty: question?.difficulty || 'medium',
    allow_partial_marking: question?.allow_partial_marking || false,
    negative_marking: question?.negative_marking || 0,
    explanation: question?.explanation || '',
    hint: question?.hint || '',
    entrance_animation: question?.entrance_animation || 'fade_in',
    entrance_duration: question?.entrance_duration || 500,
  });

  const [options, setOptions] = useState<Partial<QuestionOption>[]>([
    { option_text: '', is_correct: false, option_order: 1 },
    { option_text: '', is_correct: false, option_order: 2 },
  ]);

  useEffect(() => {
    if (question) {
      loadOptions();
    }
  }, [question]);

  const loadOptions = async () => {
    if (!question) return;

    const { data } = await supabase
      .from('question_options')
      .select('*')
      .eq('question_id', question.id)
      .order('option_order');

    if (data && data.length > 0) {
      setOptions(data);
    }
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { option_text: '', is_correct: false, option_order: options.length + 1 },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    if (field === 'is_correct' && formData.question_type === 'single_select' && value) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }

    setOptions(newOptions);
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      alert('Please enter a question');
      return;
    }

    if (['single_select', 'multiple_select'].includes(formData.question_type)) {
      if (options.some(opt => !opt.option_text?.trim())) {
        alert('Please fill all options');
        return;
      }
      if (!options.some(opt => opt.is_correct)) {
        alert('Please mark at least one correct answer');
        return;
      }
    }

    setSaving(true);

    try {
      if (question) {
        const { error } = await supabase
          .from('questions')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', question.id);

        if (error) throw error;

        if (['single_select', 'multiple_select'].includes(formData.question_type)) {
          await supabase
            .from('question_options')
            .delete()
            .eq('question_id', question.id);

          await supabase
            .from('question_options')
            .insert(
              options.map((opt, idx) => ({
                question_id: question.id,
                option_text: opt.option_text!,
                is_correct: opt.is_correct,
                option_order: idx + 1,
                explanation: opt.explanation,
              }))
            );
        }
      } else {
        const { data: newQuestion, error } = await supabase
          .from('questions')
          .insert({
            ...formData,
            quiz_id: quizId,
            question_order: questionOrder,
          })
          .select()
          .single();

        if (error) throw error;

        if (newQuestion && ['single_select', 'multiple_select'].includes(formData.question_type)) {
          await supabase
            .from('question_options')
            .insert(
              options.map((opt, idx) => ({
                question_id: newQuestion.id,
                option_text: opt.option_text!,
                is_correct: opt.is_correct,
                option_order: idx + 1,
                explanation: opt.explanation,
              }))
            );
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {question ? 'Edit Question' : 'Add New Question'}
              </h1>
              <p className="text-sm text-gray-600">Configure question details and options</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({ ...formData, question_type: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="single_select">Single Select (MCQ)</option>
              <option value="multiple_select">Multiple Select (MSQ)</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="short_answer">Short Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter your question"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks
              </label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={formData.time_limit_seconds || ''}
                onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Optional"
              />
            </div>

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
          </div>

          {['single_select', 'multiple_select'].includes(formData.question_type) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Answer Options
                </label>
                <button
                  onClick={handleAddOption}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type={formData.question_type === 'single_select' ? 'radio' : 'checkbox'}
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (shown after answering)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Explain the correct answer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hint (optional)
            </label>
            <input
              type="text"
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Provide a hint to help students"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allow_partial_marking}
                onChange={(e) => setFormData({ ...formData, allow_partial_marking: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow partial marking</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
