import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, BookOpen, Bell, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notification');
      setNotifications(res.data);
    } catch {
      // silent
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notification/${id}`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/notification/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isTeacher = user?.role === 'TEACHER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const go = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setShowNotifications(false);
  };

  const NotificationPanel = () => (
    <div className="max-h-80 overflow-y-auto">
      {notifications.length > 0 ? (
        notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`px-4 py-3 border-b border-white/10 cursor-pointer text-sm ${
              !n.read ? 'bg-white/5' : ''
            }`}
          >
            <p className={!n.read ? 'text-white font-medium' : 'text-gray-300'}>{n.message}</p>
          </div>
        ))
      ) : (
        <p className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</p>
      )}
    </div>
  );

  return (
    <nav className="bg-[#1c1d1f] text-white sticky top-0 z-50 border-b border-black/20">
      <div className="sh-container">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-6">
            <button onClick={() => go(isTeacher ? '/teacher-dashboard' : user ? '/dashboard' : '/')} className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight">StudentHub</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center gap-5 text-sm font-medium">
                <button onClick={() => go('/courses')} className="hover:text-white/80 text-white/90">
                  Explore
                </button>
                <button
                  onClick={() => go(isTeacher ? '/teacher-dashboard' : '/dashboard')}
                  className="hover:text-white/80 text-white/90"
                >
                  Dashboard
                </button>
                {!isTeacher && (
                  <button onClick={() => go('/quizzes')} className="hover:text-white/80 text-white/90">
                    Quizzes
                  </button>
                )}
                {isTeacher && (
                  <>
                    <button onClick={() => go('/analytics')} className="hover:text-white/80 text-white/90">
                      Analytics
                    </button>
                    <button onClick={() => go('/teacher-quizzes')} className="hover:text-white/80 text-white/90">
                      Quizzes
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {isTeacher && (
                <button
                  onClick={() => go('/add-course')}
                  className="text-sm font-bold border border-white px-3 py-1.5 hover:bg-white/10"
                >
                  Create course
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-white/10 relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#c40000] text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#2d2f31] border border-white/10 shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      <button onClick={markAllAsRead} className="text-xs text-[#cec0fc] hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <NotificationPanel />
                  </div>
                )}
              </div>

              <button onClick={() => go('/profile')} className="p-2 hover:bg-white/10" title="Profile">
                <User size={18} />
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-white/10" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : null}

          {user && (
            <div className="md:hidden flex items-center gap-1">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#c40000] text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          )}
        </div>

        {showNotifications && user && (
          <div className="md:hidden border-t border-white/10 pb-3">
            <div className="flex justify-between items-center px-2 py-2">
              <span className="text-sm font-bold">Notifications</span>
              <button onClick={markAllAsRead} className="text-xs text-[#cec0fc]">Mark all read</button>
            </div>
            <NotificationPanel />
          </div>
        )}

        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            <button onClick={() => go('/courses')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Explore</button>
            <button onClick={() => go(isTeacher ? '/teacher-dashboard' : '/dashboard')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Dashboard</button>
            {!isTeacher && <button onClick={() => go('/quizzes')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Quizzes</button>}
            {isTeacher && (
              <>
                <button onClick={() => go('/add-course')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Create course</button>
                <button onClick={() => go('/analytics')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Analytics</button>
              </>
            )}
            <button onClick={() => go('/profile')} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Profile</button>
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-300">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
