const laboratoryRepository = require('../repositories/laboratory.repository');
const ApiError = require('../utils/apiError');
const PDFDocument = require('pdfkit');

class LaboratoryService {
  async getLabTests(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    
    const tests = await laboratoryRepository.getLabTests(query, skip, parseInt(limit));
    const total = await laboratoryRepository.countLabTests(query);

    return { 
      tests, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / limit) 
    };
  }

  async getLabTestById(id) {
    const test = await laboratoryRepository.getLabTestById(id);
    if (!test) throw new ApiError(404, 'Lab test not found');
    return test;
  }

  async createLabTest(data) {
    return await laboratoryRepository.createLabTest(data);
  }

  async updateLabTest(id, data) {
    if (data.status === 'COMPLETED' && !data.completedAt) {
      data.completedAt = Date.now();
    }
    const test = await laboratoryRepository.updateLabTest(id, data);
    if (!test) throw new ApiError(404, 'Lab test not found');
    return test;
  }

  async deleteLabTest(id) {
    const test = await laboratoryRepository.deleteLabTest(id);
    if (!test) throw new ApiError(404, 'Lab test not found');
    return test;
  }

  async generatePdfReportStream(test) {
    const doc = new PDFDocument({ margin: 50 });

    // Draw header / branding
    doc.fillColor('#4f46e5')
       .font('Helvetica-Bold')
       .fontSize(24)
       .text('MediFlow Labs', { align: 'left' });

    doc.fillColor('#6b7280')
       .font('Helvetica')
       .fontSize(10)
       .text('Enterprise Clinical Diagnostics Portal', { align: 'left' })
       .moveDown(1.5);

    // Draw line separating header
    doc.moveTo(50, 95)
       .lineTo(550, 95)
       .stroke('#e5e7eb')
       .moveDown(1.5);

    // Patient Details
    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Laboratory Examination Report')
       .moveDown(1);

    const patientName = test.patientId ? `${test.patientId.firstName} ${test.patientId.lastName}` : 'N/A';
    const patientEmail = test.patientId ? test.patientId.email : 'N/A';
    const doctorName = test.doctorId ? `Dr. ${test.doctorId.firstName} ${test.doctorId.lastName}` : 'N/A';

    doc.fontSize(10).font('Helvetica-Bold').text('Patient Details:', { underline: true }).moveDown(0.2);
    doc.font('Helvetica').text(`Name: ${patientName}`);
    doc.text(`Email: ${patientEmail}`);
    doc.text(`Ordering Doctor: ${doctorName}`)
       .moveDown(1.5);

    // Test details
    doc.font('Helvetica-Bold').text('Test Information:', { underline: true }).moveDown(0.2);
    doc.font('Helvetica').text(`Test Name: ${test.testName}`);
    doc.text(`Category: ${test.category}`);
    doc.text(`Status: ${test.status}`);
    doc.text(`Booked On: ${new Date(test.bookedAt).toLocaleDateString()}`);
    if (test.completedAt) {
      doc.text(`Completed On: ${new Date(test.completedAt).toLocaleDateString()}`);
    }
    doc.moveDown(1.5);

    // Results / Observation section
    doc.font('Helvetica-Bold').text('Results & Summary Observations:', { underline: true }).moveDown(0.2);
    doc.font('Helvetica').text(test.resultSummary || 'No observations recorded.', {
      align: 'justify',
      lineGap: 4
    }).moveDown(2);

    // Footer / Signatures
    doc.moveTo(50, 700)
       .lineTo(550, 700)
       .stroke('#e5e7eb');

    doc.fillColor('#9ca3af')
       .fontSize(8)
       .text('This is an electronically generated report from MediFlow. No physical signature is required.', 50, 715, { align: 'center' });

    doc.end();
    return doc;
  }
}

module.exports = new LaboratoryService();
