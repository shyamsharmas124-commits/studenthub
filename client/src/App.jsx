import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import Profile from './pages/Profile';
import TeacherAnalytics from './pages/TeacherAnalytics';
import QuizCenter from './pages/QuizCenter';
import TeacherQuizzes from './pages/TeacherQuizzes';
import AddQuiz from './pages/AddQuiz';
import NotFound from './pages/NotFound';

import ProtectedRoutes from './components/ProtectedRoutes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/role"
            element={
              <ProtectedRoutes>
                <RoleSelect />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoutes>
                <TeacherDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoutes>
                <Courses />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/courses/:id"
            element={
              <ProtectedRoutes>
                <CourseDetail />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/add-course"
            element={
              <ProtectedRoutes>
                <AddCourse />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/edit-course/:id"
            element={
              <ProtectedRoutes>
                <EditCourse />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <Profile />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoutes>
                <TeacherAnalytics />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/quizzes"
            element={
              <ProtectedRoutes>
                <QuizCenter />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/teacher-quizzes"
            element={
              <ProtectedRoutes>
                <TeacherQuizzes />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/add-quiz"
            element={
              <ProtectedRoutes>
                <AddQuiz />
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;