import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Brain, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const TeacherQuizzes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/quiz/teacher');
      setQuizzes(res.data);
    } catch (error) {
      toast.error('Failed to load your quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await axios.delete(`/quiz/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600">Create and manage interactive quizzes for students</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => navigate('/add-quiz')}
          >
            <Plus size={20} />
            Create New Quiz
          </Button>
        </div>

        <div className="grid gap-6">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mb-1">{quiz.description}</p>
                    <div className="flex gap-4 text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-green-500" />
                        {quiz.questions.length} Questions
                      </span>
                      <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition font-semibold"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Brain size={64} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes created yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first interactive quiz for students.</p>
              <Button variant="primary" onClick={() => navigate('/add-quiz')}>
                Create First Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherQuizzes;
