const availabilityService = require('../services/availability.service');

exports.setAvailability = async (req, res, next) => {
  try {
    let doctorId = req.user.id;
    if (req.body.doctorId && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'HOSPITAL_ADMIN')) {
      doctorId = req.body.doctorId;
    }
    
    const { branchId, schedules } = req.body; // schedules is an array
    const results = await availabilityService.setAvailability(doctorId, branchId, schedules);
    
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

exports.getAvailabilities = async (req, res, next) => {
  try {
    const filters = {
      doctorId: req.query.doctorId,
      branchId: req.query.branchId,
      dayOfWeek: req.query.dayOfWeek
    };
    
    const availabilities = await availabilityService.getAvailabilities(filters);
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    next(error);
  }
};
