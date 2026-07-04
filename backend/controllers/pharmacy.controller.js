const pharmacyService = require('../services/pharmacy.service');

class PharmacyController {
  async getMedicines(req, res, next) {
    try {
      const { page, limit, search, isExpiring, isLowStock, category } = req.query;
      const query = {};
      
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      if (category) {
        query.category = category;
      }
      if (isExpiring === 'true') query.isExpiring = true;
      if (isLowStock === 'true') query.isLowStock = true;

      const data = await pharmacyService.getMedicines(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getMedicineById(req, res, next) {
    try {
      const data = await pharmacyService.getMedicineById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createMedicine(req, res, next) {
    try {
      const data = await pharmacyService.createMedicine(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateMedicine(req, res, next) {
    try {
      const data = await pharmacyService.updateMedicine(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async deleteMedicine(req, res, next) {
    try {
      await pharmacyService.deleteMedicine(req.params.id);
      res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) { next(error); }
  }

  async getPrescriptions(req, res, next) {
    try {
      const { page, limit, patientId } = req.query;
      const query = {};
      if (patientId) query.patientId = patientId;

      // Patients can only see their own prescriptions
      if (req.user.role === 'PATIENT') {
        query.patientId = req.user.id;
      }

      const data = await pharmacyService.getPrescriptions(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async dispenseMedicine(req, res, next) {
    try {
      const { recordId, medicineId } = req.params;
      const data = await pharmacyService.dispenseMedicine(recordId, medicineId);
      res.status(200).json({ success: true, ...data });
    } catch (error) { next(error); }
  }
}

module.exports = new PharmacyController();
