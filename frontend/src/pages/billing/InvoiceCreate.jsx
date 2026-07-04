import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { billingService } from '../../services/billingService';
import { getPatientList } from '../../services/patientService';
import toast from 'react-hot-toast';
import { Plus, Trash2, Receipt, Save, Send, Calculator } from 'lucide-react';

const CATEGORIES = ['consultation', 'medicine', 'laboratory', 'other'];

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, tax: 0, total: 0 });

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      patientId: '',
      discountType: 'fixed',
      discountValue: 0,
      taxRate: 0,
      notes: '',
      items: [{ description: '', category: 'consultation', quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');
  const watchDiscount = watch('discountValue');
  const watchDiscountType = watch('discountType');
  const watchTaxRate = watch('taxRate');

  useEffect(() => {
    getPatientList(1, 200).then(r => setPatients(r.data?.patients || [])).catch(() => {});
  }, []);

  // Live total calculation
  useEffect(() => {
    const subtotal = (watchItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);

    const discVal = parseFloat(watchDiscount) || 0;
    const taxRate = parseFloat(watchTaxRate) || 0;
    let discountAmt = watchDiscountType === 'percentage'
      ? (subtotal * discVal) / 100
      : discVal;
    discountAmt = Math.min(discountAmt, subtotal);
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmt;

    setTotals({
      subtotal: subtotal.toFixed(2),
      discount: discountAmt.toFixed(2),
      tax: taxAmt.toFixed(2),
      total: total.toFixed(2)
    });
  }, [watchItems, watchDiscount, watchDiscountType, watchTaxRate]);

  const onSubmit = async (data, asDraft = false) => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...data,
        discountValue: parseFloat(data.discountValue) || 0,
        taxRate: parseFloat(data.taxRate) || 0,
        items: data.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0
        }))
      };
      const res = await billingService.createInvoice(invoiceData);
      const invoiceId = res.data.invoice._id;

      if (!asDraft) {
        await billingService.finalizeInvoice(invoiceId);
        toast.success('Invoice created and sent for payment!');
      } else {
        toast.success('Invoice saved as draft');
      }
      navigate(`/dashboard/billing/${invoiceId}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <Receipt className="h-7 w-7 text-brand-600" />
            Generate Invoice
          </h1>
          <p className="text-slate-500 text-sm mt-1">Add line items for consultation, medicines, and lab charges</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Patient & Meta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Patient *</label>
              <select
                {...register('patientId', { required: 'Patient is required' })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                <option value="">Select patient…</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} — {p.email}
                  </option>
                ))}
              </select>
              {errors.patientId && <p className="text-red-650 text-xs mt-1 font-semibold">{errors.patientId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Notes</label>
              <input
                {...register('notes')}
                placeholder="Optional notes…"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ description: '', category: 'consultation', quantity: 1, unitPrice: 0 })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-50 border border-brand-200 text-brand-650 rounded-lg hover:bg-brand-100 transition-button"
            >
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price (₹)</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            {fields.map((field, index) => {
              const qty = parseFloat(watchItems?.[index]?.quantity) || 1;
              const price = parseFloat(watchItems?.[index]?.unitPrice) || 0;
              const amount = (qty * price).toFixed(2);
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-slate-50/50 rounded-xl p-3 border border-slate-200">
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      {...register(`items.${index}.description`, { required: true })}
                      placeholder="Item description"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <select
                      {...register(`items.${index}.category`)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number" min="1"
                      {...register(`items.${index}.quantity`, { min: 1 })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-805 text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number" min="0" step="0.01"
                      {...register(`items.${index}.unitPrice`, { min: 0 })}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-805 text-right focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-1 flex items-center justify-end pt-2">
                    <span className="text-sm font-extrabold text-emerald-700">₹{amount}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end pt-1">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount, Tax & Totals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-brand-650" />
            <h2 className="text-base font-bold text-slate-850">Summary & Adjustments</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Discount Type</label>
              <select
                {...register('discountType')}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Discount Value</label>
              <input
                type="number" min="0" step="0.01"
                {...register('discountValue')}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tax Rate (%)</label>
              <input
                type="number" min="0" max="100" step="0.01"
                {...register('taxRate')}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>

          {/* Total Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-semibold">
              <span>Subtotal</span>
              <span className="text-slate-900 font-bold">₹{totals.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-semibold">
              <span>Discount</span>
              <span className="text-red-700 font-bold">-₹{totals.discount}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-semibold">
              <span>Tax</span>
              <span className="text-slate-900 font-bold">₹{totals.tax}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-base font-bold text-slate-800">Total Amount</span>
              <span className="text-xl font-extrabold text-brand-650">₹{totals.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-705 hover:bg-slate-50 rounded-xl text-sm font-semibold transition disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-40"
          >
            {isSubmitting
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="h-4 w-4" />
            }
            Finalize & Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreate;
