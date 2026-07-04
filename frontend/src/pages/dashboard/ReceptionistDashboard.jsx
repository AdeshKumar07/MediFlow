import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Calendar, Users, Clock, UserCheck, Activity,
  TrendingUp, ShieldAlert, RefreshCw, ChevronRight,
  MonitorDot, BookOpen, BarChart2
} from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import StatCard from '../../components/ui/StatCard';
import { AppointmentTrendChart, StatusPieChart } from '../../components/charts/DashboardCharts';

const PERIODS = [
  { label: '7D',  value: '7d'  },
  { label: '30D', value: '30d' },
];

const QueueBadge = ({ status }) => {
  const map = {
    PENDING:     'bg-amber-50 text-amber-700 border border-amber-250',
    CONFIRMED:   'bg-blue-50 text-blue-700 border border-blue-250',
    COMPLETED:   'bg-emerald-50 text-emerald-705 border border-emerald-250',
    CANCELLED:   'bg-red-50 text-red-700 border border-red-250',
    RESCHEDULED: 'bg-purple-50 text-purple-700 border border-purple-250',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ReceptionistDashboard = ({ user }) => {
  const [stats, setStats]     = useState(null);
  const [charts, setCharts]   = useState(null);
  const [period, setPeriod]   = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [queueFilter, setQueueFilter] = useState('ALL');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await dashboardAPI.getReceptionistStats();
      if (res.data?.success) setStats(res.data.data.stats);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load metrics.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  }, []);

  const fetchCharts = useCallback(async (p) => {
    try {
      setChartsLoading(true);
      const res = await dashboardAPI.getReceptionistCharts(p);
      if (res.data?.success) setCharts(res.data.data.charts);
    } catch { toast.error('Failed to load chart data.'); }
    finally { setChartsLoading(false); }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200" />
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
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

  const queue = stats?.todayQueue || [];
  const filteredQueue = queueFilter === 'ALL' ? queue : queue.filter(a => a.status === queueFilter);

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-white/10 blur-2xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <MonitorDot className="h-3.5 w-3.5" /> Reception Desk
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight">
            Front Desk, {user?.firstName}
          </h1>
          <p className="text-sm text-brand-100 mt-1">
            Managing today's patient flow · <strong className="text-white font-bold">{queue.length}</strong> patients in queue
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3 mt-5">
          <Link to="/dashboard/appointments/book"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-600 hover:bg-brand-50 text-xs font-bold transition-button">
            <BookOpen className="h-3.5 w-3.5" /> Book Appointment
          </Link>
          <Link to="/dashboard/patients"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700/40 text-white hover:bg-brand-700/60 text-xs font-bold transition-button border border-white/10">
            <Users className="h-3.5 w-3.5" /> Patient Register
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Check-ins Today"
          value={stats?.checkInsToday}
          subtitle="Completed consultations"
          icon={<UserCheck className="h-5 w-5" />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          delay={0}
        />
        <StatCard
          title="Pending Queue"
          value={stats?.pendingConsultations}
          subtitle="Awaiting doctor"
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-amber-50" iconColor="text-amber-600"
          delay={60}
        />
        <StatCard
          title="Available Doctors"
          value={stats?.availableDoctors}
          subtitle="Active and on-duty"
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          delay={120}
        />
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointmentsEver}
          subtitle="All time bookings"
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-purple-50" iconColor="text-purple-600"
          delay={180}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appointment Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Appointment Trend</h3>
                <p className="text-xs text-slate-400">Daily volume pattern</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {PERIODS.map(p => (
                <button key={p.value} onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    period === p.value ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-855'
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
              showBreakdown={true}
            />
            {!charts?.appointmentTrend?.length && (
              <p className="text-center text-xs text-slate-500 mt-6">No data for this period</p>
            )}
          </div>
        </div>

        {/* Status Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-850">Status Breakdown</h3>
                <p className="text-xs text-slate-400">Selected period</p>
              </div>
            </div>
            {charts?.statusData?.length > 0 ? (
              <>
                <StatusPieChart data={charts.statusData} height={170} />
                <div className="mt-3 space-y-2">
                  {charts.statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: ['#2563EB','#0D9488','#16A34A','#D97706','#DC2626'][i % 5] }} />
                        <span className="text-slate-550 capitalize">{d.name}</span>
                      </div>
                      <span className="text-slate-800 font-extrabold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-semibold">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Today's Queue Table ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-150 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-brand-650" /> Today's Patient Queue
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s => (
              <button key={s} onClick={() => setQueueFilter(s)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  queueFilter === s ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/20">
            <Calendar className="h-10 w-10 text-slate-350 mx-auto mb-3" />
            <p className="text-sm text-slate-555 font-semibold">No appointments in this category today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">Patient</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">Time Slot</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">Reason</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((appt, i) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-semibold">{appt.queueNumber || i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {appt.patientId?.firstName} {appt.patientId?.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      Dr. {appt.doctorId?.lastName || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-550 whitespace-nowrap">{appt.timeSlot}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-[160px] truncate">{appt.reason}</td>
                    <td className="px-5 py-3.5">
                      <QueueBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ReceptionistDashboard;
