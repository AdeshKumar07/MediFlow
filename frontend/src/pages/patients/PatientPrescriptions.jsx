import React, { useState, useEffect } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { FileSpreadsheet, Pill, CheckCircle, Clock, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await pharmacyService.getPrescriptions();
        setPrescriptions(res.data?.prescriptions || []);
      } catch (error) {
        toast.error('Failed to load prescriptions list');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPrescriptions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileSpreadsheet className="w-6 h-6 mr-2 text-indigo-600" />
          My Prescriptions History
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review prescriptions written by your doctors and track their dispensing status.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading your prescription logs...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 space-y-3 shadow-sm">
          <HeartPulse className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm">No prescriptions found on your clinical file.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-650 tracking-wider">Clinical Consult Log</span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">Dr. {p.doctorId?.firstName} {p.doctorId?.lastName}</h3>
                  <p className="text-xs text-gray-500">Dated {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-gray-150 text-xs font-semibold text-gray-650">
                  Diagnosis: <span className="text-indigo-600 font-bold">{p.diagnosis}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-450 uppercase tracking-wider flex items-center">
                    <Pill className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    Medication Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.medicines.map((med) => (
                      <div key={med._id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-start hover:border-gray-200 transition-all bg-slate-50/20">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">{med.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">{med.dosage}</span>
                          </div>
                          <p className="text-xs text-gray-500">{med.frequency} for {med.duration}</p>
                          {med.instructions && (
                            <p className="text-xs text-gray-400 italic">Instructions: "{med.instructions}"</p>
                          )}
                        </div>

                        <div>
                          {med.dispensed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800" title={`Dispensed on ${new Date(med.dispensedAt).toLocaleString()}`}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Dispensed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 mr-1" /> Pending Pickup
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
