import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';

const RoleSelect = () => {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);

    try {
      await setUserRole(role);
      toast.success(`You are now a ${role}!`);
      setTimeout(() => {
        navigate(role === 'TEACHER' ? '/teacher-dashboard' : '/dashboard');
      }, 800);
    } catch (error) {
      toast.error(error.msg || 'Failed to set role');
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Path
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Decide whether you want to learn from expert resources or share your knowledge with others
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div
            onClick={() => !loading && handleRoleSelect('STUDENT')}
            className={`
              group relative p-8 rounded-2xl cursor-pointer
              transition-all duration-300 transform hover:scale-105
              ${selectedRole === 'STUDENT'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl'
                : 'bg-white text-gray-900 shadow-lg hover:shadow-2xl border-2 border-transparent'
              }
            `}
          >
            <div className={`mb-6 ${selectedRole === 'STUDENT' ? 'text-blue-100' : 'text-blue-600'}`}>
              <BookOpen size={48} className="transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Student</h2>
            <p className={`text-sm mb-6 ${selectedRole === 'STUDENT' ? 'text-blue-100' : 'text-gray-600'}`}>
              Learn from curated free resources, track your progress, and join our learning community
            </p>
            <ul className={`text-sm space-y-2 mb-6 ${selectedRole === 'STUDENT' ? 'text-blue-100' : 'text-gray-600'}`}>
              <li>✓ Browse thousands of courses</li>
              <li>✓ Track learning progress</li>
              <li>✓ Get personalized recommendations</li>
              <li>✓ Join study groups</li>
            </ul>
            {selectedRole === 'STUDENT' && loading && (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Teacher Card */}
          <div
            onClick={() => !loading && handleRoleSelect('TEACHER')}
            className={`
              group relative p-8 rounded-2xl cursor-pointer
              transition-all duration-300 transform hover:scale-105
              ${selectedRole === 'TEACHER'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl'
                : 'bg-white text-gray-900 shadow-lg hover:shadow-2xl border-2 border-transparent'
              }
            `}
          >
            <div className={`mb-6 ${selectedRole === 'TEACHER' ? 'text-purple-100' : 'text-purple-600'}`}>
              <Users size={48} className="transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Teacher</h2>
            <p className={`text-sm mb-6 ${selectedRole === 'TEACHER' ? 'text-purple-100' : 'text-gray-600'}`}>
              Share your knowledge, create courses, and inspire the next generation of learners
            </p>
            <ul className={`text-sm space-y-2 mb-6 ${selectedRole === 'TEACHER' ? 'text-purple-100' : 'text-gray-600'}`}>
              <li>✓ Create and manage courses</li>
              <li>✓ Share external resources</li>
              <li>✓ Track student engagement</li>
              <li>✓ Earn recognition & rewards</li>
            </ul>
            {selectedRole === 'TEACHER' && loading && (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          You can change your role anytime from your profile settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelect;