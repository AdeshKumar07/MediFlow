import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { emrService } from '../../services/emrService';
import { FileText, Clock, Activity, Pill, User } from 'lucide-react';

const PatientTimeline = () => {
  const { id: patientId } = useParams(); // URL should be /dashboard/emr/timeline/:id
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await emrService.getMedicalRecords({ patientId });
      setRecords(res.records || []);
    } catch (error) {
      console.error('Failed to fetch EMR records', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading medical history...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
            {records.length > 0 && records[0].patientId ? records[0].patientId.firstName[0] : 'P'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {records.length > 0 && records[0].patientId ? `${records[0].patientId.firstName} ${records[0].patientId.lastName}` : 'Patient Timeline'}
            </h1>
            <p className="text-sm text-gray-500">Comprehensive Medical History & Consultation Records</p>
          </div>
        </div>
      </div>

      <div className="relative border-l-2 border-indigo-100 ml-8 space-y-12 pb-12">
        {records.length === 0 ? (
          <div className="pl-8 pt-4 text-gray-500">No medical records found for this patient.</div>
        ) : (
          records.map((record) => (
            <div key={record._id} className="relative pl-8 group">
              {/* Timeline dot */}
              <div className="absolute -left-[11px] top-2 h-5 w-5 rounded-full bg-white border-4 border-indigo-500 shadow-sm transition-transform group-hover:scale-125"></div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Dr. {record.doctorId?.firstName} {record.doctorId?.lastName}</div>
                    <div className="text-xs text-gray-500">Consultation Provider</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Symptoms & Notes */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                        <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                        Symptoms
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {record.symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    {record.consultationNotes && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                          <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                          Consultation Notes
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {record.consultationNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vitals & Medicines */}
                  <div className="space-y-4">
                    {record.vitals && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                          <Activity className="w-4 h-4 mr-2 text-rose-500" />
                          Vitals
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                          <div>BP: <span className="font-medium text-gray-900">{record.vitals.bloodPressure || '-'}</span></div>
                          <div>Pulse: <span className="font-medium text-gray-900">{record.vitals.pulseRate || '-'}</span></div>
                          <div>Temp: <span className="font-medium text-gray-900">{record.vitals.temperature || '-'}</span></div>
                          <div>Weight: <span className="font-medium text-gray-900">{record.vitals.weight || '-'}</span></div>
                        </div>
                      </div>
                    )}

                    {record.treatmentHistory && record.treatmentHistory.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                          <FileText className="w-4 h-4 mr-2 text-rose-500" />
                          Treatment History
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {record.treatmentHistory.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}

                    {record.medicines && record.medicines.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                          <Pill className="w-4 h-4 mr-2 text-emerald-500" />
                          Prescriptions
                        </h4>
                        <div className="space-y-2">
                          {record.medicines.map((med, i) => (
                            <div key={i} className="text-sm bg-emerald-50/50 p-2 rounded border border-emerald-100">
                              <div className="font-medium text-emerald-900">{med.name}</div>
                              <div className="text-emerald-700 text-xs mt-0.5">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientTimeline;
