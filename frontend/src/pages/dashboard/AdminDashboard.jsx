import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Users, UserCheck, DollarSign, Calendar, Pill,
  AlertTriangle, FileText, RefreshCw, TrendingUp,
  BarChart2, Activity, ArrowRight, ShieldAlert
} from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import StatCard from '../../components/ui/StatCard';
import {
  RevenueAreaChart,
  PatientGrowthBarChart,
  AppointmentTrendChart,
} from '../../components/charts/DashboardCharts';

// ─── Period Filter Pills ──────────────────────────────────────────────────────
const PERIODS = [
  { label: '7 Days',  value: '7d'  },
  { label: '30 Days', value: '30d' },
  { label: '6 Months',value: '6m'  },
  { label: '1 Year',  value: '12m' },
];

// ─── Chart Panel wrapper ──────────────────────────────────────────────────────
const ChartPanel = ({ title, subtitle, icon: Icon, children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${className}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
        <Icon className="h-4 w-4 text-brand-600" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [charts, setCharts]   = useState(null);
  const [period, setPeriod]   = useState('6m');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Fetch main stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardAPI.getAdminStats();
      if (res.data?.success) setStats(res.data.data.stats);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard metrics.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chart data
  const fetchCharts = useCallback(async (p) => {
    try {
      setChartsLoading(true);
      const res = await dashboardAPI.getAdminCharts(p);
      if (res.data?.success) setCharts(res.data.data.charts);
    } catch (err) {
      toast.error('Failed to load chart data.');
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCharts(period); }, [fetchCharts, period]);

  const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // ─── Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-200" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-slate-200" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-red-650 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800">Sync Error</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button onClick={fetchStats} className="mt-3 flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-bold">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Activity className="h-3.5 w-3.5" /> Admin Command Centre
          </div>
          <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hospital Analytics & Reports
          </h1>
          <p className="text-sm text-brand-100 mt-2 max-w-xl">
            Live aggregated metrics from all active modules. Data refreshes on every visit.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3 mt-5">
          <Link to="/dashboard/reports/revenue"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-600 hover:bg-brand-50 text-xs font-bold transition-button">
            <FileText className="h-3.5 w-3.5" /> Revenue Report
          </Link>
          <Link to="/dashboard/reports/patients"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700/40 text-white hover:bg-brand-700/60 text-xs font-bold transition-button border border-white/10">
            <Users className="h-3.5 w-3.5" /> Patient Report
          </Link>
          <Link to="/dashboard/reports/appointments"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700/40 text-white hover:bg-brand-700/60 text-xs font-bold transition-button border border-white/10">
            <Calendar className="h-3.5 w-3.5" /> Appointment Report
          </Link>
        </div>
      </div>

      {/* ── Stat Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients}
          subtitle="Registered in system"
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-cyan-50" iconColor="text-cyan-600"
          delay={0}
        />
        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors}
          subtitle="Active medical staff"
          icon={<UserCheck className="h-5 w-5" />}
          iconBg="bg-indigo-50" iconColor="text-indigo-600"
          delay={60}
        />
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue}
          subtitle="From paid invoices"
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          formatter={fmtCurrency}
          delay={120}
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments}
          subtitle="All statuses combined"
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-amber-50" iconColor="text-amber-600"
          delay={180}
        />
        <StatCard
          title="Medicine Stock"
          value={stats?.totalMedicines}
          subtitle={stats?.lowStockCount > 0 ? `⚠ ${stats.lowStockCount} low stock` : 'All stock healthy'}
          icon={<Pill className="h-5 w-5" />}
          iconBg={stats?.lowStockCount > 0 ? 'bg-red-50' : 'bg-purple-50'}
          iconColor={stats?.lowStockCount > 0 ? 'text-red-600' : 'text-purple-600'}
          delay={240}
        />
      </div>

      {/* ── Secondary Stats Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm transition-card">
          <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pending Invoices</p>
            <p className="text-xl font-bold text-slate-900 font-outfit">{stats?.pendingInvoices ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm transition-card">
          <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Low Stock Alerts</p>
            <p className="text-xl font-bold text-slate-900 font-outfit">{stats?.lowStockCount ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm transition-card">
          <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Receptionists</p>
            <p className="text-xl font-bold text-slate-900 font-outfit">{stats?.totalReceptionists ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm transition-card">
          <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">System Uptime</p>
            <p className="text-xl font-bold text-slate-900 font-outfit">99.9%</p>
          </div>
        </div>
      </div>

      {/* ── Period Filter ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="h-4.5 w-4.5 text-brand-650" /> Analytics Overview
        </h2>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                period === p.value
                  ? 'bg-white text-brand-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts Grid ────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${chartsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Revenue Chart — spans 2 cols */}
        <ChartPanel
          title="Revenue Trend"
          subtitle="Paid & partially paid invoices"
          icon={DollarSign}
          className="lg:col-span-2"
        >
          <RevenueAreaChart data={charts?.revenueChart || []} height={260} />
          {(!charts?.revenueChart?.length) && (
            <p className="text-center text-xs text-slate-500 mt-4">No revenue data for this period</p>
          )}
        </ChartPanel>

        {/* Patient Growth */}
        <ChartPanel title="Patient Growth" subtitle="New registrations per period" icon={Users}>
          <PatientGrowthBarChart data={charts?.patientGrowthChart || []} height={260} />
          {(!charts?.patientGrowthChart?.length) && (
            <p className="text-center text-xs text-slate-500 mt-4">No data for this period</p>
          )}
        </ChartPanel>

        {/* Appointment Trend — full width */}
        <ChartPanel
          title="Appointment Trends"
          subtitle="Breakdown by status across selected period"
          icon={Calendar}
          className="lg:col-span-3"
        >
          <AppointmentTrendChart data={charts?.appointmentTrendChart || []} height={240} />
          {(!charts?.appointmentTrendChart?.length) && (
            <p className="text-center text-xs text-slate-500 mt-4">No appointment data for this period</p>
          )}
        </ChartPanel>
      </div>

      {/* ── Quick Links ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Revenue Report', desc: 'Detailed invoice & payment analytics', path: '/dashboard/reports/revenue', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { title: 'Patient Report', desc: 'Demographics and growth analysis',      path: '/dashboard/reports/patients', icon: Users, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
          { title: 'Appointment Report', desc: 'Status breakdown and doctor stats', path: '/dashboard/reports/appointments', icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-50' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-500/20
                       shadow-sm hover:shadow-md transition-card group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-9 w-9 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
