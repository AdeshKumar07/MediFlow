const appointmentRepository = require('../repositories/appointment.repository');
const ApiError = require('../utils/apiError');

class AppointmentService {
  async bookAppointment(data) {
    // Generate a queue number based on existing appointments for the same doctor, branch, and date
    const dateStart = new Date(data.date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(data.date);
    dateEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await appointmentRepository.countAppointments({
      doctorId: data.doctorId,
      branchId: data.branchId,
      date: { $gte: dateStart, $lte: dateEnd }
    });

    data.queueNumber = existingAppointments + 1;
    
    return await appointmentRepository.createAppointment(data);
  }

  async getAppointments(filters, pagination) {
    const { patientId, doctorId, branchId, date, status } = filters;
    const { page = 1, limit = 10 } = pagination;
    
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (branchId) query.branchId = branchId;
    if (status) query.status = status;
    
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dateStart, $lte: dateEnd };
    }

    const skip = (page - 1) * limit;
    
    const appointments = await appointmentRepository.getAppointments(query, skip, limit);
    const total = await appointmentRepository.countAppointments(query);

    return {
      appointments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  }

  async getAppointmentById(id) {
    const appointment = await appointmentRepository.getAppointmentById(id);
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found');
    }
    return appointment;
  }

  async updateAppointmentStatus(id, status, notes) {
    const data = { status };
    if (notes) data.notes = notes;
    
    const appointment = await appointmentRepository.updateAppointment(id, data);
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found');
    }
    return appointment;
  }

  async rescheduleAppointment(id, newDate, newTimeSlot) {
    const appointment = await appointmentRepository.updateAppointment(id, {
      date: newDate,
      timeSlot: newTimeSlot,
      status: 'RESCHEDULED'
    });
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found');
    }
    return appointment;
  }
}

module.exports = new AppointmentService();
