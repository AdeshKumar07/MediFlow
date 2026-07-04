import React, { useState, useEffect, useCallback } from 'react';
import { getPatientList } from '../../services/patientService';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import { Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPatientList(page, 10, search);
      setPatients(res.data.patients);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch patients list');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const columns = [
    { 
      header: 'Name', 
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {row.firstName?.[0] || '?'}{row.lastName?.[0] || '?'}
            </div>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-gray-500 text-sm">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/dashboard/patients/${row._id}`)} 
            className="text-indigo-650 hover:text-indigo-850 font-semibold text-sm transition-colors"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => navigate(`/dashboard/emr/timeline/${row._id}`)} 
            className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-colors"
          >
            Clinical History
          </button>
          <button 
            onClick={() => navigate(`/dashboard/laboratory?patientId=${row._id}&patientName=${encodeURIComponent(row.firstName + ' ' + row.lastName)}`)} 
            className="text-amber-600 hover:text-amber-800 font-semibold text-sm transition-colors"
          >
            Lab Reports
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Patients Directory</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard/patients/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Patient
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchInput 
          placeholder="Search patients by name or email..." 
          onSearch={(val) => { setSearch(val); setPage(1); }} 
        />
        <div className="text-sm text-gray-500 font-medium">
          Total Patients: {total}
        </div>
      </div>

      <Table 
        columns={columns} 
        data={patients} 
        isLoading={isLoading} 
        emptyMessage="No patients found." 
      />

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
};

export default PatientsList;
