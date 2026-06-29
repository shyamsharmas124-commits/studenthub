import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Brain, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const AddQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
      }
    ],
    answers: [0], // Stores index of correct option for each question
  });

  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question: '', options: ['', '', '', ''] }],
      answers: [...quizData.answers, 0],
    });
  };

  const handleRemoveQuestion = (index) => {
    if (quizData.questions.length === 1) return;
    const newQuestions = [...quizData.questions];
    const newAnswers = [...quizData.answers];
    newQuestions.splice(index, 1);
    newAnswers.splice(index, 1);
    setQuizData({ ...quizData, questions: newQuestions, answers: newAnswers });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index].question = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const newAnswers = [...quizData.answers];
    newAnswers[qIndex] = oIndex;
    setQuizData({ ...quizData, answers: newAnswers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    const hasEmptyFields = quizData.questions.some(
      (q) => !q.question.trim() || q.options.some((o) => !o.trim())
    );

    if (hasEmptyFields) {
      toast.error('Please fill in all questions and options');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/quiz', quizData);
      toast.success('Quiz created successfully!');
      navigate('/teacher-quizzes');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/teacher-quizzes')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Quizzes
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={32} />
              <h1 className="text-3xl font-bold">Create New Quiz</h1>
            </div>
            <p className="opacity-80">Design an interactive assessment for your students</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* General Info */}
            <div className="space-y-6 mb-12">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  placeholder="e.g. Modern JavaScript Fundamentals"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                  placeholder="Briefly describe what this quiz covers"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-12">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Questions</h2>
              
              {quizData.questions.map((q, qIndex) => (
                <div key={qIndex} className="relative p-6 bg-gray-50/50 rounded-2xl border border-gray-100 animate-in slide-in-from-bottom-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition"
                    title="Remove Question"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      placeholder="Enter your question here"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl outline-none transition ${
                            quizData.answers[qIndex] === oIndex
                              ? 'border-green-500 bg-green-50/30'
                              : 'border-gray-100 focus:border-indigo-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                            quizData.answers[qIndex] === oIndex
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-indigo-300'
                          }`}
                        >
                          {quizData.answers[qIndex] === oIndex ? <CheckCircle2 size={14} /> : oIndex + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                className="w-full py-4 border-2 border-dashed border-gray-300 bg-transparent text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                onClick={handleAddQuestion}
              >
                <Plus size={20} />
                Add Another Question
              </Button>

              <div className="pt-8 border-t border-gray-100 flex gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Publish Quiz
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  onClick={() => navigate('/teacher-quizzes')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;
