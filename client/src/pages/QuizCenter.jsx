import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Trophy, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const QuizCenter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startQuizId = searchParams.get('quiz');
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (startQuizId && !activeQuiz) {
      startQuiz(startQuizId);
    }
  }, [startQuizId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/quiz/leaderboard');
      setLeaderboard(res.data);
    } catch {
      // Leaderboard is optional
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/quiz');
      setQuizzes(res.data);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/quiz/${id}`);
      setActiveQuiz(res.data);
      setUserAnswers(new Array(res.data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setResult(null);
    } catch (error) {
      toast.error('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (userAnswers.includes(null)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`/quiz/${activeQuiz.id}/submit`, { userAnswers });
      setResult(res.data);
      if (res.data.percentage === 100) {
        toast.success('Perfect Score! Achievement Unlocked!', { icon: '🏆' });
      }
      fetchLeaderboard();
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {!activeQuiz ? (
          <>
            <div className="text-center mb-12">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Brain className="text-white" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quiz Center</h1>
              <p className="text-gray-600">Test your knowledge and earn achievement badges</p>
            </div>

            <div className="grid gap-6">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center gap-4"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-green-500" />
                          {quiz.questions.length} Questions
                        </span>
                        <span>By {quiz.creator?.name}</span>
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => startQuiz(quiz.id)}>
                      Start Quiz
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No quizzes available at the moment.</p>
                </div>
              )}
            </div>

            {leaderboard.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy size={24} className="text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{entry.user?.name}</p>
                          <p className="text-xs text-gray-500">{entry.quiz?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{entry.percentage}%</p>
                        <p className="text-xs text-gray-500">{entry.score}/{entry.totalQuestions} correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : result ? (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-yellow-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-8">Great job on finishing the quiz.</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-2xl font-bold text-indigo-600">{result.score}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Correct</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-2xl font-bold text-indigo-600">{result.totalQuestions}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-2xl font-bold text-indigo-600">{result.percentage}%</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => startQuiz(activeQuiz.id)}>
                Retry Quiz
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setActiveQuiz(null)}>
                Back to Center
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </span>
                <span className="text-xs text-gray-400">
                  {activeQuiz.title}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {activeQuiz.questions[currentQuestionIndex].question}
              </h2>

              <div className="grid gap-4 mb-12">
                {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`p-4 rounded-xl border-2 text-left transition flex items-center justify-between group ${
                      userAnswers[currentQuestionIndex] === idx
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      userAnswers[currentQuestionIndex] === idx
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300 group-hover:border-indigo-300'
                    }`}>
                      {userAnswers[currentQuestionIndex] === idx && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 disabled:opacity-0 transition font-medium"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmitQuiz}
                    loading={submitting}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex items-center gap-2 text-indigo-600 hover:gap-3 transition-all font-bold"
                  >
                    Next Question
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCenter;
