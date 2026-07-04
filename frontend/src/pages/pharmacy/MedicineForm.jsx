import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { pharmacyService } from '../../services/pharmacyService';
import toast from 'react-hot-toast';

const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchMedicine();
    }
  }, [id]);

  const fetchMedicine = async () => {
    try {
      const res = await pharmacyService.getMedicineById(id);
      // format date for input field
      const formattedData = {
        ...res.data,
        expiryDate: res.data.expiryDate ? new Date(res.data.expiryDate).toISOString().split('T')[0] : ''
      };
      reset(formattedData);
    } catch (error) {
      toast.error('Failed to fetch medicine details');
      navigate('/dashboard/pharmacy');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await pharmacyService.updateMedicine(id, data);
        toast.success('Medicine updated successfully');
      } else {
        await pharmacyService.createMedicine(data);
        toast.success('Medicine added successfully');
      }
      navigate('/dashboard/pharmacy');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEdit ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name <span className="text-red-500">*</span></label>
              <input 
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
                placeholder="E.g., Paracetamol"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input 
                {...register('brand')}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
                placeholder="E.g., Tylenol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select 
                {...register('category', { required: 'Category is required' })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
              >
                <option value="">Select Category</option>
                <option value="Painkillers">Painkillers</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Antihistamines">Antihistamines</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Details</label>
              <input 
                {...register('dosage')}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
                placeholder="E.g., 500mg Tablets"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
              <input 
                type="number"
                {...register('stock', { required: 'Stock is required', min: 0 })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit ($) <span className="text-red-500">*</span></label>
              <input 
                type="number"
                step="0.01"
                {...register('price', { required: 'Price is required', min: 0 })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
              <input 
                type="date"
                {...register('expiryDate', { required: 'Expiry Date is required' })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input 
                {...register('batchNumber')}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 border" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/pharmacy')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Medicine' : 'Save Medicine')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineForm;
