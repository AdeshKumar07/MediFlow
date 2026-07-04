import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import toast from 'react-hot-toast';
import {
  Receipt, Download, CreditCard, ArrowLeft, CheckCircle,
  Clock, XCircle, FileText, AlertCircle, User, Calendar, Tag
} from 'lucide-react';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: FileText },
  PENDING: { label: 'Pending Payment', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  PAID: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  PARTIALLY_PAID: { label: 'Partially Paid', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

const CATEGORY_COLORS = {
  consultation: 'bg-purple-50 text-purple-750 border-purple-200',
  medicine: 'bg-teal-50 text-teal-750 border-teal-200',
  laboratory: 'bg-cyan-50 text-cyan-750 border-cyan-200',
  other: 'bg-slate-50 text-slate-700 border-slate-200',
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const isAdmin = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST'].includes(user?.role);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoiceById(id);
      setInvoice(res.data.invoice);
    } catch {
      toast.error('Failed to load invoice');
      navigate('/dashboard/billing');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await billingService.finalizeInvoice(id);
      toast.success('Invoice finalized — ready for payment');
      fetchInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to finalize invoice');
    } finally {
      setFinalizing(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const res = await billingService.createOrder(id);
      const { orderId, amount, currency, keyId, invoiceNumber, patientName, patientEmail } = res.data;

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'MediFlow Healthcare',
        description: `Invoice ${invoiceNumber}`,
        image: '',
        order_id: orderId,
        prefill: {
          name: patientName,
          email: patientEmail,
        },
        theme: { color: '#2563EB' },
        handler: async (response) => {
          try {
            await billingService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: id
            });
            toast.success('Payment successful! 🎉');
            navigate('/dashboard/billing/payment-success', {
              state: {
                invoiceId: id,
                invoiceNumber,
                amount: (amount / 100).toFixed(2),
                paymentId: response.razorpay_payment_id
              }
            });
          } catch (err) {
            toast.error('Payment verification failed');
            navigate('/dashboard/billing/payment-failure');
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await billingService.recordFailure({ razorpay_order_id: orderId, reason: 'User dismissed payment modal' });
            } catch {}
            toast.error('Payment cancelled');
            setPaying(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', async (response) => {
        try {
          await billingService.recordFailure({
            razorpay_order_id: orderId,
            reason: response.error?.description
          });
        } catch {}
        navigate('/dashboard/billing/payment-failure');
      });
      razorpayInstance.open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
      setPaying(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingInvoice(true);
    try {
      const res = await billingService.downloadInvoicePdf(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) return null;

  const st = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const StIcon = st.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-outfit flex items-center gap-2">
              Invoice <span className="text-brand-600 font-mono text-lg">{invoice.invoiceNumber}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Created {new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingInvoice}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-button disabled:opacity-40"
          >
            {downloadingInvoice
              ? <div className="h-4 w-4 border border-slate-500 border-t-transparent rounded-full animate-spin" />
              : <Download className="h-4 w-4" />
            }
            PDF
          </button>
          {isAdmin && invoice.status === 'DRAFT' && (
            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-40"
            >
              {finalizing
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Receipt className="h-4 w-4" />
              }
              Finalize
            </button>
          )}
          {invoice.status === 'PENDING' && (
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-40"
            >
              {paying
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <CreditCard className="h-4 w-4" />
              }
              Pay Now
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 ${st.bg}`}>
        <StIcon className={`h-5 w-5 flex-shrink-0 ${st.color}`} />
        <div>
          <p className={`font-semibold text-sm ${st.color}`}>{st.label}</p>
          <p className="text-xs text-slate-650 mt-0.5 font-medium">
            {invoice.status === 'PAID' && 'Payment has been received successfully.'}
            {invoice.status === 'PENDING' && 'Payment is pending. Click "Pay Now" to complete.'}
            {invoice.status === 'DRAFT' && 'This invoice is in draft mode. Finalize it to allow payment.'}
            {invoice.status === 'CANCELLED' && 'This invoice has been cancelled.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-800">Patient Information</h2>
            </div>
            <p className="font-bold text-slate-900 text-base">
              {invoice.patientId?.firstName} {invoice.patientId?.lastName}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{invoice.patientId?.email}</p>
            {invoice.patientId?.phone && (
              <p className="text-sm text-slate-500">{invoice.patientId.phone}</p>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-150">
              <h2 className="text-sm font-bold text-slate-805">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-500 px-5 py-3">Description</th>
                    <th className="text-center text-xs font-bold text-slate-500 px-3 py-3">Category</th>
                    <th className="text-center text-xs font-bold text-slate-500 px-3 py-3">Qty</th>
                    <th className="text-right text-xs font-bold text-slate-500 px-3 py-3">Unit Price</th>
                    <th className="text-right text-xs font-bold text-slate-500 px-5 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{item.description}</p>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-3.5 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-650 font-medium leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right — Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 sticky top-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-805 flex items-center gap-2">
              <Tag className="h-4.5 w-4.5 text-brand-650" /> Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{invoice.subtotal?.toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-slate-550">
                  <span>
                    Discount
                    {invoice.discountType === 'percentage' && ` (${invoice.discountValue}%)`}
                  </span>
                  <span className="text-red-650 font-semibold">-₹{invoice.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-550">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="text-slate-900 font-semibold">₹{invoice.taxAmount?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-slate-150 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">Total</span>
                <span className="text-2xl font-black text-brand-600 font-outfit">₹{invoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-150 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </div>

            {invoice.status === 'PENDING' && (
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-40"
              >
                {paying
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <CreditCard className="h-4 w-4" />
                }
                Pay ₹{invoice.totalAmount?.toFixed(2)} Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
