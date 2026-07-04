const billingRepository = require('../repositories/billing.repository');
const ApiError = require('../utils/apiError');

class BillingService {
  // ─── Invoice Methods ──────────────────────────────────────────────────────

  async getInvoices(user, queryParams) {
    const { page = 1, limit = 10, status, patientId, search } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    // Patients can only see their own invoices
    if (user.role === 'PATIENT') {
      filter.patientId = user._id;
    } else if (patientId) {
      filter.patientId = patientId;
    }

    if (status) filter.status = status;

    const invoices = await billingRepository.getInvoices(filter, skip, parseInt(limit));
    const total = await billingRepository.countInvoices(filter);

    return {
      invoices,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async getInvoiceById(id, user) {
    const invoice = await billingRepository.getInvoiceById(id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    // Patients can only access their own invoices
    if (user.role === 'PATIENT' && invoice.patientId._id.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Not authorized to view this invoice');
    }

    return invoice;
  }

  async createInvoice(data, createdBy) {
    // Calculate item amounts
    const processedItems = data.items.map(item => ({
      ...item,
      quantity: item.quantity || 1,
      amount: parseFloat(((item.quantity || 1) * item.unitPrice).toFixed(2))
    }));

    const invoiceData = {
      ...data,
      items: processedItems,
      createdBy
    };

    return await billingRepository.createInvoice(invoiceData);
  }

  async updateInvoice(id, data, user) {
    const invoice = await billingRepository.getInvoiceById(id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (invoice.status === 'PAID') {
      throw new ApiError(400, 'Cannot modify a paid invoice');
    }
    if (invoice.status === 'CANCELLED') {
      throw new ApiError(400, 'Cannot modify a cancelled invoice');
    }

    // Recalculate items if provided
    if (data.items) {
      data.items = data.items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        amount: parseFloat(((item.quantity || 1) * item.unitPrice).toFixed(2))
      }));
    }

    // Use findByIdAndUpdate but also need pre-save hook — use save approach
    const invoiceDoc = await billingRepository.getInvoiceDocument(id);
    Object.assign(invoiceDoc, data);
    await invoiceDoc.save();

    return invoiceDoc;
  }

  async deleteInvoice(id) {
    const invoice = await billingRepository.getInvoiceById(id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    if (invoice.status === 'PAID') {
      throw new ApiError(400, 'Cannot delete a paid invoice');
    }
    return await billingRepository.deleteInvoice(id);
  }

  async finalizeInvoice(id) {
    const invoiceDoc = await billingRepository.getInvoiceDocument(id);
    if (!invoiceDoc) throw new ApiError(404, 'Invoice not found');
    if (invoiceDoc.status !== 'DRAFT') {
      throw new ApiError(400, 'Only DRAFT invoices can be finalized');
    }
    invoiceDoc.status = 'PENDING';
    await invoiceDoc.save();
    return invoiceDoc;
  }

  // ─── Payment Summary ───────────────────────────────────────────────────────

  async getPaymentHistory(user, queryParams) {
    const { page = 1, limit = 10, status } = queryParams;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (user.role === 'PATIENT') {
      filter.patientId = user._id;
    }
    if (status) filter.status = status;

    const payments = await billingRepository.getPayments(filter, skip, parseInt(limit));
    const total = await billingRepository.countPayments(filter);

    return {
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async getPaymentById(id, user) {
    const payment = await billingRepository.getPaymentById(id);
    if (!payment) throw new ApiError(404, 'Payment record not found');
    if (user.role === 'PATIENT' && payment.patientId._id.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Not authorized to view this payment');
    }
    return payment;
  }
}

module.exports = new BillingService();
