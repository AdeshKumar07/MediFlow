import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { appointmentService } from '../../services/appointmentService';
import { getBranches } from '../../services/hospitalService';
import { getStaffList } from '../../services/staffService';
import { Calendar as CalendarIcon, Clock, AlignLeft, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [branchRes, doctorRes] = await Promise.all([
          getBranches(1, 100, '', 'true'),
          getStaffList(1, 100, '', 'DOCTOR', 'true')
        ]);
        
        setBranches(branchRes.data?.branches || []);
        setDoctors(doctorRes.data?.staff || []);
      } catch (error) {
        toast.error('Failed to load branches or doctors list');
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const onSubmit = async (data) => {
    try {
      await appointmentService.bookAppointment(data);
      toast.success('Appointment booked successfully!');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Book an Appointment</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to schedule your visit.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                Select Branch
              </label>
              <select
                {...register('branchId', { required: 'Branch is required' })}
                disabled={isLoadingOptions}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-11 px-4 border bg-white"
              >
                <option value="">{isLoadingOptions ? 'Loading branches...' : 'Choose a branch...'}</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Doctor (Optional)
              </label>
              <select
                {...register('doctorId', { required: 'Doctor is required' })}
                disabled={isLoadingOptions}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-11 px-4 border bg-white"
              >
                <option value="">{isLoadingOptions ? 'Loading doctors...' : 'Any available doctor...'}</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.firstName} {d.lastName} {d.profile?.specialization ? `(${d.profile.specialization})` : ''}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="text-red-500 text-xs mt-1">{errors.doctorId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                Date
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-11 px-4 border"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                Time Slot
              </label>
              <select
                {...register('timeSlot', { required: 'Time slot is required' })}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-11 px-4 border bg-white"
              >
                <option value="">Select a time...</option>
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
              </select>
              {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <AlignLeft className="w-4 h-4 mr-2 text-gray-400" />
              Reason for Visit
            </label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={4}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border"
              placeholder="Please briefly describe your symptoms or reason for the visit..."
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/appointments')}
              className="px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingOptions}
              className="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
