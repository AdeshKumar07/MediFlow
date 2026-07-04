import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import loginBg from '../assets/register_bg.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if redirect query exists (e.g. for session timeout)
  React.useEffect(() => {
    if (searchParams.get('session_expired')) {
      toast.error('Session expired. Please log in again.');
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.emailOrUsername, data.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.firstName}!`);
      navigate('/dashboard/home');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Soft overlay to make text easily readable with high contrast */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[3px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25 animate-pulse-slow">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-outfit text-4xl font-extrabold tracking-tight text-slate-900">
            Medi<span className="text-brand-600">Flow</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enterprise Healthcare Administration Portal
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
          <h2 className="text-2xl font-bold font-outfit text-slate-800 mb-6 text-center">
            Sign In to Portal
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Username or Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Username or Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  className={`w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.emailOrUsername ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
                  {...register('emailOrUsername', { required: 'Username or Email is required' })}
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-1 text-xs text-red-500">{errors.emailOrUsername.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white pl-10 pr-12 py-2.5 rounded-xl border ${
                    errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed transition-button"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Access Terminal <ArrowRight className="ml-2 h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Link to Register page inside card */}
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-650 hover:text-brand-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
