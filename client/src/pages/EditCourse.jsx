import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, BookOpen, Layers, BarChart3, FileText, Image } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const categories = [
  'Web Development',
  'Programming',
  'Data Science',
  'AI & ML',
  'Mobile Development',
  'DevOps',
  'Cybersecurity',
  'Design',
  'Other',
];

const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    link: '',
    category: '',
    description: '',
    difficulty: 'BEGINNER',
    thumbnail: '',
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/course/${id}`);
      const course = res.data;
      setForm({
        title: course.title || '',
        link: course.link || '',
        category: course.category || '',
        description: course.description || '',
        difficulty: course.difficulty || 'BEGINNER',
        thumbnail: course.thumbnail || '',
      });
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/teacher-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.link || !form.category) {
      toast.error('Title, link, and category are required');
      return;
    }

    try {
      setSaving(true);
      await axios.patch(`/course/${id}`, form);
      toast.success('Course updated successfully!');
      navigate('/teacher-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Edit Course
          </h1>
          <p className="text-gray-600 text-lg">
            Update your course details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <BookOpen size={16} />
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Complete React Developer Course"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} />
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what students will learn..."
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          {/* Link */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} />
              Course Link *
            </label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="https://example.com/course"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Category & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Layers size={16} />
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BarChart3 size={16} />
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0) + diff.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Image size={16} />
              Thumbnail URL (optional)
            </label>
            <input
              type="url"
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
            >
              Save Changes
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/teacher-dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
