import React, { useState, useEffect, useCallback } from 'react';
import { getDepartments, createDepartment, updateDepartment, getHospitalProfile } from '../../services/hospitalService';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Stethoscope, Plus, Edit2 } from 'lucide-react';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [hospitalId, setHospitalId] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

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

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getDepartments(page, 10, search);
      setDepartments(res.data.departments);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenModal = (dept = null) => {
    if (!hospitalId) {
      toast.error('Please create a Hospital Profile first');
      return;
    }
    setEditingDept(dept);
    if (dept) {
      reset(dept);
    } else {
      reset({ name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      data.hospitalId = hospitalId;
      if (editingDept) {
        await updateDepartment(editingDept._id, data);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(data);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
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
          <Stethoscope className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchInput 
          placeholder="Search departments by name..." 
          onSearch={(val) => { setSearch(val); setPage(1); }} 
        />
        <div className="text-sm text-gray-500 font-medium">
          Total Departments: {total}
        </div>
      </div>

      <Table 
        columns={columns} 
        data={departments} 
        isLoading={isLoading} 
        emptyMessage="No departments found." 
      />

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border outline-none transition-shadow"
            />
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            />
            <label className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Active Department
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

export default DepartmentsList;
