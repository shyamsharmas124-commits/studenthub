import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, FileText, AtSign, Shield, Calendar, Edit3, Save, X, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/user/profile');
      setProfile(res.data);
      setForm({
        name: res.data.name || '',
        username: res.data.username || '',
        bio: res.data.bio || '',
        phone: res.data.phone || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name || !form.username) {
      toast.error('Name and username are required');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.patch('/user/profile', form);
      setProfile(res.data);
      // Update localStorage user data so navbar reflects changes
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile.name || '',
      username: profile.username || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
    });
    setEditing(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-12 left-6 md:left-8">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-16 pb-6 px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
              <div className="flex gap-3">
                {!editing ? (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSave}
                      loading={saving}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Personal Information
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <User size={14} />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <AtSign size={14} />
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">@{profile.username}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <Phone size={14} />
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Add your phone number"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-lg">{profile.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Account Details
            </h2>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <Mail size={14} />
                  Email Address
                </label>
                <p className="text-gray-900 font-medium text-lg">{profile.email}</p>
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <Shield size={14} />
                  Role
                </label>
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                  profile.role === 'TEACHER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {profile.role || 'Not set'}
                </span>
              </div>

              {/* Member Since */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                  <Calendar size={14} />
                  Member Since
                </label>
                <p className="text-gray-900 font-medium text-lg">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Bio Card — Full Width */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-green-600" />
              Bio
            </h2>
            {editing ? (
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition resize-none"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed text-lg">
                {profile.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
              </p>
            )}
          </div>

          {/* Rewards & Badges Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-600" />
              Rewards & Achievements
            </h2>
            
            {profile.rewards && profile.rewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{reward.badge || 'New Achievement'}</p>
                      <p className="text-xs text-gray-500">+{reward.points} Points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No achievements yet. Take quizzes to earn badges!</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/quizzes')}
                >
                  Go to Quiz Center
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
