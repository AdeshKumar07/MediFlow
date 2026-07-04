const laboratoryService = require('../services/laboratory.service');

class LaboratoryController {
  async getLabTests(req, res, next) {
    try {
      const { page, limit, search, status, category, patientId } = req.query;
      const query = {};
      
      if (search) {
        query.testName = { $regex: search, $options: 'i' };
      }
      if (status) query.status = status;
      if (category) query.category = category;
      if (patientId) query.patientId = patientId;

      // Restrict Patients to only their own tests
      if (req.user.role === 'PATIENT') {
        query.patientId = req.user.id;
      }
      
      // Restrict Doctors to tests they ordered (or all tests for a specific patient)
      // Actually, doctors can see all lab tests if needed, but let's allow it

      const data = await laboratoryService.getLabTests(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getLabTestById(req, res, next) {
    try {
      const data = await laboratoryService.getLabTestById(req.params.id);
      
      // Access control
      if (req.user.role === 'PATIENT' && data.patientId._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this test' });
      }

      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createLabTest(req, res, next) {
    try {
      const payload = { ...req.body };
      if (req.user.role === 'DOCTOR') {
        payload.doctorId = req.user.id; // Doctors book tests
      }
      const data = await laboratoryService.createLabTest(payload);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateLabTest(req, res, next) {
    try {
      const data = await laboratoryService.updateLabTest(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async deleteLabTest(req, res, next) {
    try {
      await laboratoryService.deleteLabTest(req.params.id);
      res.status(200).json({ success: true, message: 'Lab test deleted successfully' });
    } catch (error) { next(error); }
  }

  async uploadReport(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // Compute static relative path for database representation
      const fileUrl = `/uploads/reports/${req.file.filename}`;

      // Update document, marking status completed
      const data = await laboratoryService.updateLabTest(req.params.id, {
        reportPdf: fileUrl,
        status: 'COMPLETED'
      });

      res.status(200).json({ success: true, message: 'Report PDF uploaded successfully', data });
    } catch (error) { next(error); }
  }

  async generatePdfReport(req, res, next) {
    try {
      const test = await laboratoryService.getLabTestById(req.params.id);

      // Access control
      if (req.user.role === 'PATIENT' && test.patientId._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this test' });
      }

      const stream = await laboratoryService.generatePdfReportStream(test);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="report-${test._id}.pdf"`);
      
      stream.pipe(res);
    } catch (error) { next(error); }
  }
}

module.exports = new LaboratoryController();
