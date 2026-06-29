import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SortAsc } from 'lucide-react';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [bookmarked, setBookmarked] = useState(new Set());
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const categories = ['All', 'Web Development', 'Programming', 'Data Science', 'AI & ML', 'Mobile Development', 'Design'];
  const difficulties = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) fetchSuggestions();
      else setSuggestions([]);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, selectedSort]);

  useEffect(() => {
    if (!isTeacher) fetchBookmarks();
  }, [isTeacher]);

  const fetchCourses = async (customQuery = searchQuery) => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedSort) params.sort = selectedSort;
      if (customQuery) params.search = customQuery;
      const res = await axios.get('/course', { params });
      setCourses(res.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`/course/suggestions?q=${searchQuery}`);
      setSuggestions(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch {
      // silent
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('/enrollment/bookmarks');
      setBookmarked(new Set(res.data.map(e => e.course?.id || e.courseId)));
    } catch {
      // silent
    }
  };

  const toggleBookmark = async (courseId) => {
    if (isTeacher) return;
    const isCurrentlyBookmarked = bookmarked.has(courseId);
    try {
      if (isCurrentlyBookmarked) {
        await axios.post('/enrollment/unbookmark', { courseId });
        const next = new Set(bookmarked);
        next.delete(courseId);
        setBookmarked(next);
        toast.success('Removed from saved');
      } else {
        await axios.post('/enrollment/bookmark', { courseId });
        const next = new Set(bookmarked);
        next.add(courseId);
        setBookmarked(next);
        toast.success('Course saved');
      }
    } catch {
      toast.error('Could not update saved courses');
    }
  };

  return (
    <div className="sh-page">
      <Navbar />

      <div className="sh-container py-8">
        <header className="mb-8">
          <h1 className="sh-heading text-3xl mb-2">All courses</h1>
          <p className="sh-muted">Free resources curated by students — no fluff, just learning.</p>
        </header>

        <div className="mb-6 relative" ref={suggestionsRef}>
          <form
            onSubmit={(e) => { e.preventDefault(); setShowSuggestions(false); fetchCourses(); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 sh-muted" />
              <input
                type="text"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') fetchCourses('');
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="sh-input pl-10"
              />
            </div>
            <Button type="submit" variant="primary" size="md">Search</Button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 sh-card z-50 divide-y divide-[#d1d7dc]">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSearchQuery(s.title); setShowSuggestions(false); fetchCourses(s.title); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f7f9fa]"
                >
                  {s.title}
                  <span className="sh-muted ml-2">· {s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-2">
            <label className="text-xs font-bold uppercase sh-muted mb-2 flex items-center gap-1">
              <Filter size={14} /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-sm px-3 py-1 border ${
                    selectedCategory === cat
                      ? 'bg-[#1c1d1f] text-white border-[#1c1d1f]'
                      : 'bg-white border-[#d1d7dc] hover:border-[#1c1d1f]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase sh-muted mb-2 flex items-center gap-1">
              Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="sh-input"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All levels' : d.charAt(0) + d.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase sh-muted mb-2 flex items-center gap-1">
              <SortAsc size={14} /> Sort
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="sh-input"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
        </div>

        <p className="text-sm sh-muted mb-4">{courses.length} results</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="sh-card aspect-[4/5] animate-pulse bg-[#e9ecef]" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
                onBookmark={!isTeacher ? toggleBookmark : undefined}
                isBookmarked={bookmarked.has(course.id)}
                showBookmark={!isTeacher}
              />
            ))}
          </div>
        ) : (
          <div className="sh-card p-12 text-center">
            <p className="font-bold text-lg mb-1">No courses found</p>
            <p className="sh-muted text-sm">Try different filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
