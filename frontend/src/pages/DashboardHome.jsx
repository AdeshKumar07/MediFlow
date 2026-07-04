import React, { Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, TrendingUp, Clock, HeartPulse, ShieldAlert, Activity } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Lazy-load role-specific dashboards
const AdminDashboard        = lazy(() => import('./dashboard/AdminDashboard'));
const DoctorDashboard       = lazy(() => import('./dashboard/DoctorDashboard'));
const ReceptionistDashboard = lazy(() => import('./dashboard/ReceptionistDashboard'));

// ─── Generic Fallback Dashboard (Pharmacist, Lab Tech, Patient, etc.) ─────────
const GenericDashboard = ({ user }) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const getEndpoint = (role) => role.toLowerCase().replace(/_/g, '-');
  const camelToTitle = (text) => {
    const r = text.replace(/([A-Z])/g, ' $1');
    return r.charAt(0).toUpperCase() + r.slice(1);
  };
  const getIcon = (i) => {
    const icons = [TrendingUp, Clock, Sparkles, HeartPulse];
    const Selected = icons[i % icons.length];
    return <Selected className="h-5 w-5 text-brand-600" />;
  };

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/${getEndpoint(user.role)}`);
        if (res.data?.success) setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load metrics.');
        toast.error('Failed to load dashboard metrics.');
      } finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800">Sync Error</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-white/10 blur-2xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Activity className="h-3.5 w-3.5" /> Portal Synchronized
          </div>
          <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-brand-100 mt-2">
            Terminal access: <strong className="text-white font-bold">{user?.role}</strong>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {Object.keys(stats).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(stats).map(([key, value], idx) => (
            <div key={key}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-card">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{camelToTitle(key)}</span>
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">{getIcon(idx)}</div>
              </div>
              <div className="mt-4 font-outfit text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">↑ Verified</span> system database value
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-sm text-center py-12 bg-white border border-slate-200 rounded-2xl">
          No metrics available for this role.
        </div>
      )}
    </div>
  );
};

// ─── Skeleton for Suspense ────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-36 rounded-3xl bg-slate-200" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-200" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-slate-200" />)}
    </div>
  </div>
);

import { Megaphone } from 'lucide-react';
import { getAnnouncements } from '../services/announcementService';

// ─── Main Router ──────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAnnouncements();
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      }
    };
    fetch();
  }, []);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
      case 'HOSPITAL_ADMIN':
        return <AdminDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard user={user} />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard user={user} />;
      default:
        return <GenericDashboard user={user} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Announcements Panel */}
      {announcements.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 text-left space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <Megaphone className="h-5 w-5 text-amber-700 animate-pulse" />
            <h2 className="font-outfit font-bold text-amber-900 text-sm sm:text-base">System Announcements & Broadcasts</h2>
          </div>
          <div className="space-y-4 divide-y divide-amber-100/60">
            {announcements.map((ann, idx) => (
              <div key={ann._id} className={`text-xs sm:text-sm font-medium text-amber-800 space-y-1 ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <span className="font-extrabold text-amber-950 font-outfit">{ann.title}</span>
                  <span className="text-[10px] text-amber-600 font-bold">
                    {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-amber-800/90 leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm">{ann.content}</p>
                <div className="text-[10px] text-amber-600/80 font-semibold italic">
                  — Broadcasted by {ann.senderId?.firstName} {ann.senderId?.lastName} ({ann.senderId?.role.replace('_', ' ')})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Suspense fallback={<DashboardSkeleton />}>
        {renderDashboard()}
      </Suspense>
    </div>
  );
};

export default DashboardHome;
