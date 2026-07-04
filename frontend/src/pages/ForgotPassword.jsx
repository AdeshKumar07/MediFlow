import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Activity, Mail, ArrowLeft, Key, Copy, Check } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await forgotPassword(data.email);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Reset token generated!');
      setResetToken(result.resetToken);
    } else {
      toast.error(result.error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    toast.success('Token copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Log In
          </Link>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
            <Key className="h-6 w-6" />
          </div>
          <h1 className="mt-3 font-outfit text-3xl font-bold text-slate-900">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your account email to request a reset token
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
          {!resetToken ? (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="admin@mediflow.com"
                    className={`w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                    } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 text-sm`}
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-75 transition-button"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Generate Reset Token'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-left">
                <span className="text-xs text-slate-500 font-semibold block mb-2 uppercase tracking-wider">
                  Generated Reset Token (Mock Flow):
                </span>
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 select-all font-mono text-sm text-brand-600 break-all">
                  <span>{resetToken}</span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block mt-2 leading-relaxed">
                  Copy this token. You will need to paste it on the next screen to finalize your credentials update.
                </span>
              </div>

              <button
                onClick={() => navigate('/reset-password')}
                className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-button"
              >
                Proceed to Reset Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
