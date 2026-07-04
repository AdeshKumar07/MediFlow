import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffDetails, createStaff, updateStaffProfile } from '../../services/staffService';
import toast from 'react-hot-toast';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [isLoading, setIsLoading] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchStaffData();
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      const res = await getStaffDetails(id);
      if (res.data) {
        reset({ ...res.data.user, ...res.data.profile });
      }
    } catch (error) {
      toast.error('Failed to fetch staff details');
      navigate('/staff');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const { firstName, lastName, email, password, role, ...profileData } = data;
      const userData = { firstName, lastName, email, password, role };

      if (isEdit) {
        await updateStaffProfile(id, profileData);
        toast.success('Staff profile updated successfully');
      } else {
        await createStaff(userData, profileData);
        toast.success('Staff member created successfully');
      }
      navigate('/staff');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff member');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <button onClick={() => navigate('/staff')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <UserPlus className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Staff Profile' : 'Add New Staff'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {!isEdit && (
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow bg-white"
                >
                  <option value="">Select a role</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="LAB_TECH">Lab Technician</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                {...register('specialization')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input
                {...register('qualification')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                {...register('experienceYears')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            {/* Show Consultation Fee only if the selected role is DOCTOR or if editing an existing DOCTOR */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
              <input
                type="number"
                {...register('consultationFee')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                {...register('bio')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Status & Verification</h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                Verified & Active (Approved to sign in and perform medical/administrative actions)
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Self-registered Doctors, Technicians, Receptionists, and Pharmacists are unverified by default. Toggle this switch to approve their access.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/staff')}
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
            {isSubmitting ? 'Saving...' : 'Save Staff Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
