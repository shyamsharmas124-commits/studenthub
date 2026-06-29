import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    recommendedCourses: [],
    stats: {
      totalEnrolled: 0,
      lessonsCompleted: 0,
      currentStreak: 0,
      averageRating: 0,
    }
  });

  useEffect(() => {
    if (!user) return;

    if (!user.role) {
      navigate('/role');
      return;
    }

    if (user.role === 'TEACHER') {
      navigate('/teacher-dashboard');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [enrollmentsRes, recommendationsRes, progressRes, streakRes] = await Promise.allSettled([
        axios.get('/enrollment'),
        axios.get('/course/recommendations'),
        axios.get('/progress'),
        axios.get('/progress/streak'),
      ]);

      const enrollments = enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value.data : [];
      const progressList = progressRes.status === 'fulfilled' ? progressRes.value.data : [];
      const recommendedCourses = recommendationsRes.status === 'fulfilled' ? recommendationsRes.value.data : [];
      const streak = streakRes.status === 'fulfilled' ? streakRes.value.data?.currentStreak || 0 : 0;

      const enrolledCourses = enrollments
        .filter((e) => e.course)
        .map((e) => {
          const progress = progressList.find((p) => p.courseId === e.courseId);
          return {
            ...e.course,
            completionPercentage: progress?.completionPercentage || 0,
            lessonsCompleted: progress?.lessonsCompleted || 0,
          };
        });

      const totalLessons = progressList.reduce((sum, p) => sum + (p.lessonsCompleted || 0), 0);

      let fallbackRecommended = recommendedCourses;
      if (!fallbackRecommended.length) {
        try {
          const coursesRes = await axios.get('/course');
          fallbackRecommended = coursesRes.data.slice(0, 3);
        } catch {
          // keep empty
        }
      }

      setDashboardData({
        enrolledCourses,
        recommendedCourses: fallbackRecommended,
        stats: {
          totalEnrolled: enrolledCourses.length,
          lessonsCompleted: totalLessons,
          currentStreak: streak,
          averageRating: 4.5,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (courseId, e) => {
    e.stopPropagation();
    try {
      await axios.post('/enrollment/bookmark', { courseId });
      toast.success('Added to bookmarks!');
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  return (
    <div className="sh-page">
      <Navbar />

      <div className="sh-container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="sh-heading text-3xl mb-1">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="sh-muted">Pick up where you left off.</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/quizzes')}>
            Quiz center
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Enrolled</p>
            <p className="text-2xl font-bold">{dashboardData.stats.totalEnrolled}</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Lessons done</p>
            <p className="text-2xl font-bold">{dashboardData.stats.lessonsCompleted}</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Streak</p>
            <p className="text-2xl font-bold">{dashboardData.stats.currentStreak} days</p>
          </div>
          <div className="sh-card p-4">
            <p className="text-xs font-bold uppercase sh-muted mb-1">Avg rating</p>
            <p className="text-2xl font-bold">{dashboardData.stats.averageRating}</p>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Courses</h2>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/courses')}
            >
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-2xl h-72 animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData.enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.enrolledCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="sh-card p-4 cursor-pointer hover:shadow-md"
                >
                  <h3 className="font-bold text-sm line-clamp-2 mb-2">{course.title}</h3>
                  <div className="h-1.5 bg-[#d1d7dc] mb-2">
                    <div className="h-full bg-[#0f7c90]" style={{ width: `${course.completionPercentage || 0}%` }} />
                  </div>
                  <p className="text-xs sh-muted">{course.completionPercentage || 0}% complete</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No courses enrolled yet</p>
              <Button
                variant="primary"
                onClick={() => navigate('/courses')}
              >
                Explore Courses
              </Button>
            </div>
          )}
        </div>

        {/* Recommended Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-purple-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recommended for You</h2>
          </div>

          {dashboardData.recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.recommendedCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-600"></div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleBookmark(course.id, e)}
                      >
                        + Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No recommendations available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
