import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Lock, ShieldAlert, CheckSquare } from 'lucide-react';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordVal = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await resetPassword(data.token, data.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Password updated successfully! Please login with your new credentials.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Token Request
          </Link>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h1 className="mt-3 font-outfit text-3xl font-bold text-slate-900">
            Set New Password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit your reset token and your desired password
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Token */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Authentication Token
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="Paste token here..."
                  className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                    errors.token ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 font-mono text-xs`}
                  {...register('token', { required: 'Reset token is required' })}
                />
              </div>
              {errors.token && (
                <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                    errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-white pl-9 pr-4 py-2 rounded-xl border ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === passwordVal || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
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
                'Submit Password Update'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
