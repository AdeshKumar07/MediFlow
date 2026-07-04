import React, { useState, useEffect, useCallback } from 'react';
import { getStaffList, toggleStaffStatus } from '../../services/staffService';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import FilterDropdown from '../../components/ui/FilterDropdown';
import { Users, Plus, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  
  const navigate = useNavigate();

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStaffList(page, 10, search, roleFilter);
      setStaff(res.data.staff);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch staff list');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleStatus = async (staffMember) => {
    const newStatus = !staffMember.isActive;
    const action = newStatus ? 'Approve' : 'Disapprove';
    setTogglingId(staffMember._id);
    try {
      await toggleStaffStatus(staffMember._id, newStatus);
      toast.success(
        `${staffMember.firstName} ${staffMember.lastName} has been ${newStatus ? 'approved ✅' : 'disapproved ❌'}.`
      );
      // Update local state immediately without re-fetch
      setStaff((prev) =>
        prev.map((s) => (s._id === staffMember._id ? { ...s, isActive: newStatus } : s))
      );
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} staff member`);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { 
      header: 'Name', 
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
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
      header: 'Role', 
      render: (row) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {row.role.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Verification',
      render: (row) => {
        const isToggling = togglingId === row._id;
        return (
          <div className="flex items-center gap-2">
            {/* Approve button – only shown when inactive */}
            {!row.isActive && (
              <button
                disabled={isToggling}
                onClick={() => handleToggleStatus(row)}
                title="Approve & Activate this staff account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                  bg-green-50 text-green-700 border border-green-200
                  hover:bg-green-600 hover:text-white hover:border-green-600
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {isToggling ? (
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Approve
              </button>
            )}

            {/* Disapprove button – only shown when active */}
            {row.isActive && (
              <button
                disabled={isToggling}
                onClick={() => handleToggleStatus(row)}
                title="Disapprove & Deactivate this staff account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                  bg-red-50 text-red-700 border border-red-200
                  hover:bg-red-600 hover:text-white hover:border-red-600
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {isToggling ? (
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Disapprove
              </button>
            )}

            {/* Edit button */}
            <button
              onClick={() => navigate(`/staff/${row._id}`)}
              title="Edit staff profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                bg-slate-50 text-slate-600 border border-slate-200
                hover:bg-slate-600 hover:text-white hover:border-slate-600
                transition-all duration-200 shadow-sm"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        );
      }
    }
  ];

  const roleOptions = [
    { label: 'Doctor', value: 'DOCTOR' },
    { label: 'Nurse', value: 'NURSE' },
    { label: 'Receptionist', value: 'RECEPTIONIST' },
    { label: 'Pharmacist', value: 'PHARMACIST' },
    { label: 'Lab Technician', value: 'LAB_TECH' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Staff Directory</h1>
            <p className="text-xs text-gray-500 mt-0.5">Approve or disapprove staff accounts for system access</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/staff/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Summary bar showing pending verifications */}
      {staff.filter(s => !s.isActive).length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span>
            <span className="font-semibold">{staff.filter(s => !s.isActive).length} staff account{staff.filter(s => !s.isActive).length > 1 ? 's' : ''}</span> pending verification. Use the <span className="font-semibold text-green-700">Approve</span> button to grant access.
          </span>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchInput 
            placeholder="Search by name or email..." 
            onSearch={(val) => { setSearch(val); setPage(1); }} 
          />
          <FilterDropdown
            options={roleOptions}
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1); }}
            placeholder="All Roles"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Total Staff: {total}
        </div>
      </div>

      <Table 
        columns={columns} 
        data={staff} 
        isLoading={isLoading} 
        emptyMessage="No staff members found." 
      />

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
};

export default StaffList;
