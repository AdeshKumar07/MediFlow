import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw,
  Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardAPI from '../../services/dashboardAPI';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING:     { cls: 'bg-amber-50 text-amber-700 border border-amber-200',   icon: Clock },
    CONFIRMED:   { cls: 'bg-blue-50 text-blue-700 border border-blue-200',     icon: CheckCircle2 },
    COMPLETED:   { cls: 'bg-emerald-50 text-emerald-705 border border-emerald-200', icon: CheckCircle2 },
    CANCELLED:   { cls: 'bg-red-50 text-red-700 border border-red-200',       icon: XCircle },
    RESCHEDULED: { cls: 'bg-purple-50 text-purple-700 border border-purple-200', icon: RotateCcw },
  };
  const s = map[status] || { cls: 'bg-slate-50 text-slate-600 border border-slate-200', icon: AlertCircle };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
};

// ─── Status Summary Card ──────────────────────────────────────────────────────
const StatusSummaryPill = ({ label, count, color }) => (
  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm transition-card">
    <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</span>
    <span className={`text-lg font-extrabold font-outfit ${color}`}>{count ?? 0}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AppointmentReport = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [filters, setFilters]     = useState({ status: '', startDate: '', endDate: '' });
  const [applied, setApplied]     = useState({});

  const fetchReport = useCallback(async (f, p) => {
    try {
      setLoading(true);
      const params = { ...f, page: p, limit: 15 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await dashboardAPI.getAppointmentReport(params);
      if (res.data?.success) setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load appointment report.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(applied, page); }, [fetchReport, applied, page]);

  const handleApply = () => { setPage(1); setApplied({ ...filters }); };
  const handleClear = () => { setFilters({ status: '', startDate: '', endDate: '' }); setApplied({}); setPage(1); };

  const { summary, appointments = [], pagination } = data || {};
  const ss = summary?.statusSummary || {};

  const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];
  const STATUS_COLOR_MAP = {
    PENDING:     'text-amber-600',
    CONFIRMED:   'text-blue-600',
    COMPLETED:   'text-emerald-600',
    CANCELLED:   'text-red-600',
    RESCHEDULED: 'text-purple-650',
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/home" className="text-slate-500 hover:text-slate-800 text-xs">Dashboard</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-555 text-xs font-medium">Appointment Report</span>
          </div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-amber-650" /> Appointment Report
          </h1>
        </div>
        <button onClick={() => fetchReport(applied, page)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-button">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider self-center mb-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" /> Filters
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors min-w-[150px]">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">From</label>
            <input type="date" value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">To</label>
            <input type="date" value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <button onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-button self-end">
            Apply
          </button>
          <button onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-250 transition-button self-end">
            Clear
          </button>
        </div>
      </div>

      {/* ── Status Summary ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm transition-card">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Total</span>
          <span className="text-lg font-extrabold font-outfit text-slate-900">{summary?.total ?? 0}</span>
        </div>
        {STATUS_OPTIONS.map(s => (
          <StatusSummaryPill key={s} label={s} count={ss[s]} color={STATUS_COLOR_MAP[s]} />
        ))}
      </div>

      {/* ── Appointments Table ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150">
          <h2 className="text-sm font-bold text-slate-800">Appointment Records</h2>
          {pagination && (
            <span className="text-xs text-slate-500">
              {pagination.total} records · Page {pagination.page} of {pagination.pages}
            </span>
          )}
        </div>

        <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Patient','Doctor','Date','Time Slot','Reason','Queue #','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 && !loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No appointments found</td></tr>
              ) : (
                appointments.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-900 font-semibold">
                      {a.patientId?.firstName} {a.patientId?.lastName}
                      <div className="text-slate-400 text-[10px] font-normal">{a.patientId?.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      Dr. {a.doctorId?.firstName} {a.doctorId?.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-550 whitespace-nowrap">
                      {new Date(a.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-550 whitespace-nowrap">{a.timeSlot}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{a.reason}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-center font-semibold">{a.queueNumber ?? '—'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-650 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${page === p ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-650 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AppointmentReport;
