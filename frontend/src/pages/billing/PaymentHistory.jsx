import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import toast from 'react-hot-toast';
import {
  History, Search, Download, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, CreditCard, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  CREATED: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  SUCCESS: { label: 'Success', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: RefreshCw },
};

const METHOD_LABELS = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  emi: 'EMI',
};

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await billingService.getPayments(params);
      setPayments(res.data.payments || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDownloadReceipt = async (paymentId, receiptNumber) => {
    setDownloadingId(paymentId);
    try {
      const res = await billingService.downloadReceiptPdf(paymentId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.razorpayPaymentId?.toLowerCase().includes(q) ||
      p.razorpayOrderId?.toLowerCase().includes(q) ||
      p.receiptNumber?.toLowerCase().includes(q) ||
      `${p.patientId?.firstName} ${p.patientId?.lastName}`.toLowerCase().includes(q)
    );
  });

  // Aggregate stats
  const successTotal = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-outfit">Transaction History</h1>
        <p className="text-slate-500 text-sm mt-1">{total} transaction{total !== 1 ? 's' : ''} total</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Transactions',
            value: total,
            icon: History,
            color: 'text-brand-600',
            bg: 'bg-brand-50'
          },
          {
            label: 'Successful Payments',
            value: payments.filter(p => p.status === 'SUCCESS').length,
            icon: CheckCircle,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50'
          },
          {
            label: 'Revenue Collected',
            value: `₹${successTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            color: 'text-amber-700',
            bg: 'bg-amber-50'
          }
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-card">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-extrabold mt-0.5 text-slate-900`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by payment ID, receipt, or patient…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
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
            <History className="h-10 w-10 text-slate-350 mb-3 animate-pulse" />
            <p className="text-slate-500 font-semibold text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Transaction</th>
                  {user?.role !== 'PATIENT' && (
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Patient</th>
                  )}
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Invoice</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Method</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(payment => {
                  const st = STATUS_CONFIG[payment.status] || STATUS_CONFIG.CREATED;
                  const Icon = st.icon;
                  return (
                    <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-brand-600 font-semibold">{payment.receiptNumber || '—'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]" title={payment.razorpayPaymentId}>
                          {payment.razorpayPaymentId || 'N/A'}
                        </p>
                      </td>
                      {user?.role !== 'PATIENT' && (
                        <td className="px-4 py-4">
                          <p className="text-slate-900 font-semibold">
                            {payment.patientId?.firstName} {payment.patientId?.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-normal">{payment.patientId?.email}</p>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-slate-600">
                          {payment.invoiceId?.invoiceNumber || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-500">
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || 'Online'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500 whitespace-nowrap text-xs">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-extrabold text-slate-900">₹{payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{payment.currency}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${st.bg} ${st.color}`}>
                            <Icon className="h-3 w-3" />
                            {st.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'SUCCESS' && payment.receiptNumber && (
                          <button
                            onClick={() => handleDownloadReceipt(payment._id, payment.receiptNumber)}
                            disabled={downloadingId === payment._id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg hover:bg-emerald-100 transition disabled:opacity-40"
                          >
                            {downloadingId === payment._id
                              ? <div className="h-3 w-3 border border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              : <Download className="h-3 w-3" />
                            }
                            Receipt
                          </button>
                        )}
                        {payment.status === 'FAILED' && (
                          <span className="text-xs text-red-650 italic truncate max-w-[100px] block" title={payment.failureReason}>
                            {payment.failureReason || 'Payment failed'}
                          </span>
                        )}
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

export default PaymentHistory;
