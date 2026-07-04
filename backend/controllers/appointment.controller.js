const appointmentService = require('../services/appointment.service');

exports.bookAppointment = async (req, res, next) => {
  try {
    const data = { ...req.body, patientId: req.user.id };
    // If the user is a receptionist booking for a patient, patientId would be in body.
    if (req.body.patientId && req.user.role !== 'PATIENT') {
      data.patientId = req.body.patientId;
    }
    const appointment = await appointmentService.bookAppointment(data);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      branchId: req.query.branchId,
      date: req.query.date,
      status: req.query.status
    };

    // If user is patient, restrict to their own appointments
    if (req.user.role === 'PATIENT') {
      filters.patientId = req.user.id;
    }
    // If user is doctor, restrict to their own appointments
    if (req.user.role === 'DOCTOR') {
      filters.doctorId = req.user.id;
    }

    const pagination = {
      page: req.query.page,
      limit: req.query.limit
    };
    
    const result = await appointmentService.getAppointments(filters, pagination);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(req.params.id, status, notes);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await appointmentService.rescheduleAppointment(req.params.id, date, timeSlot);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
