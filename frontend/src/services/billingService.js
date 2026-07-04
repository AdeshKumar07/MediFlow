import api from './api';

export const billingService = {
  // ── Invoice APIs ────────────────────────────────────────────────────────────
  getInvoices: (params = {}) =>
    api.get('/api/billing/invoices', { params }),

  getInvoiceById: (id) =>
    api.get(`/api/billing/invoices/${id}`),

  createInvoice: (data) =>
    api.post('/api/billing/invoices', data),

  updateInvoice: (id, data) =>
    api.put(`/api/billing/invoices/${id}`, data),

  deleteInvoice: (id) =>
    api.delete(`/api/billing/invoices/${id}`),

  finalizeInvoice: (id) =>
    api.patch(`/api/billing/invoices/${id}/finalize`),

  downloadInvoicePdf: (id) =>
    api.get(`/api/billing/invoices/${id}/pdf`, { responseType: 'blob' }),

  // ── Payment APIs ─────────────────────────────────────────────────────────────
  getPayments: (params = {}) =>
    api.get('/api/billing/payments', { params }),

  getPaymentById: (id) =>
    api.get(`/api/billing/payments/${id}`),

  createOrder: (invoiceId) =>
    api.post('/api/billing/payments/create-order', { invoiceId }),

  verifyPayment: (data) =>
    api.post('/api/billing/payments/verify', data),

  recordFailure: (data) =>
    api.post('/api/billing/payments/failure', data),

  downloadReceiptPdf: (paymentId) =>
    api.get(`/api/billing/payments/${paymentId}/receipt`, { responseType: 'blob' }),
};
