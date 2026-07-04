import React, { useState, useEffect, useCallback } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { ClipboardList, Search, Pill, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pharmacyService.getPrescriptions();
      setPrescriptions(res.data?.prescriptions || []);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleDispense = async (recordId, medicineId) => {
    try {
      const res = await pharmacyService.dispenseMedicine(recordId, medicineId);
      if (res.success) {
        toast.success(res.message || 'Medicine dispensed successfully');
        
        // Refresh local data
        fetchPrescriptions();
        
        // Update selected prescription view in sidebar
        if (selectedPrescription && selectedPrescription._id === recordId) {
          const updatedPrescriptions = await pharmacyService.getPrescriptions();
          const list = updatedPrescriptions.data?.prescriptions || [];
          const updated = list.find(p => p._id === recordId);
          setSelectedPrescription(updated || null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispense medicine');
    }
  };

  // Filter prescriptions by patient name or email
  const filteredPrescriptions = prescriptions.filter(p => {
    if (!p.patientId) return false;
    const name = `${p.patientId.firstName} ${p.patientId.lastName}`.toLowerCase();
    const email = p.patientId.email.toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClipboardList className="w-6 h-6 mr-2 text-indigo-600" />
          Patient Prescriptions Desk
        </h1>
        <p className="text-sm text-gray-500 mt-1">Dispense prescribed medications and automatically adjust pharmacy inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription List Pane */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-450" />
              </span>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search patient name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading prescriptions...</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No prescriptions found.</div>
            ) : (
              filteredPrescriptions.map((p) => {
                const pendingCount = p.medicines.filter(m => !m.dispensed).length;
                const isSelected = selectedPrescription?._id === p._id;

                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPrescription(p)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {p.patientId.firstName} {p.patientId.lastName}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">Diagnosis: {p.diagnosis}</p>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">Dr. {p.doctorId?.firstName} {p.doctorId?.lastName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${pendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {pendingCount > 0 ? `${pendingCount} Pending` : 'Dispensed'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Prescription Details Pane */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {selectedPrescription ? (
            <div className="flex flex-col h-full">
              {/* Header Info */}
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Prescription Details</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {selectedPrescription.patientId.firstName} {selectedPrescription.patientId.lastName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedPrescription.patientId.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-800 font-semibold">Dr. {selectedPrescription.doctorId?.firstName} {selectedPrescription.doctorId?.lastName}</p>
                  <p className="text-xs text-gray-450 mt-0.5">Diagnosed on {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Body details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clinical Diagnosis</h3>
                  <p className="text-sm text-gray-900 mt-1 font-medium">{selectedPrescription.diagnosis}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <Pill className="w-4 h-4 mr-2 text-indigo-600" />
                    Prescribed Medications
                  </h3>

                  <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden">
                    {selectedPrescription.medicines.map((med) => (
                      <div key={med._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-slate-50/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">{med.name}</span>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono">{med.dosage}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span>{med.frequency}</span> • <span>{med.duration}</span>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-gray-400 italic">Instructions: "{med.instructions}"</p>
                          )}
                          {med.dispensed && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Dispensed on {new Date(med.dispensedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          {med.dispensed ? (
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-emerald-800 bg-emerald-100"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDispense(selectedPrescription._id, med._id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                            >
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> Dispense Medicine
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 space-y-3">
              <AlertCircle className="w-12 h-12 text-gray-300" />
              <p className="text-sm">Select a prescription from the sidebar list to inspect medications and manage dispensing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionList;
