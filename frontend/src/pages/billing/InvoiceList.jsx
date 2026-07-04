import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import toast from 'react-hot-toast';
import {
  Receipt, Plus, Search, Eye, Trash2,
  CheckCircle, Clock, XCircle, AlertCircle, FileText, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: FileText },
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  PAID: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  PARTIALLY_PAID: { label: 'Partial', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

const InvoiceList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const isAdmin = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'].includes(user?.role);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await billingService.getInvoices(params);
      setInvoices(res.data.invoices || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await billingService.deleteInvoice(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleDownloadPdf = async (id, invoiceNumber) => {
    setDownloadingId(id);
    try {
      const res = await billingService.downloadInvoicePdf(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      `${inv.patientId?.firstName} ${inv.patientId?.lastName}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-outfit">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} invoice{total !== 1 ? 's' : ''} total
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/dashboard/billing/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-button"
          >
            <Plus className="h-4 w-4" /> Generate Invoice
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice # or patient name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition min-w-[150px]"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50">
            <Receipt className="h-10 w-10 text-slate-350 mb-3 animate-pulse" />
            <p className="text-slate-500 font-semibold text-sm">No invoices found</p>
            {isAdmin && (
              <Link to="/dashboard/billing/new" className="mt-4 text-brand-600 text-sm hover:underline font-bold">
                Generate your first invoice →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Invoice #</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => {
                  const st = STATUS_CONFIG[inv.status] || STATUS_CONFIG.DRAFT;
                  const Icon = st.icon;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-brand-600 font-semibold text-xs">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{inv.patientId?.firstName} {inv.patientId?.lastName}</p>
                        <p className="text-xs text-slate-400 font-normal">{inv.patientId?.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-extrabold text-slate-900">₹{inv.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${st.bg} ${st.color}`}>
                            <Icon className="h-3 w-3" />
                            {st.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/billing/${inv._id}`)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                            disabled={downloadingId === inv._id}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-40"
                            title="Download PDF"
                          >
                            {downloadingId === inv._id
                              ? <div className="h-4 w-4 border border-slate-500 border-t-transparent rounded-full animate-spin" />
                              : <Download className="h-4 w-4" />
                            }
                          </button>
                          {isAdmin && inv.status !== 'PAID' && (
                            <button
                              onClick={() => handleDelete(inv._id)}
                              className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
