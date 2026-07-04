const patientService = require('../services/patient.service');
const ApiError = require('../utils/apiError');

class PatientController {
  async getPatientList(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const data = await patientService.getPatientList(query, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getPatientDetails(req, res, next) {
    try {
      const data = await patientService.getPatientDetails(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async registerPatient(req, res, next) {
    try {
      const { userData, profileData } = req.body;
      const data = await patientService.registerPatient(userData, profileData);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updatePatientProfile(req, res, next) {
    try {
      const data = await patientService.updatePatientProfile(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async deletePatient(req, res, next) {
    try {
      await patientService.deletePatient(req.params.id);
      res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) { next(error); }
  }
}

module.exports = new PatientController();
