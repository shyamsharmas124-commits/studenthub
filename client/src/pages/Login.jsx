import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FormContainer } from '../components/FormContainer';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      setTimeout(() => {
        if (user.role === 'TEACHER') {
          navigate('/teacher-dashboard');
        } else if (user.role === 'STUDENT') {
          navigate('/dashboard');
        } else {
          navigate('/role');
        }
      }, 800);
    } catch (error) {
      const errorMsg = error.msg || error.message || 'Login failed';
      toast.error(errorMsg);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Welcome Back"
      subtitle="Login to continue your learning journey"
      onSubmit={handleSubmit}
    >
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        icon={Mail}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        icon={Lock}
      />

      <div className="flex justify-between items-center">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <Link to="#" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign up here
          </Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default Login;