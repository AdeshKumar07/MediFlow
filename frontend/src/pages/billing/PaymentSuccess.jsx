import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Receipt, ArrowRight } from 'lucide-react';
import { billingService } from '../../services/billingService';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceId, invoiceNumber, amount, paymentId } = location.state || {};

  const handleDownloadReceipt = async () => {
    try {
      const res = await billingService.getPayments({ limit: 1 });
      const payment = res.data.payments?.[0];
      if (payment?.receiptNumber) {
        const pdf = await billingService.downloadReceiptPdf(payment._id);
        const url = URL.createObjectURL(new Blob([pdf.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.receiptNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.error('Receipt not found yet. Check Payment History.');
      }
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-md">
        {/* Animated Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-50 animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 font-outfit mb-2">Payment Successful!</h1>
        <p className="text-slate-500 text-sm mb-6 font-semibold">
          Your payment has been processed successfully.
        </p>

        {/* Transaction Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 mb-6">
          {invoiceNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold">Invoice</span>
              <span className="font-mono text-brand-600 font-bold">{invoiceNumber}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold">Amount Paid</span>
              <span className="text-emerald-700 font-extrabold text-base">₹{amount}</span>
            </div>
          )}
          {paymentId && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold">Payment ID</span>
              <span className="font-mono text-xs text-slate-700 truncate max-w-[160px] font-semibold" title={paymentId}>
                {paymentId}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold">Date</span>
            <span className="text-slate-800 font-semibold">{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-button"
          >
            <Download className="h-4 w-4" /> Download Receipt PDF
          </button>
          {invoiceId && (
            <button
              onClick={() => navigate(`/dashboard/billing/${invoiceId}`)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-50 border border-brand-200 text-brand-650 rounded-xl text-sm font-semibold hover:bg-brand-100 transition-button"
            >
              <Receipt className="h-4 w-4" /> View Invoice
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-sm font-semibold transition"
          >
            Back to Billing <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
