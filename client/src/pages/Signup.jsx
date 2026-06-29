import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FormContainer } from '../components/FormContainer';
import { useAuth } from '../contexts/AuthContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...signupData } = formData;
      const response = await signup(signupData);
      
      toast.success('Account created successfully! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      const errorMsg = error.msg || error.message || 'Signup failed';
      toast.error(errorMsg);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Create Account"
      subtitle="Join StudentHub and start learning today!"
      onSubmit={handleSubmit}
    >
      <Input
        label="Full Name"
        type="text"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        icon={User}
      />

      <Input
        label="Username"
        type="text"
        name="username"
        placeholder="johndoe"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        icon={UserCheck}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="john@example.com"
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

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        required
        icon={Lock}
      />

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={loading}
      >
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default Signup;