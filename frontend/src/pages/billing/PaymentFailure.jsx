import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-md">
        {/* Failure Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200">
            <XCircle className="h-10 w-10 text-red-650" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 font-outfit mb-2">Payment Failed</h1>
        <p className="text-slate-500 text-sm mb-3 font-semibold">
          We were unable to process your payment. This could be due to:
        </p>
        <ul className="text-xs text-slate-600 space-y-1 mb-6 text-left bg-slate-50 rounded-xl p-4 border border-slate-200 font-medium">
          <li className="flex items-start gap-2"><span className="text-red-600 mt-0.5">•</span> Insufficient balance or card declined</li>
          <li className="flex items-start gap-2"><span className="text-red-600 mt-0.5">•</span> Network or connection interruption</li>
          <li className="flex items-start gap-2"><span className="text-red-600 mt-0.5">•</span> Payment session timeout</li>
          <li className="flex items-start gap-2"><span className="text-red-600 mt-0.5">•</span> Bank or UPI gateway error</li>
        </ul>

        <p className="text-xs text-slate-500 mb-6 font-semibold">
          If your amount was deducted, it will be automatically refunded within 5–7 business days.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard/billing/payments')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" /> View Transaction History
          </button>
          <p className="text-xs text-slate-550 font-semibold mt-2">
            Need help? Contact{' '}
            <a href="mailto:billing@mediflow.com" className="text-brand-600 hover:underline">
              billing@mediflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
