import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Package } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { authAPI } from '../services/api';
import { setAuthData } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      
      setAuthData(token, user);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      addToast(error.response?.data?.error || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <Package className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">FreshTrack</h1>
          <p className="text-neutral-600 mt-2">Reduce waste, save money, protect the planet</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              placeholder="your.email@example.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:text-primary-600">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <p className="text-2xl font-bold text-primary">50%</p>
            <p className="text-xs text-neutral-600">Waste Reduced</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <p className="text-2xl font-bold text-success">$1,200</p>
            <p className="text-xs text-neutral-600">Avg. Saved/Year</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-3">
            <p className="text-2xl font-bold text-warning">600kg</p>
            <p className="text-xs text-neutral-600">CO₂ Prevented</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;