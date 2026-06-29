import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Eye, Star, BarChart3, Award, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/analytics/teacher');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
      navigate('/teacher-dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!stats) {
    return null;
  }

  // Helper values for custom SVG Line chart (Past 30 Days daily enrollments)
  const timelineData = stats.enrollmentTimeline || [];
  const maxEnrollmentValue = Math.max(...timelineData.map(d => d.count), 5); // Fallback limit to prevent divide-by-zero
  const chartWidth = 700;
  const chartHeight = 220;
  const padding = 35;

  // Calculate coordinates for the line chart points
  const points = timelineData.map((d, index) => {
    const x = padding + (index / (timelineData.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.count / maxEnrollmentValue) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // SVG Area path points (closing the shape to fill with gradient)
  const areaPoints = points.length > 0 
    ? `${points[0].x},${chartHeight - padding} ${polylinePoints} ${points[points.length - 1].x},${chartHeight - padding}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-3 font-medium"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="text-purple-600" />
              Teacher Analytics Center
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              // Export breakdown to simple text/csv format
              const headers = ['Course Title', 'Category', 'Views', 'Enrollments', 'ReviewsCount', 'Rating', 'AvgProgress'];
              const rows = stats.courseBreakdown.map(c => [
                `"${c.title}"`,
                c.category,
                c.views,
                c.enrollmentsCount,
                c.reviewsCount,
                c.averageRating,
                c.averageProgress
              ]);
              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', 'studenthub_teacher_analytics.csv');
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Analytics CSV report downloaded!');
            }}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Export Data
          </Button>
        </div>

        {/* Aggregated Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Courses</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalCourses}</h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-purple-600">
              <span className="text-xs bg-purple-50 px-2 py-1 rounded-md font-medium">Active Taught</span>
              <Award size={20} />
            </div>
          </div>

          {/* Total Impressions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Impressions</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalViews}</h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-blue-600">
              <span className="text-xs bg-blue-50 px-2 py-1 rounded-md font-medium">Course Views</span>
              <Eye size={20} />
            </div>
          </div>

          {/* Total Enrolled */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Enrollments</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalEnrollments}</h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-green-600">
              <span className="text-xs bg-green-50 px-2 py-1 rounded-md font-medium">Students Enrolled</span>
              <Users size={20} />
            </div>
          </div>

          {/* Average Completion */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Avg Student Progress</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.averageProgress}%</h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-indigo-600">
              <span className="text-xs bg-indigo-50 px-2 py-1 rounded-md font-medium">Completion Rate</span>
              <TrendingUp size={20} />
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Overall Course Rating</p>
              <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-1">
                {stats.averageRating || '0.0'}
                <span className="text-lg text-yellow-500 font-normal">★</span>
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-yellow-600">
              <span className="text-xs bg-yellow-50 px-2 py-1 rounded-md font-medium">Student Reviews</span>
              <Star size={20} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Visual Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Daily Enrollment Growth Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Enrollment Trends</h3>
              <p className="text-sm text-gray-500">Daily enrollment transactions over the past 30 days</p>
            </div>

            <div className="flex-1 w-full overflow-x-auto">
              {timelineData.length > 0 ? (
                <div style={{ minWidth: '600px' }}>
                  <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="mx-auto overflow-visible">
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const yVal = padding + ratio * (chartHeight - padding * 2);
                      const gridLabel = Math.round(maxEnrollmentValue * (1 - ratio));
                      return (
                        <g key={i} className="opacity-40">
                          <line
                            x1={padding}
                            y1={yVal}
                            x2={chartWidth - padding}
                            y2={yVal}
                            stroke="#e5e7eb"
                            strokeWidth="1.5"
                            strokeDasharray="4"
                          />
                          <text x={padding - 10} y={yVal + 4} textAnchor="end" className="text-xs fill-gray-400 font-semibold">
                            {gridLabel}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area path */}
                    {areaPoints && <path d={`M ${areaPoints}`} fill="url(#chartGradient)" />}

                    {/* Line path */}
                    {polylinePoints && (
                      <polyline
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />
                    )}

                    {/* Point Nodes */}
                    {points.map((p, index) => {
                      const showLabel = index === 0 || index === points.length - 1 || index === Math.round(points.length / 2) || p.count > 0;
                      return (
                        <g key={index} className="group">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5.5"
                            className="fill-white stroke-purple-600 stroke-[3] transition cursor-pointer hover:r-[7.5]"
                          />
                          {/* Tooltip Overlay */}
                          <title>{`${p.date}: ${p.count} enrollments`}</title>
                          
                          {showLabel && (
                            <text
                              x={p.x}
                              y={chartHeight - 8}
                              textAnchor="middle"
                              className="text-[10px] fill-gray-400 font-semibold"
                            >
                              {p.date}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No enrollment history available</div>
              )}
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Category breakdown</h3>
              <p className="text-sm text-gray-500 mb-6">Subject concentration and enrollments</p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {stats.categoryDistribution.length > 0 ? (
                stats.categoryDistribution.map((item, idx) => {
                  const maxVal = Math.max(...stats.categoryDistribution.map(c => c.enrollmentsCount), 1);
                  const progressPct = (item.enrollmentsCount / maxVal) * 100;
                  const colorClass = idx % 3 === 0 ? 'bg-purple-600' : idx % 3 === 1 ? 'bg-blue-600' : 'bg-indigo-600';
                  
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{item.category}</span>
                        <span className="text-gray-500 font-medium">{item.enrollmentsCount} enrolls ({item.coursesCount} courses)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500">No category statistics available</div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Individual Course Breakdown</h3>
              <p className="text-sm text-gray-500">Key metrics for each course published</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">Total: {stats.courseBreakdown.length} courses</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Course Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Difficulty</th>
                  <th className="py-4 px-6 text-center">Impressions</th>
                  <th className="py-4 px-6 text-center">Enrollments</th>
                  <th className="py-4 px-6 text-center">Avg Progress</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {stats.courseBreakdown.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-950">{course.title}</td>
                    <td className="py-4 px-6 text-gray-600">{course.category}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        course.difficulty === 'BEGINNER' ? 'bg-green-50 text-green-700' :
                        course.difficulty === 'INTERMEDIATE' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700 font-bold">{course.views}</td>
                    <td className="py-4 px-6 text-center text-gray-700 font-bold">{course.enrollmentsCount}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-gray-800">{course.averageProgress}%</span>
                        <div className="w-12 bg-gray-100 h-2 rounded-full overflow-hidden hidden md:block">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${course.averageProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-850">
                      {course.averageRating > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <span>{course.averageRating}</span>
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs text-gray-400 font-medium">({course.reviewsCount})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
