import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Users, ExternalLink, ArrowLeft, Share2, Trash2,
  CheckCircle2, Circle, Play, Edit, Brain, BarChart3,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [progress, setProgress] = useState({ completionPercentage: 0, lessonsCompleted: 0, completedLessonIds: [] });
  const [completingLesson, setCompletingLesson] = useState(null);
  const [similarCourses, setSimilarCourses] = useState([]);

  useEffect(() => {
    fetchCourseDetails();
    fetchSimilarCourses();
    if (user && !isTeacher) fetchProgress();
  }, [id, user, isTeacher]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`/progress/${id}`);
      setProgress(res.data);
    } catch {
      // not enrolled
    }
  };

  const fetchSimilarCourses = async () => {
    try {
      const res = await axios.get(`/course/${id}/similar`);
      setSimilarCourses(res.data);
    } catch {
      // silent
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/course/${id}`);
      setCourse(res.data);

      if (user) {
        const owner = res.data.teacher?.id === user.id;
        setIsOwner(owner);

        if (!isTeacher && res.data.enrollments) {
          setIsEnrolled(res.data.enrollments.some(e => e.studentId === user.id));
        }
      }
    } catch {
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await axios.post('/enrollment', { courseId: id });
      toast.success('You are enrolled');
      setIsEnrolled(true);
      fetchProgress();
      fetchCourseDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Leave this course? Your progress will remain but you lose quick access.')) return;
    try {
      await axios.delete(`/enrollment/${id}`);
      toast.success('Unenrolled');
      setIsEnrolled(false);
      fetchCourseDetails();
    } catch {
      toast.error('Failed to unenroll');
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    if (progress.completedLessonIds?.includes(lessonId)) return;
    try {
      setCompletingLesson(lessonId);
      const res = await axios.post('/progress/complete-lesson', { courseId: id, lessonId });
      setProgress(res.data);
      toast.success('Checkpoint completed');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Could not save progress');
    } finally {
      setCompletingLesson(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) {
      toast.error('Please add a comment');
      return;
    }
    try {
      setSubmittingReview(true);
      await axios.post('/review', { courseId: id, rating: reviewData.rating, comment: reviewData.comment });
      toast.success('Review posted');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      fetchCourseDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`/review/${reviewId}`);
      toast.success('Review deleted');
      fetchCourseDetails();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course) return null;

  const lessons = course.lessons || [];
  const courseQuiz = course.quizzes?.[0];
  const averageRating = course.reviews?.length > 0
    ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
    : '0.0';
  const userHasReviewed = course.reviews?.some(r => r.student?.id === user?.id);
  const completedSet = new Set(progress.completedLessonIds || []);

  return (
    <div className="sh-page">
      <Navbar />

      {/* Header band — Udemy-style dark strip */}
      <div className="bg-[#1c1d1f] text-white">
        <div className="sh-container py-6 md:py-10">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-6"
          >
            <ArrowLeft size={16} /> Back to courses
          </button>

          <p className="text-[#cec0fc] text-sm font-semibold mb-2">{course.category}</p>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 max-w-3xl">{course.title}</h1>
          <p className="text-gray-300 max-w-2xl mb-4">{course.description}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-[#e59819]" fill="#e59819" />
              {averageRating} ({course.reviews?.length || 0})
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} /> {course.enrollments?.length || 0} students
            </span>
            <span>By {course.teacher?.name}</span>
            <span>{course.views || 0} views</span>
          </div>
        </div>
      </div>

      <div className="sh-container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Curriculum */}
            <section className="sh-card p-5">
              <h2 className="sh-heading text-xl mb-1">Course content</h2>
              <p className="text-sm sh-muted mb-4">
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                {courseQuiz ? ' · Quiz included' : ''}
              </p>

              {lessons.length > 0 ? (
                <ul className="divide-y divide-[#d1d7dc]">
                  {lessons.map((lesson) => {
                    const done = completedSet.has(lesson.id);
                    const canComplete = isEnrolled && !isTeacher;

                    return (
                      <li key={lesson.id} className="py-3 flex items-start gap-3">
                        {canComplete ? (
                          <button
                            onClick={() => handleCompleteLesson(lesson.id)}
                            disabled={done || completingLesson === lesson.id}
                            className="mt-0.5 shrink-0"
                            title={done ? 'Completed' : 'Mark complete'}
                          >
                            {done ? (
                              <CheckCircle2 size={20} className="text-[#0f7c90]" />
                            ) : (
                              <Circle size={20} className="text-[#6a6f73] hover:text-[#5624d0]" />
                            )}
                          </button>
                        ) : (
                          <Play size={18} className="mt-1 sh-muted shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${done ? 'text-[#0f7c90]' : ''}`}>
                            {lesson.order}. {lesson.title}
                          </p>
                          {lesson.videoUrl && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#5624d0] hover:underline inline-flex items-center gap-1 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Watch <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm sh-muted py-4">Curriculum is being prepared for this course.</p>
              )}

              {courseQuiz && isEnrolled && !isTeacher && (
                <div className="mt-4 pt-4 border-t border-[#d1d7dc]">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => navigate(`/quizzes?quiz=${courseQuiz.id}`)}
                  >
                    <Brain size={16} /> Take course quiz: {courseQuiz.title}
                  </Button>
                </div>
              )}
            </section>

            {/* Teacher bio */}
            <section className="sh-card p-5">
              <h2 className="sh-heading text-lg mb-3">Instructor</h2>
              <p className="text-sm sh-muted leading-relaxed">{course.teacher?.bio || 'No bio provided.'}</p>
            </section>

            {/* Reviews */}
            <section className="sh-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="sh-heading text-lg">Reviews</h2>
                {isEnrolled && !isTeacher && !showReviewForm && !userHasReviewed && (
                  <Button variant="secondary" size="sm" onClick={() => setShowReviewForm(true)}>
                    Write a review
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-[#d1d7dc] bg-[#f7f9fa]">
                  <div className="mb-3">
                    <label className="text-sm font-bold block mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewData({ ...reviewData, rating: star })}>
                          <Star size={24} className={star <= reviewData.rating ? 'fill-[#e59819] text-[#e59819]' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder="What did you think of this course?"
                    rows="3"
                    className="sh-input mb-3 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" type="submit" loading={submittingReview} size="sm">Post</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              {course.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {course.reviews.map(review => (
                    <div key={review.id} className="border-b border-[#d1d7dc] pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm">{review.student?.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? 'fill-[#e59819] text-[#e59819]' : 'text-gray-300'} />
                            ))}
                          </div>
                          {review.student?.id === user?.id && (
                            <button onClick={() => handleDeleteReview(review.id)} className="text-gray-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm sh-muted">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sh-muted">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sh-card p-4 sticky top-20">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-full aspect-video object-cover mb-4" />
              ) : (
                <div className="w-full aspect-video bg-[#2d2f31] mb-4 flex items-center justify-center text-white/50 text-sm">
                  Course preview
                </div>
              )}

              {isOwner ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#0f7c90] mb-2">You created this course</p>
                  <Button variant="primary" size="lg" onClick={() => navigate(`/edit-course/${id}`)}>
                    <Edit size={16} /> Edit course
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/analytics')}>
                    <BarChart3 size={16} /> View analytics
                  </Button>
                  {courseQuiz && (
                    <p className="text-xs sh-muted pt-2">
                      AI quiz generated: {courseQuiz.title}
                    </p>
                  )}
                </div>
              ) : isTeacher ? (
                <div className="space-y-2">
                  <p className="text-sm sh-muted mb-3">
                    You're viewing as a teacher. Browse content without enrolling.
                  </p>
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="primary" size="lg">Open resource</Button>
                  </a>
                </div>
              ) : isEnrolled ? (
                <div className="space-y-2">
                  <div className="mb-3 p-3 bg-[#f7f9fa] border border-[#d1d7dc]">
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span>Your progress</span>
                      <span>{progress.completionPercentage}%</span>
                    </div>
                    <div className="h-2 bg-[#d1d7dc]">
                      <div className="h-full bg-[#0f7c90]" style={{ width: `${progress.completionPercentage}%` }} />
                    </div>
                    <p className="text-xs sh-muted mt-1">{progress.lessonsCompleted} of {lessons.length || '?'} lessons</p>
                  </div>
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="primary" size="lg">Continue learning</Button>
                  </a>
                  <Button variant="danger" size="lg" onClick={handleUnenroll}>Leave course</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="primary" size="lg" onClick={handleEnroll} loading={enrolling}>
                    Enroll for free
                  </Button>
                  <p className="text-xs sh-muted">Full access to curriculum and quiz</p>
                </div>
              )}

              <a
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-center text-sm text-[#5624d0] hover:underline py-2"
              >
                Open original link <ExternalLink size={12} className="inline" />
              </a>

              <Button
                variant="ghost"
                size="md"
                className="w-full mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied');
                }}
              >
                <Share2 size={16} /> Share
              </Button>
            </div>
          </aside>
        </div>

        {similarCourses.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[#d1d7dc]">
            <h2 className="sh-heading text-xl mb-4">Students also viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarCourses.map(c => (
                <div
                  key={c.id}
                  onClick={() => { navigate(`/courses/${c.id}`); window.scrollTo(0, 0); }}
                  className="sh-card p-3 cursor-pointer hover:shadow-md"
                >
                  <h3 className="font-bold text-sm line-clamp-2 mb-1">{c.title}</h3>
                  <p className="text-xs sh-muted">{c.teacher?.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
