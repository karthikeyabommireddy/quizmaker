import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ArrowRight, Clock, Flag, CheckCircle, XCircle } from 'lucide-react';
import { QuizResults } from './QuizResults';
import type { Database } from '../../lib/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type QuestionOption = Database['public']['Tables']['question_options']['Row'];

interface QuestionWithOptions extends Question {
  question_options: QuestionOption[];
}

interface QuizAttemptProps {
  quiz: Quiz;
  onEnd: () => void;
}

export function QuizAttempt({ quiz, onEnd }: QuizAttemptProps) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration_minutes * 60);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
    explanation: string;
  } | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeQuiz();
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const initializeQuiz = async () => {
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .eq('quiz_id', quiz.id)
      .order('question_order');

    if (questionsData) {
      const shuffled = quiz.shuffle_questions
        ? questionsData.sort(() => Math.random() - 0.5)
        : questionsData;

      setQuestions(shuffled as QuestionWithOptions[]);

      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          user_id: profile!.user_id,
          attempt_number: 1,
          max_score: quiz.total_marks,
          total_questions: questionsData.length,
        })
        .select()
        .single();

      if (attempt) {
        setAttemptId(attempt.id);
      }
    }

    setLoading(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: any) => {
    // Don't allow changing answer after submission
    if (submittedAnswers.has(currentQuestion.id)) {
      return;
    }
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleSubmitAnswer = () => {
    const answer = answers[currentQuestion.id];
    if (!answer && answer !== 0) {
      return; // No answer selected
    }

    // Mark this question as submitted
    setSubmittedAnswers(new Set(submittedAnswers).add(currentQuestion.id));

    // Check answer and show feedback
    if (quiz.show_feedback === 'immediate') {
      checkAnswer(answer);
    }
  };

  const checkAnswer = (answer: any) => {
    const question = currentQuestion;
    let isCorrect = false;

    if (question.question_type === 'single_select') {
      const selectedOption = question.question_options.find(opt => opt.id === answer);
      isCorrect = selectedOption?.is_correct || false;
    } else if (question.question_type === 'multiple_select') {
      const correctIds = question.question_options
        .filter(opt => opt.is_correct)
        .map(opt => opt.id)
        .sort();
      const selectedIds = (answer as string[]).sort();
      isCorrect = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
    }

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Great job!' : 'Not quite right',
      explanation: question.explanation || '',
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedback(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (quiz.allow_navigation && currentIndex > 0) {
      setShowFeedback(false);
      setFeedback(null);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlagged(newFlagged);
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;

    for (const question of questions) {
      const answer = answers[question.id];
      let isCorrect = false;
      let marksAwarded = 0;

      if (question.question_type === 'single_select') {
        const selectedOption = question.question_options.find(opt => opt.id === answer);
        isCorrect = selectedOption?.is_correct || false;
        marksAwarded = isCorrect ? question.marks : -question.negative_marking;
      } else if (question.question_type === 'multiple_select') {
        const correctIds = question.question_options
          .filter(opt => opt.is_correct)
          .map(opt => opt.id)
          .sort();
        const selectedIds = ((answer || []) as string[]).sort();
        isCorrect = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
        marksAwarded = isCorrect ? question.marks : -question.negative_marking;
      }

      if (isCorrect) correctCount++;
      else if (answer) wrongCount++;

      totalScore += Math.max(0, marksAwarded);

      await supabase.from('student_responses').insert({
        attempt_id: attemptId,
        question_id: question.id,
        user_answer: typeof answer === 'string' ? answer : null,
        selected_options: Array.isArray(answer) ? answer : null,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        time_taken_seconds: 0,
        is_flagged: flagged.has(question.id),
      });
    }

    const percentage = (totalScore / quiz.total_marks) * 100;
    const passed = percentage >= quiz.passing_percentage;

    await supabase
      .from('quiz_attempts')
      .update({
        status: 'completed',
        score: totalScore,
        percentage,
        passed,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unattempted: questions.length - correctCount - wrongCount,
        time_taken_seconds: (quiz.duration_minutes * 60) - timeRemaining,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    await supabase
      .from('users_profile')
      .update({
        total_quizzes_taken: profile!.total_quizzes_taken + 1,
        total_score: profile!.total_score + totalScore,
      })
      .eq('user_id', profile!.user_id);

    setQuizCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizCompleted) {
    return <QuizResults attemptId={attemptId!} onClose={onEnd} />;
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  onEnd();
                }
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Exit Quiz</span>
            </button>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-gray-600">{answeredCount} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                  {currentQuestion.marks} marks
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg capitalize">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {currentQuestion.question_text}
              </h2>

              {currentQuestion.hint && (
                <p className="text-sm text-gray-600 italic">
                  Hint: {currentQuestion.hint}
                </p>
              )}
            </div>

            <button
              onClick={toggleFlag}
              className={`p-2 rounded-lg transition ${
                flagged.has(currentQuestion.id)
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.question_type === 'single_select' && (
              <>
                {currentQuestion.question_options.map((option) => {
                  const isSubmitted = submittedAnswers.has(currentQuestion.id);
                  const isSelected = answers[currentQuestion.id] === option.id;
                  const isCorrect = option.is_correct;
                  
                  return (
                    <label
                      key={option.id}
                      className={`block p-4 border-2 rounded-lg transition ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-gray-50'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50 cursor-pointer'
                          : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      } ${isSubmitted ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          checked={isSelected}
                          onChange={() => handleAnswer(option.id)}
                          disabled={isSubmitted}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-gray-900">{option.option_text}</span>
                          {isSubmitted && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {isSubmitted && !isCorrect && isSelected && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </>
            )}

            {currentQuestion.question_type === 'multiple_select' && (
              <>
                {currentQuestion.question_options.map((option) => {
                  const currentAnswers = (answers[currentQuestion.id] || []) as string[];
                  const isSelected = currentAnswers.includes(option.id);
                  const isSubmitted = submittedAnswers.has(currentQuestion.id);
                  const isCorrect = option.is_correct;

                  return (
                    <label
                      key={option.id}
                      className={`block p-4 border-2 rounded-lg transition ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-gray-50'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50 cursor-pointer'
                          : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      } ${isSubmitted ? 'cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newAnswers = e.target.checked
                              ? [...currentAnswers, option.id]
                              : currentAnswers.filter(id => id !== option.id);
                            handleAnswer(newAnswers);
                          }}
                          disabled={isSubmitted}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-gray-900">{option.option_text}</span>
                          {isSubmitted && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {isSubmitted && !isCorrect && isSelected && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </>
            )}
          </div>

          {showFeedback && feedback && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedback.correct ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {feedback.correct ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${
                    feedback.correct ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {feedback.message}
                  </p>
                  {feedback.explanation && (
                    <p className={`text-sm ${
                      feedback.correct ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {feedback.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={!quiz.allow_navigation || currentIndex === 0}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {!submittedAnswers.has(currentQuestion.id) ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answers[currentQuestion.id] && answers[currentQuestion.id] !== 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Answer
                </button>
              ) : currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Question Palette</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  if (quiz.allow_navigation) {
                    setCurrentIndex(idx);
                    setShowFeedback(false);
                    setFeedback(null);
                  }
                }}
                disabled={!quiz.allow_navigation}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                  idx === currentIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700'
                    : flagged.has(q.id)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!quiz.allow_navigation ? 'cursor-not-allowed' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
