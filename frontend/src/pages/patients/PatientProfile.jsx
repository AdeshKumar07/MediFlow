import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientDetails, registerPatient, updatePatientProfile } from '../../services/patientService';
import toast from 'react-hot-toast';
import { User, Save, ArrowLeft, HeartPulse } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [isLoading, setIsLoading] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const res = await getPatientDetails(id);
      if (res.data) {
        const { user, profile } = res.data;
        const formattedDate = profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
        reset({ 
          ...user, 
          ...profile, 
          dateOfBirth: formattedDate, 
          allergies: profile?.allergies?.join(', '), 
          medicalHistory: profile?.medicalHistory?.join(', '),
          emergencyContactName: profile?.emergencyContact?.name,
          emergencyContactRelation: profile?.emergencyContact?.relation,
          emergencyContactPhone: profile?.emergencyContact?.phone,
          insuranceProvider: profile?.insurance?.provider,
          insurancePolicyNumber: profile?.insurance?.policyNumber,
          insuranceGroupNumber: profile?.insurance?.groupNumber
        });
      }
    } catch (error) {
      toast.error('Failed to fetch patient details');
      navigate('/patients');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const { firstName, lastName, email, password, allergies, medicalHistory, emergencyContactName, emergencyContactRelation, emergencyContactPhone, insuranceProvider, insurancePolicyNumber, insuranceGroupNumber, ...rest } = data;
      
      const userData = { firstName, lastName, email, password };
      const profileData = {
        ...rest,
        allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
        medicalHistory: medicalHistory ? medicalHistory.split(',').map(s => s.trim()) : [],
        emergencyContact: {
          name: emergencyContactName,
          relation: emergencyContactRelation,
          phone: emergencyContactPhone
        },
        insurance: {
          provider: insuranceProvider,
          policyNumber: insurancePolicyNumber,
          groupNumber: insuranceGroupNumber
        }
      };

      if (isEdit) {
        await updatePatientProfile(id, profileData);
        toast.success('Patient profile updated successfully');
      } else {
        await registerPatient(userData, profileData);
        toast.success('Patient registered successfully');
      }
      navigate('/dashboard/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save patient');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <button onClick={() => navigate('/dashboard/patients')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Patient Profile' : 'Register New Patient'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {!isEdit && (
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <HeartPulse className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Medical Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                {...register('gender')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow bg-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow bg-white"
              >
                <option value="">Select group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Allergies (comma separated)</label>
              <input
                {...register('allergies')}
                placeholder="e.g., Peanuts, Penicillin"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Medical History (comma separated)</label>
              <textarea
                {...register('medicalHistory')}
                rows={3}
                placeholder="e.g., Diabetes, Hypertension"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact & Insurance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                {...register('emergencyContactName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relation</label>
              <input
                {...register('emergencyContactRelation')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                {...register('emergencyContactPhone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
              <input
                {...register('insuranceProvider')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Policy Number</label>
              <input
                {...register('insurancePolicyNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Group Number</label>
              <input
                {...register('insuranceGroupNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/patients')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Patient Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
