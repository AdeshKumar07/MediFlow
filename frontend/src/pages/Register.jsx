import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Activity, User, Mail, Lock, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';
import registerBg from '../assets/register_bg.png';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await signup(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${registerBg})` }}
    >
      {/* Soft overlay to make text easily readable with high contrast */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[3px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Top Header */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Log In
          </Link>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="mt-3 font-outfit text-3xl font-bold text-slate-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join MediFlow Healthcare Network
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* First & Last Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-650 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                      errors.firstName ? 'border-red-500' : 'border-slate-200'
                    } text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300`}
                    {...register('firstName', { required: 'First name is required' })}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-655 mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Doe"
                    className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                      errors.lastName ? 'border-red-500' : 'border-slate-200'
                    } text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300`}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Username & Email row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-660 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FileText className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="johndoe"
                    className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                      errors.username ? 'border-red-500' : 'border-slate-200'
                    } text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300`}
                    {...register('username', {
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be 3+ characters' }
                    })}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-665 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                      errors.email ? 'border-red-500' : 'border-slate-200'
                    } text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-670 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  } text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be 8+ characters' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* System Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Assign System Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <select
                  className="w-full bg-white pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300 appearance-none"
                  {...register('role')}
                >
                  <option value="PATIENT">Patient (No verification required)</option>
                  <option value="DOCTOR">Doctor (Requires Admin approval)</option>
                  <option value="RECEPTIONIST">Receptionist (Requires Admin approval)</option>
                  <option value="PHARMACIST">Pharmacist (Requires Admin approval)</option>
                  <option value="LAB_TECH">Laboratory Technician (Requires Admin approval)</option>
                  <option value="HOSPITAL_ADMIN">Hospital Admin (Requires Admin approval)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2002/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-75 transition-button"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Register Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
