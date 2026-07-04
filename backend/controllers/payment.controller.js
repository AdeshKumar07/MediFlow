const paymentService = require('../services/payment.service');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const result = await paymentService.createOrder(req.body.invoiceId, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;
      const result = await paymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        invoiceId
      });
      res.status(200).json({ success: true, message: 'Payment verified successfully', ...result });
    } catch (error) {
      next(error);
    }
  }

  async paymentFailure(req, res, next) {
    try {
      const { razorpay_order_id, reason } = req.body;
      await paymentService.recordFailure(razorpay_order_id, reason);
      res.status(200).json({ success: false, message: 'Payment failure recorded' });
    } catch (error) {
      next(error);
    }
  }

  async downloadInvoicePdf(req, res, next) {
    try {
      await paymentService.generateInvoicePdf(req.params.id, req.user, res);
    } catch (error) {
      next(error);
    }
  }

  async downloadReceiptPdf(req, res, next) {
    try {
      await paymentService.generateReceiptPdf(req.params.id, req.user, res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
