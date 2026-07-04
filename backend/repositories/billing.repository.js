const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');

class BillingRepository {
  // Invoice methods
  async createInvoice(data) {
    return await Invoice.create(data);
  }

  async getInvoices(query = {}, skip = 0, limit = 10) {
    return await Invoice.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId', 'date timeSlot')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countInvoices(query = {}) {
    return await Invoice.countDocuments(query);
  }

  async getInvoiceById(id) {
    return await Invoice.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('appointmentId', 'date timeSlot reason')
      .populate('createdBy', 'firstName lastName role')
      .lean();
  }

  async updateInvoice(id, data) {
    return await Invoice.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async deleteInvoice(id) {
    return await Invoice.findByIdAndDelete(id);
  }

  async getInvoiceDocument(id) {
    // Returns Mongoose document (not lean) for save()
    return await Invoice.findById(id).populate('patientId', 'firstName lastName email');
  }

  // Payment methods
  async createPayment(data) {
    return await Payment.create(data);
  }

  async getPayments(query = {}, skip = 0, limit = 10) {
    return await Payment.find(query)
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countPayments(query = {}) {
    return await Payment.countDocuments(query);
  }

  async getPaymentById(id) {
    return await Payment.findById(id)
      .populate('invoiceId')
      .populate('patientId', 'firstName lastName email phone')
      .lean();
  }

  async getPaymentByOrderId(orderId) {
    return await Payment.findOne({ razorpayOrderId: orderId });
  }

  async updatePayment(id, data) {
    return await Payment.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new BillingRepository();
