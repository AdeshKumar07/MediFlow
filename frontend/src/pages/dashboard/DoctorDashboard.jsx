import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Calendar, Clock, CheckCircle2, Users, Activity,
  TrendingUp, ShieldAlert, RefreshCw, ChevronRight, Stethoscope
} from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import StatCard from '../../components/ui/StatCard';
import { AppointmentTrendChart } from '../../components/charts/DashboardCharts';

// ─── Period pills ─────────────────────────────────────────────────────────────
const PERIODS = [
  { label: '7D',  value: '7d'  },
  { label: '30D', value: '30d' },
  { label: '3M',  value: '6m'  },
];

// ─── Appointment status badge ─────────────────────────────────────────────────
const QueueBadge = ({ status }) => {
  const map = {
    PENDING:     'bg-amber-50 text-amber-700 border border-amber-200',
    CONFIRMED:   'bg-blue-50 text-blue-700 border border-blue-200',
    COMPLETED:   'bg-emerald-50 text-emerald-705 border border-emerald-200',
    CANCELLED:   'bg-red-50 text-red-700 border border-red-200',
    RESCHEDULED: 'bg-purple-50 text-purple-700 border border-purple-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DoctorDashboard = ({ user }) => {
  const [stats, setStats]     = useState(null);
  const [charts, setCharts]   = useState(null);
  const [period, setPeriod]   = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardAPI.getDoctorStats();
      if (res.data?.success) setStats(res.data.data.stats);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load doctor metrics.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCharts = useCallback(async (p) => {
    try {
      setChartsLoading(true);
      const res = await dashboardAPI.getDoctorCharts(p);
      if (res.data?.success) setCharts(res.data.data.charts);
    } catch {
      toast.error('Failed to load chart data.');
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCharts(period); }, [fetchCharts, period]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-200" />)}
        </div>
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-red-650 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800">Sync Error</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button onClick={fetchStats} className="mt-3 flex items-center gap-1.5 text-xs text-brand-650 hover:text-brand-700 font-bold">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const todayList = stats?.todayList || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-white/10 blur-2xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Stethoscope className="h-3.5 w-3.5" /> Doctor Workstation
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight">
            Good day, Dr. {user?.lastName}
          </h1>
          <p className="text-sm text-brand-100 mt-1">
            Today you have <strong className="text-white font-bold">{stats?.todayTotal ?? 0}</strong> appointments scheduled.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total"
          value={stats?.todayTotal}
          subtitle="All appointments today"
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={stats?.todayPending}
          subtitle="Awaiting consultation"
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-amber-50" iconColor="text-amber-600"
          delay={60}
        />
        <StatCard
          title="Completed"
          value={stats?.todayCompleted}
          subtitle="Seen today"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          delay={120}
        />
        <StatCard
          title="Total Patients Seen"
          value={stats?.totalPatientsSeen}
          subtitle="Lifetime completed visits"
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-purple-50" iconColor="text-purple-600"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Appointment Trend Chart ─────────────────────────────── */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Appointment Trend</h3>
                <p className="text-xs text-slate-400">Your scheduling pattern</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {PERIODS.map(p => (
                <button key={p.value} onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    period === p.value ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className={`transition-opacity duration-300 ${chartsLoading ? 'opacity-40' : 'opacity-100'}`}>
            <AppointmentTrendChart
              data={charts?.appointmentTrend || []}
              height={240}
              showBreakdown={false}
            />
            {!charts?.appointmentTrend?.length && (
              <p className="text-center text-xs text-slate-500 mt-6">No appointment data for this period</p>
            )}
          </div>
        </div>

        {/* ── Quick Stats Panel ───────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-brand-600" /> Schedule Summary
          </h3>
          {[
            { label: 'Confirmed Today',      value: stats?.todayConfirmed,      color: 'text-blue-650',   bg: 'bg-blue-50 border-blue-100'  },
            { label: 'Upcoming All Time',    value: stats?.upcomingAll,         color: 'text-purple-650', bg: 'bg-purple-50 border-purple-100'},
            { label: 'Total Patients Seen',  value: stats?.totalPatientsSeen,   color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-100'},
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${item.bg}`}>
              <span className="text-xs text-slate-550 font-semibold">{item.label}</span>
              <span className={`text-lg font-bold font-outfit ${item.color}`}>{item.value ?? '—'}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Today's Appointment Queue ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-150">
          <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-650" /> Today's Appointment Queue
          </h3>
          <span className="text-xs text-slate-500">{todayList.length} appointment{todayList.length !== 1 ? 's' : ''}</span>
        </div>

        {todayList.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50">
            <CheckCircle2 className="h-10 w-10 text-slate-350 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-semibold">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayList.map((appt, i) => (
              <div key={appt._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="h-7 w-7 rounded-full bg-brand-50 flex items-center justify-center text-brand-650 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {appt.patientId?.firstName} {appt.patientId?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {appt.timeSlot} · {appt.reason?.slice(0, 50)}{appt.reason?.length > 50 ? '…' : ''}
                  </p>
                </div>
                <QueueBadge status={appt.status} />
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DoctorDashboard;
