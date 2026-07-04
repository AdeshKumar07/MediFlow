import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  DollarSign, FileText, TrendingUp, Filter, ChevronLeft,
  ChevronRight, RefreshCw, CheckCircle, XCircle,
  Clock, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardAPI from '../../services/dashboardAPI';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PAID:           { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
    PARTIALLY_PAID: { cls: 'bg-amber-50 text-amber-700 border border-amber-200',   icon: AlertCircle },
    PENDING:        { cls: 'bg-orange-50 text-orange-750 border border-orange-200',   icon: Clock       },
    DRAFT:          { cls: 'bg-slate-50  text-slate-600 border border-slate-200',    icon: FileText    },
    CANCELLED:      { cls: 'bg-red-50    text-red-705 border border-red-200',      icon: XCircle     },
  };
  const s = map[status] || map.DRAFT;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      <Icon className="h-3 w-3" /> {status?.replace('_', ' ')}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, bgColor }) => (
  <div className="glass rounded-2xl p-5 bg-white border border-slate-200 shadow-sm transition-card">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
      <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    </div>
    <p className={`font-outfit text-2xl font-extrabold text-slate-900`}>{value ?? '—'}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RevenueReport = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [filters, setFilters]     = useState({ startDate: '', endDate: '' });
  const [applied, setApplied] = useState({});

  const fetchReport = useCallback(async (f, p) => {
    try {
      setLoading(true);
      const params = { ...f, page: p, limit: 15 };
      const res = await dashboardAPI.getRevenueReport(params);
      if (res.data?.success) setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load revenue report.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(applied, page); }, [fetchReport, applied, page]);

  const handleApplyFilters = () => { setPage(1); setApplied({ ...filters }); };
  const handleClear = () => { setFilters({ startDate: '', endDate: '' }); setApplied({}); setPage(1); };

  const fmtCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const { summary, invoices = [], pagination } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/home" className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 text-xs font-medium">Revenue Report</span>
          </div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-600" /> Revenue Report
          </h1>
        </div>
        <button
          onClick={() => fetchReport(applied, page)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-button"
        >
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
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">From</label>
            <input
              type="date" value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">To</label>
            <input
              type="date" value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <button onClick={handleApplyFilters}
            className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-button self-end">
            Apply
          </button>
          <button onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-250 transition-button self-end">
            Clear
          </button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Revenue" value={fmtCurrency(summary?.totalRevenue)} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-50" />
        <SummaryCard label="Total Invoices" value={summary?.totalInvoices} icon={FileText} color="text-indigo-600" bgColor="bg-indigo-50" />
        <SummaryCard label="Paid" value={summary?.paidCount} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
        <SummaryCard label="Pending" value={summary?.pendingCount} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard label="Cancelled" value={summary?.cancelledCount} icon={XCircle} color="text-red-650" bgColor="bg-red-50" />
      </div>

      {/* ── Invoice Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150">
          <h2 className="text-sm font-bold text-slate-800">Invoice Details</h2>
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
                {['Invoice #','Patient','Date','Items','Subtotal','Discount','Tax','Total','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 && !loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 text-sm">
                    No invoices found for selected period
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-brand-600 font-semibold">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3.5 text-slate-900 font-medium">
                      {inv.patientId?.firstName} {inv.patientId?.lastName}
                      <div className="text-slate-400 text-[10px] font-normal">{inv.patientId?.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-550 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{inv.items?.length || 0}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{fmtCurrency(inv.subtotal)}</td>
                    <td className="px-4 py-3.5 text-red-600">-{fmtCurrency(inv.discountAmount)}</td>
                    <td className="px-4 py-3.5 text-amber-600">+{fmtCurrency(inv.taxAmount)}</td>
                    <td className="px-4 py-3.5 text-slate-900 font-extrabold">{fmtCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={inv.status} /></td>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === p ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default RevenueReport;
