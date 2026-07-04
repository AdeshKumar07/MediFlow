const medicalRecordService = require('../services/medicalRecord.service');

exports.createMedicalRecord = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.user.role === 'DOCTOR') {
      data.doctorId = req.user.id;
    }
    const record = await medicalRecordService.createMedicalRecord(data);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId
    };

    if (req.user.role === 'PATIENT') {
      filters.patientId = req.user.id;
    }
    if (req.user.role === 'DOCTOR') {
      filters.doctorId = req.user.id;
    }

    const pagination = {
      page: req.query.page,
      limit: req.query.limit
    };
    
    const result = await medicalRecordService.getMedicalRecords(filters, pagination);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await medicalRecordService.getMedicalRecordById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(req.params.id, req.body);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
