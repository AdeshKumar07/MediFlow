import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 animate-fade-in font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-md border border-red-100">
          <ShieldAlert className="h-10 w-10 animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-slate-900">
            Access Denied
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Your current credential tier does not possess authorization to view this terminal node. 
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/dashboard/home')}
            className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold transition shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-slate-500" /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
