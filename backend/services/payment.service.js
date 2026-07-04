const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const billingRepository = require('../repositories/billing.repository');
const ApiError = require('../utils/apiError');

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new ApiError(500, 'Razorpay credentials not configured');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

class PaymentService {
  // ─── Create Razorpay Order ────────────────────────────────────────────────
  async createOrder(invoiceId, user) {
    const invoice = await billingRepository.getInvoiceById(invoiceId);
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    if (invoice.status === 'PAID') throw new ApiError(400, 'Invoice is already paid');
    if (invoice.status === 'CANCELLED') throw new ApiError(400, 'Invoice is cancelled');
    if (invoice.status === 'DRAFT') throw new ApiError(400, 'Invoice must be finalized (PENDING) before payment');

    const razorpay = getRazorpay();

    // Razorpay amount in paise (multiply by 100)
    const amountInPaise = Math.round(invoice.totalAmount * 100);
    const receipt = `rcpt_${invoiceId.toString().slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        invoiceId: invoiceId.toString(),
        patientName: `${invoice.patientId.firstName} ${invoice.patientId.lastName}`,
        invoiceNumber: invoice.invoiceNumber
      }
    });

    // Persist as CREATED payment record
    const payment = await billingRepository.createPayment({
      invoiceId,
      patientId: invoice.patientId._id || invoice.patientId,
      razorpayOrderId: order.id,
      amount: invoice.totalAmount,
      currency: 'INR',
      status: 'CREATED'
    });

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      invoiceNumber: invoice.invoiceNumber,
      patientName: `${invoice.patientId.firstName} ${invoice.patientId.lastName}`,
      patientEmail: invoice.patientId.email
    };
  }

  // ─── Verify Razorpay Signature ─────────────────────────────────────────────
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new ApiError(500, 'Razorpay secret not configured');

    // HMAC-SHA256 verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    const paymentDoc = await billingRepository.getPaymentByOrderId(razorpay_order_id);

    if (!paymentDoc) {
      throw new ApiError(404, 'Payment record not found for this order');
    }

    if (isValid) {
      // Get Razorpay payment details for method info
      let paymentMethod = null;
      try {
        const razorpay = getRazorpay();
        const rpPayment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = rpPayment.method || null;
      } catch (e) {
        // non-fatal
      }

      paymentDoc.razorpayPaymentId = razorpay_payment_id;
      paymentDoc.razorpaySignature = razorpay_signature;
      paymentDoc.status = 'SUCCESS';
      paymentDoc.paymentMethod = paymentMethod;
      await paymentDoc.save(); // triggers receipt number generation

      // Mark invoice as PAID
      const invoiceDoc = await billingRepository.getInvoiceDocument(invoiceId);
      if (invoiceDoc) {
        invoiceDoc.status = 'PAID';
        await invoiceDoc.save();
      }

      return { success: true, payment: paymentDoc, receiptNumber: paymentDoc.receiptNumber };
    } else {
      paymentDoc.status = 'FAILED';
      paymentDoc.failureReason = 'Signature verification failed';
      await paymentDoc.save();

      throw new ApiError(400, 'Payment verification failed — signature mismatch');
    }
  }

  // ─── Record Manual Failure ─────────────────────────────────────────────────
  async recordFailure(orderId, reason) {
    const paymentDoc = await billingRepository.getPaymentByOrderId(orderId);
    if (paymentDoc) {
      paymentDoc.status = 'FAILED';
      paymentDoc.failureReason = reason || 'User cancelled or payment failed';
      await paymentDoc.save();
    }
    return { success: false };
  }

  // ─── Invoice PDF ───────────────────────────────────────────────────────────
  async generateInvoicePdf(invoiceId, user, res) {
    const invoice = await billingRepository.getInvoiceById(invoiceId);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (user.role === 'PATIENT' && invoice.patientId._id.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    this._buildInvoicePdf(doc, invoice);
    doc.end();
  }

  // ─── Receipt PDF ───────────────────────────────────────────────────────────
  async generateReceiptPdf(paymentId, user, res) {
    const payment = await billingRepository.getPaymentById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found');
    if (payment.status !== 'SUCCESS') throw new ApiError(400, 'Receipt only available for successful payments');

    if (user.role === 'PATIENT' && payment.patientId._id.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${payment.receiptNumber}.pdf"`);
    doc.pipe(res);

    this._buildReceiptPdf(doc, payment);
    doc.end();
  }

  // ─── PDF Builder: Invoice ──────────────────────────────────────────────────
  _buildInvoicePdf(doc, invoice) {
    const colors = { primary: '#4F46E5', accent: '#06B6D4', dark: '#0F172A', muted: '#64748B' };
    const patient = invoice.patientId;

    // Header
    doc.rect(0, 0, 595, 110).fill(colors.dark);
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#FFFFFF').text('MediFlow', 50, 30);
    doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Enterprise Hospital Management System', 50, 60);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.accent).text('INVOICE', 400, 38, { align: 'right' });

    doc.fillColor(colors.dark);

    // Invoice Meta
    doc.rect(0, 110, 595, 1).fill('#E2E8F0');
    doc.moveDown(0.5);
    const metaY = 125;
    doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text('Invoice Number', 50, metaY);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.dark).text(invoice.invoiceNumber, 50, metaY + 14);

    doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text('Issue Date', 200, metaY);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.dark).text(
      new Date(invoice.createdAt).toLocaleDateString('en-IN'), 200, metaY + 14
    );

    doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text('Due Date', 350, metaY);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.dark).text(
      new Date(invoice.dueDate).toLocaleDateString('en-IN'), 350, metaY + 14
    );

    const statusColor = invoice.status === 'PAID' ? '#10B981' : invoice.status === 'PENDING' ? '#F59E0B' : '#EF4444';
    doc.roundedRect(450, metaY, 90, 28, 4).fill(statusColor + '20');
    doc.fontSize(10).font('Helvetica-Bold').fillColor(statusColor).text(invoice.status, 455, metaY + 9);

    // Bill To
    doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text('BILLED TO', 50, 185);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(colors.dark).text(
      `${patient.firstName} ${patient.lastName}`, 50, 200
    );
    doc.fontSize(10).font('Helvetica').fillColor(colors.muted).text(patient.email || '', 50, 216);
    if (patient.phone) {
      doc.text(`Phone: ${patient.phone}`, 50, 230);
    }

    // Items Table
    const tableTop = 270;
    doc.rect(50, tableTop, 495, 24).fill(colors.primary);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('DESCRIPTION', 60, tableTop + 8);
    doc.text('CATEGORY', 240, tableTop + 8);
    doc.text('QTY', 340, tableTop + 8, { width: 40, align: 'center' });
    doc.text('UNIT PRICE', 390, tableTop + 8, { width: 70, align: 'right' });
    doc.text('AMOUNT', 465, tableTop + 8, { width: 75, align: 'right' });

    let rowY = tableTop + 28;
    invoice.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      doc.rect(50, rowY - 4, 495, 22).fill(bg);
      doc.fontSize(9).font('Helvetica').fillColor(colors.dark);
      doc.text(item.description, 60, rowY, { width: 175 });
      doc.text(item.category.toUpperCase(), 240, rowY, { width: 90 });
      doc.text(String(item.quantity || 1), 340, rowY, { width: 40, align: 'center' });
      doc.text(`₹${item.unitPrice.toFixed(2)}`, 390, rowY, { width: 70, align: 'right' });
      doc.text(`₹${item.amount.toFixed(2)}`, 465, rowY, { width: 75, align: 'right' });
      rowY += 24;
    });

    // Summary
    const summaryTop = rowY + 20;
    doc.rect(350, summaryTop, 195, 1).fill('#E2E8F0');

    const addSummaryRow = (label, value, y, bold = false, color = colors.dark) => {
      doc.fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(colors.muted).text(label, 355, y);
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color).text(value, 460, y, { align: 'right', width: 80 });
    };

    addSummaryRow('Subtotal', `₹${invoice.subtotal.toFixed(2)}`, summaryTop + 8);
    addSummaryRow(
      `Discount (${invoice.discountType === 'percentage' ? invoice.discountValue + '%' : 'Fixed'})`,
      `-₹${invoice.discountAmount.toFixed(2)}`, summaryTop + 24, false, '#EF4444'
    );
    addSummaryRow(`Tax (${invoice.taxRate}%)`, `₹${invoice.taxAmount.toFixed(2)}`, summaryTop + 40);

    doc.rect(350, summaryTop + 58, 195, 1).fill(colors.primary);
    doc.rect(350, summaryTop + 62).fill(colors.primary + '10');
    addSummaryRow('TOTAL AMOUNT', `₹${invoice.totalAmount.toFixed(2)}`, summaryTop + 65, true, colors.primary);

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor(colors.muted)
      .text('Thank you for choosing MediFlow Healthcare. For queries, contact billing@mediflow.com', 50, 740, { align: 'center', width: 495 });
  }

  // ─── PDF Builder: Receipt ──────────────────────────────────────────────────
  _buildReceiptPdf(doc, payment) {
    const colors = { primary: '#10B981', dark: '#0F172A', muted: '#64748B' };
    const patient = payment.patientId;
    const invoice = payment.invoiceId;

    // Header
    doc.rect(0, 0, 595, 110).fill(colors.dark);
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#FFFFFF').text('MediFlow', 50, 30);
    doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Enterprise Hospital Management System', 50, 60);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.primary).text('PAYMENT RECEIPT', 380, 38, { align: 'right', width: 160 });

    // Checkmark success banner
    doc.rect(0, 110, 595, 60).fill('#F0FDF4');
    doc.circle(50 + 15, 140, 15).fill(colors.primary);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('✓', 43, 133);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.primary).text('Payment Successful', 80, 131);
    doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text(
      `Paid on ${new Date(payment.paidAt || payment.updatedAt).toLocaleString('en-IN')}`, 80, 149
    );

    // Meta info
    const grid = [
      ['Receipt Number', payment.receiptNumber],
      ['Invoice Number', invoice?.invoiceNumber || 'N/A'],
      ['Patient Name', `${patient.firstName} ${patient.lastName}`],
      ['Patient Email', patient.email],
      ['Razorpay Order ID', payment.razorpayOrderId],
      ['Razorpay Payment ID', payment.razorpayPaymentId],
      ['Payment Method', (payment.paymentMethod || 'Online').toUpperCase()],
      ['Amount Paid', `₹${payment.amount.toFixed(2)} ${payment.currency}`],
      ['Status', payment.status]
    ];

    let y = 200;
    grid.forEach(([label, value]) => {
      doc.fontSize(9).font('Helvetica').fillColor(colors.muted).text(label + ':', 60, y);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.dark).text(String(value || ''), 240, y);
      y += 22;
    });

    doc.rect(50, y + 10, 495, 1).fill('#E2E8F0');

    doc.fontSize(8).font('Helvetica').fillColor(colors.muted)
      .text('This is a computer-generated receipt. No signature required.', 50, y + 20, { align: 'center', width: 495 })
      .text('MediFlow Healthcare | billing@mediflow.com', 50, y + 34, { align: 'center', width: 495 });
  }
}

module.exports = new PaymentService();
