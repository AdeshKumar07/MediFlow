import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { appointmentService } from '../../services/appointmentService';
import { emrService } from '../../services/emrService';
import { User, Activity, Pill, Plus, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ConsultationScreen = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      symptoms: [''],
      treatmentHistory: [''],
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }
  });

  const { fields: symptomFields, append: appendSymptom, remove: removeSymptom } = useFieldArray({ control, name: "symptoms" });
  const { fields: treatmentFields, append: appendTreatment, remove: removeTreatment } = useFieldArray({ control, name: "treatmentHistory" });
  const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({ control, name: "medicines" });

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(res.data);
    } catch (error) {
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!appointment) return;
    try {
      // Clean up empty strings
      const payload = {
        ...data,
        patientId: appointment.patientId._id,
        appointmentId: appointment._id,
        symptoms: data.symptoms.filter(s => s.trim() !== ''),
        treatmentHistory: data.treatmentHistory.filter(t => t.trim() !== '')
      };

      await emrService.createMedicalRecord(payload);
      
      // Update appointment status to completed
      await appointmentService.updateAppointmentStatus(appointment._id, 'COMPLETED');
      
      toast.success('Consultation completed and EMR saved!');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save EMR');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading consultation...</div>;
  if (!appointment) return <div className="p-8 text-center text-red-500">Appointment not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl shadow-lg p-6 text-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Consultation</h1>
          <div className="flex items-center mt-2 space-x-4 opacity-90">
            <span className="flex items-center text-sm"><User className="w-4 h-4 mr-1"/> {appointment.patientId?.firstName} {appointment.patientId?.lastName}</span>
            <span className="text-sm border-l border-indigo-400 pl-4">Reason: {appointment.reason}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Vitals & Basics */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Activity className="w-5 h-5 mr-2 text-rose-500" />
                Vitals
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
                  <input type="text" placeholder="120/80" {...register('vitals.bloodPressure')} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pulse Rate (bpm)</label>
                  <input type="text" placeholder="72" {...register('vitals.pulseRate')} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C/°F)</label>
                  <input type="text" placeholder="98.6" {...register('vitals.temperature')} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input type="text" placeholder="70" {...register('vitals.weight')} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input type="text" placeholder="175" {...register('vitals.height')} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Diagnosis & Prescriptions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis & Symptoms</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Diagnosis <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  {...register('diagnosis', { required: true })} 
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-11 px-4 border" 
                  placeholder="E.g., Viral Pharyngitis" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <div className="space-y-2">
                  {symptomFields.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <input 
                        {...register(`symptoms.${index}`)} 
                        className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-4 border" 
                        placeholder="E.g., Sore throat" 
                      />
                      <button type="button" onClick={() => removeSymptom(index)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendSymptom('')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Symptom
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment History</label>
                <div className="space-y-2">
                  {treatmentFields.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <input 
                        {...register(`treatmentHistory.${index}`)} 
                        className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-4 border" 
                        placeholder="E.g., Administered local anesthesia" 
                      />
                      <button type="button" onClick={() => removeTreatment(index)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendTreatment('')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Treatment
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Pill className="w-5 h-5 mr-2 text-emerald-500" />
                Prescriptions
              </h2>
              
              <div className="space-y-4 border-l-2 border-gray-100 pl-4">
                {medicineFields.map((item, index) => (
                  <div key={item.id} className="relative bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <button type="button" onClick={() => removeMedicine(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-6">
                      <div className="md:col-span-2">
                        <input {...register(`medicines.${index}.name`, { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-9 px-3 border" placeholder="Medicine Name (e.g. Amoxicillin 500mg)" />
                      </div>
                      <div>
                        <input {...register(`medicines.${index}.dosage`, { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-9 px-3 border" placeholder="Dosage (e.g. 1 Tablet)" />
                      </div>
                      <div>
                        <input {...register(`medicines.${index}.frequency`, { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-9 px-3 border" placeholder="Frequency (e.g. Twice a day)" />
                      </div>
                      <div>
                        <input {...register(`medicines.${index}.duration`, { required: true })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-9 px-3 border" placeholder="Duration (e.g. 5 Days)" />
                      </div>
                      <div>
                        <input {...register(`medicines.${index}.instructions`)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm h-9 px-3 border" placeholder="Instructions (e.g. After meals)" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendMedicine({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })} className="text-sm text-emerald-600 font-medium hover:text-emerald-800 flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Add Medicine
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Notes</h2>
              <textarea 
                {...register('consultationNotes')} 
                rows={4} 
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border"
                placeholder="Additional notes, advice, or follow-up instructions..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-3 border border-transparent shadow-md text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Complete Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationScreen;
