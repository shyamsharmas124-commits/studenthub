import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Zap, Award, TrendingUp, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'TEACHER') {
        navigate('/teacher-dashboard');
      } else if (user.role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        navigate('/role');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const categories = [
    { icon: '💻', name: 'Web Development', courses: 234 },
    { icon: '🐍', name: 'Programming', courses: 456 },
    { icon: '📊', name: 'Data Science', courses: 189 },
    { icon: '🤖', name: 'AI & ML', courses: 127 },
  ];

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: 'Learn from Students',
      description: 'Access curated free resources shared by students who understand your struggles'
    },
    {
      icon: <Users size={32} />,
      title: 'Become a Teacher',
      description: 'Share knowledge and help others grow while earning recognition and rewards'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress tracking and analytics'
    },
    {
      icon: <Award size={32} />,
      title: 'Earn Rewards',
      description: 'Get badges, coupons, and points for contributing to the community'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-16 py-4 md:py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📚</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            StudentHub
          </h1>
        </div>

        <div className="flex gap-3 md:gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 md:px-16 py-16 md:py-32">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Learn from <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Students.</span>
              <br />
              Teach as <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Students.</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-xl">
              StudentHub is where students become teachers. Learn from curated free resources, share your knowledge, and grow together as a community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Explore Courses
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">10K+</p>
                <p className="text-gray-600 text-sm">Active Students</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">500+</p>
                <p className="text-gray-600 text-sm">Courses</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">1K+</p>
                <p className="text-gray-600 text-sm">Teachers</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center">
            <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <Zap size={80} className="text-white mx-auto mb-4" />
                <p className="text-white text-lg font-semibold">Learn & Teach Together</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-gray-900">
          Why Choose StudentHub?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 md:px-16 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Explore Categories
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <span>{category.courses} courses</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of students learning together in our vibrant community
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2"
          >
            Join StudentHub Today
            <ArrowRight size={20} />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-6 md:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">StudentHub</h3>
              <p className="text-sm">Learning platform by students, for students</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Forum</a></li>
                <li><a href="#" className="hover:text-white transition">Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 StudentHub. All rights reserved. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}