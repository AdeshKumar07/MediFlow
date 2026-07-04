const billingService = require('../services/billing.service');
const ApiError = require('../utils/apiError');

class BillingController {
  async getInvoices(req, res, next) {
    try {
      const result = await billingService.getInvoices(req.user, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await billingService.getInvoiceById(req.params.id, req.user);
      res.status(200).json({ success: true, invoice });
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req, res, next) {
    try {
      const invoice = await billingService.createInvoice(req.body, req.user._id);
      res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req, res, next) {
    try {
      const invoice = await billingService.updateInvoice(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, message: 'Invoice updated successfully', invoice });
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req, res, next) {
    try {
      await billingService.deleteInvoice(req.params.id);
      res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async finalizeInvoice(req, res, next) {
    try {
      const invoice = await billingService.finalizeInvoice(req.params.id);
      res.status(200).json({ success: true, message: 'Invoice finalized and ready for payment', invoice });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req, res, next) {
    try {
      const result = await billingService.getPaymentHistory(req.user, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await billingService.getPaymentById(req.params.id, req.user);
      res.status(200).json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillingController();
