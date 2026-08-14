import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Save, X, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
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

  // Teaching topics (teacher-only, editable independent of individual courses)
  const [topicsEditing, setTopicsEditing] = useState(false);
  const [topicsSaving, setTopicsSaving] = useState(false);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  // Email change
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });

  // Password change
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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
      setTopics(res.data.teachingTopics || []);
    } catch {
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

  const handleAddTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    if (topics.includes(trimmed)) {
      toast.error('That topic is already on your list');
      return;
    }
    setTopics([...topics, trimmed]);
    setNewTopic('');
  };

  const handleRemoveTopic = (topic) => {
    setTopics(topics.filter((t) => t !== topic));
  };

  const handleSaveTopics = async () => {
    try {
      setTopicsSaving(true);
      const res = await axios.patch('/user/profile', { teachingTopics: topics });
      setProfile(res.data);
      setTopics(res.data.teachingTopics || []);
      setTopicsEditing(false);
      toast.success('Teaching topics updated!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update topics');
    } finally {
      setTopicsSaving(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handleSaveEmail = async () => {
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      toast.error('Enter your new email and current password');
      return;
    }
    try {
      setEmailSaving(true);
      const res = await axios.patch('/user/email', emailForm);
      setProfile(res.data);
      setEmailEditing(false);
      setEmailForm({ newEmail: '', currentPassword: '' });
      toast.success('Email updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update email');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setPasswordSaving(true);
      await axios.patch('/user/password', { currentPassword, newPassword });
      setPasswordEditing(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-notebook min-h-screen flex items-center justify-center">
        <p className="nb-mono text-sm nb-muted animate-pulse">Turning the page…</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-notebook min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Header — no banner, no card. Avatar + name sit directly on the page. */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 md:gap-8 pb-10 mb-10 nb-divider">
          <div className="nb-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} />
            ) : (
              profile.name?.charAt(0)?.toUpperCase()
            )}
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="nb-mono text-xs nb-muted mb-1.5">
                {profile.role === 'TEACHER' ? 'Teacher profile' : 'Student profile'}
              </p>
              <h1 className="nb-serif text-4xl md:text-5xl leading-none">{profile.name}</h1>
              <p className="nb-mono text-xs nb-muted mt-2">@{profile.username}</p>
            </div>

            <div className="flex items-center gap-5">
              {!editing ? (
                <button type="button" className="nb-link-btn" onClick={() => setEditing(true)}>
                  <Edit3 size={13} />
                  Edit profile
                </button>
              ) : (
                <>
                  <button type="button" className="nb-stamp-btn" onClick={handleSave} disabled={saving}>
                    <Save size={13} />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="nb-link-btn" onClick={handleCancel}>
                    <X size={13} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 pb-10 mb-10 nb-divider">
          {/* Personal Info */}
          <div>
            <h2 className="nb-mono text-xs nb-muted mb-6">Personal information</h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="nb-mono text-[0.65rem] nb-muted block mb-1">Full name</label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="nb-input"
                  />
                ) : (
                  <p className="text-lg">{profile.name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="nb-mono text-[0.65rem] nb-muted block mb-1">Username</label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="nb-input"
                  />
                ) : (
                  <p className="text-lg">@{profile.username}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="nb-mono text-[0.65rem] nb-muted block mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Add your phone number"
                    className="nb-input"
                  />
                ) : (
                  <p className="text-lg">{profile.phone || <span className="nb-muted">Not provided</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h2 className="nb-mono text-xs nb-muted mb-6">Account details</h2>

            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="nb-mono text-[0.65rem] nb-muted block mb-1">Email address</label>
                {!emailEditing ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg">{profile.email}</p>
                    <button type="button" onClick={() => setEmailEditing(true)} className="nb-link-btn">
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    <input
                      type="email"
                      name="newEmail"
                      value={emailForm.newEmail}
                      onChange={handleEmailChange}
                      placeholder="New email address"
                      className="nb-input"
                    />
                    <input
                      type="password"
                      name="currentPassword"
                      value={emailForm.currentPassword}
                      onChange={handleEmailChange}
                      placeholder="Current password"
                      className="nb-input"
                    />
                    <div className="flex items-center gap-5 pt-1">
                      <button type="button" className="nb-stamp-btn" onClick={handleSaveEmail} disabled={emailSaving}>
                        {emailSaving ? 'Saving…' : 'Save email'}
                      </button>
                      <button
                        type="button"
                        className="nb-link-btn"
                        onClick={() => {
                          setEmailEditing(false);
                          setEmailForm({ newEmail: '', currentPassword: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="nb-mono text-[0.65rem] nb-muted block mb-1">Password</label>
                {!passwordEditing ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg">••••••••</p>
                    <button type="button" onClick={() => setPasswordEditing(true)} className="nb-link-btn">
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Current password"
                      className="nb-input"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New password (min 8 characters)"
                      className="nb-input"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="nb-input"
                    />
                    <div className="flex items-center gap-5 pt-1">
                      <button type="button" className="nb-stamp-btn" onClick={handleSavePassword} disabled={passwordSaving}>
                        {passwordSaving ? 'Saving…' : 'Save password'}
                      </button>
                      <button
                        type="button"
                        className="nb-link-btn"
                        onClick={() => {
                          setPasswordEditing(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role + Member Since */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <label className="nb-mono text-[0.65rem] nb-muted block mb-1.5">Role</label>
                  <span className={`nb-tag ${profile.role === 'TEACHER' ? 'text-[var(--nb-olive-ink)]' : 'text-[var(--nb-rust-ink)]'}`}>
                    {profile.role || 'Not set'}
                  </span>
                </div>
                <div className="text-right">
                  <label className="nb-mono text-[0.65rem] nb-muted block mb-1.5">Member since</label>
                  <p className="nb-mono text-xs">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio — pull-quote, full width */}
          <div className="md:col-span-2">
            <h2 className="nb-mono text-xs nb-muted mb-5">Bio</h2>
            {editing ? (
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="nb-input resize-none"
              />
            ) : profile.bio ? (
              <div className="nb-pullquote">
                <p className="nb-serif text-xl md:text-2xl leading-relaxed">
                  <span className="nb-pullquote-text">{profile.bio}</span>
                </p>
              </div>
            ) : (
              <p className="nb-muted italic">No bio added yet — click "Edit profile" to add one.</p>
            )}
          </div>

          {/* Teaching Topics — TEACHER only, dashed list not chips */}
          {profile.role === 'TEACHER' && (
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="nb-mono text-xs nb-muted">What I teach</h2>
                {!topicsEditing ? (
                  <button type="button" className="nb-link-btn" onClick={() => setTopicsEditing(true)}>
                    <Edit3 size={13} />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-5">
                    <button type="button" className="nb-stamp-btn nb-stamp-olive" onClick={handleSaveTopics} disabled={topicsSaving}>
                      {topicsSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="nb-link-btn"
                      onClick={() => {
                        setTopics(profile.teachingTopics || []);
                        setTopicsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {topics.length === 0 && !topicsEditing && (
                  <p className="nb-muted italic">No topics added yet — click "Edit" to add what you teach.</p>
                )}
                {topics.map((topic) => (
                  <div key={topic} className="nb-dash-row">
                    <span className="nb-serif text-lg">{topic}</span>
                    {topicsEditing && (
                      <button type="button" onClick={() => handleRemoveTopic(topic)} className="nb-muted hover:text-[var(--nb-rust-ink)]">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {topicsEditing && (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    placeholder="e.g. React, Data Structures, Spanish"
                    className="nb-input flex-1"
                  />
                  <button type="button" className="nb-link-btn whitespace-nowrap" onClick={handleAddTopic}>
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rewards & Achievements — horizontal timeline, not a badge grid */}
          <div className="md:col-span-2 pt-10 nb-divider">
            <h2 className="nb-mono text-xs nb-muted mb-2">Rewards & achievements</h2>

            {profile.rewards && profile.rewards.length > 0 ? (
              <div className="nb-timeline">
                {profile.rewards.map((reward) => (
                  <div key={reward.id} className="nb-timeline-stop">
                    <span className="nb-timeline-dot" />
                    <p className="nb-serif text-lg leading-snug">
                      {reward.badge || reward.coupon || 'New achievement'}
                    </p>
                    <p className="nb-mono text-[0.65rem] nb-muted mt-1">
                      {reward.points > 0 ? `+${reward.points} pts` : reward.type}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6">
                <p className="nb-muted italic mb-3">No achievements yet — take quizzes to earn badges.</p>
                <button type="button" className="nb-link-btn" onClick={() => navigate('/quizzes')}>
                  Go to quiz center
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
