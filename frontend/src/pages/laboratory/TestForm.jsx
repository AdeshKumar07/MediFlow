import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { laboratoryService } from '../../services/laboratoryService';
import { getPatientList } from '../../services/patientService';
import toast from 'react-hot-toast';
import { FlaskConical, Upload, CheckCircle } from 'lucide-react';

const TestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [patients, setPatients] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingReport, setExistingReport] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!isEdit) {
      fetchPatients();
    } else {
      fetchTest();
    }
  }, [id, isEdit]);

  const fetchPatients = async () => {
    try {
      const res = await getPatientList(1, 100);
      setPatients(res.data?.patients || []);
    } catch (error) {
      toast.error('Failed to load patients for selection');
    }
  };

  const fetchTest = async () => {
    try {
      const res = await laboratoryService.getLabTestById(id);
      const test = res.data;
      setExistingReport(test.reportPdf || '');
      reset({
        testName: test.testName,
        category: test.category,
        status: test.status,
        resultSummary: test.resultSummary
      });
    } catch (error) {
      toast.error('Failed to fetch test details');
      navigate('/dashboard/laboratory');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // Update text metadata
        await laboratoryService.updateLabTest(id, {
          status: data.status,
          resultSummary: data.resultSummary
        });

        // Upload file if selected
        if (selectedFile) {
          await laboratoryService.uploadReport(id, selectedFile);
        }

        toast.success('Lab Test details updated successfully');
      } else {
        await laboratoryService.createLabTest(data);
        toast.success('Lab Test booked successfully');
      }
      navigate('/dashboard/laboratory');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-650" />
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Update Lab Test & Upload Results' : 'Book New Lab Test'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {!isEdit && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Patient <span className="text-red-500">*</span></label>
                <select 
                  {...register('patientId', { required: 'Patient is required' })}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3" 
                >
                  <option value="">Select a Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.email})</option>
                  ))}
                </select>
                {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Test Name <span className="text-red-500">*</span></label>
              <input 
                {...register('testName', { required: 'Test name is required' })}
                disabled={isEdit}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 disabled:bg-slate-55" 
                placeholder="E.g., Complete Blood Count"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select 
                {...register('category', { required: 'Category is required' })}
                disabled={isEdit}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3 disabled:bg-slate-55" 
              >
                <option value="">Select Category</option>
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Imaging">Imaging (X-Ray, MRI)</option>
                <option value="Pathology">Pathology</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {isEdit && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                  <select 
                    {...register('status', { required: 'Status is required' })}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3" 
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Result Summary</label>
                  <textarea 
                    {...register('resultSummary')}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" 
                    placeholder="Provide diagnostic insights and observations here..."
                  />
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Report File (PDF/Image)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-slate-50/20">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-650 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="sr-only" 
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG, JPEG up to 10MB</p>
                      {selectedFile && (
                        <p className="text-xs text-indigo-600 font-bold mt-2">Selected: {selectedFile.name}</p>
                      )}
                    </div>
                  </div>

                  {existingReport && (
                    <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 text-xs border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Existing report file available: </span>
                      <a href={existingReport} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-emerald-950">
                        View Current Report File
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-205">
            <button
              type="button"
              onClick={() => navigate('/dashboard/laboratory')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Results & Report' : 'Book Test')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestForm;
