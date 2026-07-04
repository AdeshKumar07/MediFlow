import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { laboratoryService } from '../../services/laboratoryService';
import { FlaskConical, Plus, Search, FileDown, Edit, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TestList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const patientIdQuery = searchParams.get('patientId');
  const patientNameQuery = searchParams.get('patientName');

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const canBookTest = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'].includes(user?.role);
  const canUploadResult = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'LAB_TECH', 'DOCTOR'].includes(user?.role);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await laboratoryService.getLabTests({ 
        search,
        status: statusFilter,
        patientId: patientIdQuery || undefined
      });
      setTests(res.data?.tests || []);
    } catch (error) {
      toast.error('Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, patientIdQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTests();
    }, 550);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTests]);

  const handleDownloadPDF = async (testId, testName) => {
    try {
      const toastId = toast.loading('Compiling lab results PDF...');
      const response = await api.get(`/laboratory/${testId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LabReport-${testName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate report PDF');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-450 border border-blue-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {patientIdQuery && (
            <Link to="/dashboard/patients" className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-2">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to Directory
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FlaskConical className="w-6 h-6 mr-2 text-indigo-600" />
            {patientIdQuery ? `Lab Reports: ${patientNameQuery || 'Patient'}` : 'Laboratory Tests'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {patientIdQuery ? 'Viewing comprehensive history of lab test reports for this clinical file.' : 'Manage test bookings and diagnostic reports.'}
          </p>
        </div>
        {canBookTest && !patientIdQuery && (
          <Link
            to="/dashboard/laboratory/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> Book Test
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by test name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full md:w-48 rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading lab records...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-550 uppercase tracking-wider">Test Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-550 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-550 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-550 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-550 uppercase tracking-wider">Booked At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-550 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tests.map((test) => (
                <tr key={test._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{test.testName}</div>
                    <div className="text-xs text-gray-400 font-mono">{test.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {test.patientId ? `${test.patientId.firstName} ${test.patientId.lastName}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.doctorId ? `Dr. ${test.doctorId.firstName} ${test.doctorId.lastName}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(test.bookedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3.5 items-center">
                      <button
                        onClick={() => handleDownloadPDF(test._id, test.testName)}
                        className="text-indigo-650 hover:text-indigo-850 flex items-center gap-1.5 transition-colors font-semibold"
                        title="Generate diagnostic PDF certificate"
                      >
                        <FileDown className="w-4 h-4" /> PDF Report
                      </button>

                      {test.reportPdf && (
                        <a 
                          href={test.reportPdf} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors font-semibold"
                          title="View uploaded clinical details"
                        >
                          <Eye className="w-4 h-4" /> View File
                        </a>
                      )}
                      
                      {canUploadResult && (
                        <Link to={`/dashboard/laboratory/edit/${test._id}`} className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                    No lab test examinations found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestList;
