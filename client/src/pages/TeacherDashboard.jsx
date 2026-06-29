import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, Star, TrendingUp, Plus, Edit, Trash2, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalViews: 0,
    totalStudents: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/course/teacher/courses');
      setCourses(res.data);

      // Calculate stats
      const totalCourses = res.data.length;
      const totalStudents = res.data.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
      const totalViews = res.data.reduce((sum, c) => sum + (c.views || 0), 0);
      
      let totalRating = 0;
      let totalReviews = 0;
      
      res.data.forEach(course => {
        if (course.reviews && course.reviews.length > 0) {
          totalRating += course.reviews.reduce((sum, r) => sum + r.rating, 0);
          totalReviews += course.reviews.length;
        }
      });

      const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

      setStats({
        totalCourses,
        totalViews,
        totalStudents,
        averageRating: parseFloat(avgRating),
      });
    } catch (error) {
      toast.error('Failed to load teacher dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`/course/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully');
      
      // Update stats after deletion
      setStats(prev => ({
        ...prev,
        totalCourses: prev.totalCourses - 1
      }));
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleEditCourse = (courseId, e) => {
    if (e) e.stopPropagation();
    navigate(`/edit-course/${courseId}`);
  };

  return (
    <div className="sh-page">
      <Navbar />

      <div className="sh-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="sh-heading text-3xl mb-1">Instructor dashboard</h1>
            <p className="sh-muted">Manage courses and track engagement.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => navigate('/teacher-quizzes')}>
              Quizzes
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/add-course')}>
              Create course
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Courses</p>
            <p className="text-2xl font-bold">{stats.totalCourses}</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Views</p>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Rating</p>
            <p className="text-2xl font-bold">{stats.averageRating || '0.0'}</p>
          </div>
        </div>

        {/* Your Courses Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Your Courses</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-gray-100 group cursor-pointer"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                        <button
                          onClick={(e) => handleEditCourse(course.id, e)}
                          className="bg-white text-purple-600 p-3 rounded-full hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCourse(course.id, e)}
                          className="bg-white text-red-600 p-3 rounded-full hover:bg-gray-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{course.title}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg text-xs">
                        <Star size={12} fill="currentColor" />
                        {course.reviews?.length > 0 
                          ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
                          : '0.0'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{course._count?.enrollments || 0}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-200">
                        <p className="text-sm font-bold text-gray-900">{course.views || 0}</p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{course._count?.reviews || 0}</p>
                        <p className="text-xs text-gray-500">Reviews</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {course.difficulty}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4 text-lg">You haven't created any courses yet</p>
              <Button
                variant="primary"
                onClick={() => navigate('/add-course')}
                className="inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Course
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
