import React, { useState, useEffect, useCallback } from 'react';
import { getBranches, createBranch, updateBranch, getHospitalProfile } from '../../services/hospitalService';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MapPin, Plus, Edit2 } from 'lucide-react';

const BranchesList = () => {
  const [branches, setBranches] = useState([]);
  const [hospitalId, setHospitalId] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const initData = useCallback(async () => {
    try {
      const profileRes = await getHospitalProfile();
      if (profileRes.data) {
        setHospitalId(profileRes.data._id);
      }
    } catch (e) {
      console.error("No hospital profile found", e);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBranches(page, 10, search);
      setBranches(res.data.branches);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenModal = (branch = null) => {
    if (!hospitalId) {
      toast.error('Please create a Hospital Profile first');
      return;
    }
    setEditingBranch(branch);
    if (branch) {
      reset(branch);
    } else {
      reset({ name: '', address: '', city: '', state: '', zip: '', phone: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      data.hospitalId = hospitalId;
      if (editingBranch) {
        await updateBranch(editingBranch._id, data);
        toast.success('Branch updated successfully');
      } else {
        await createBranch(data);
        toast.success('Branch created successfully');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save branch');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'City', accessor: 'city' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => handleOpenModal(row)} className="text-primary hover:text-primary/80 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Hospital Branches</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchInput 
          placeholder="Search branches by name..." 
          onSearch={(val) => { setSearch(val); setPage(1); }} 
        />
        <div className="text-sm text-gray-500 font-medium">
          Total Branches: {total}
        </div>
      </div>

      <Table 
        columns={columns} 
        data={branches} 
        isLoading={isLoading} 
        emptyMessage="No branches found." 
      />

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('city', { required: 'City is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                {...register('state')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              {...register('address', { required: 'Address is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                {...register('zip')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            />
            <label className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Active Branch
            </label>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BranchesList;
