import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffList } from '../../services/staffService';
import { getPatientList } from '../../services/patientService';
import { getDoctorInbox } from '../../services/consultationNoteService';
import { Users, FolderHeart, MessageSquare, Search, Stethoscope, Activity, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nurseRes, patientRes, inboxRes] = await Promise.all([
        getStaffList(1, 50, '', 'NURSE'),
        getPatientList(1, 50, search),
        getDoctorInbox()
      ]);
      setNurses(nurseRes.data?.staff || []);
      setPatients(patientRes.data?.data?.patients || patientRes.data?.patients || []);
      setInbox(inboxRes.data || []);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInboxEntry = (patientId) =>
    inbox.find((t) => t.patient?._id === patientId);

  const filteredNurses = nurses.filter(
    (n) =>
      `${n.firstName} ${n.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      n.email.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'patients', label: 'Patients', icon: FolderHeart, count: patients.length },
    { id: 'nurses', label: 'Nursing Staff', icon: Activity, count: nurses.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
            <p className="text-xs text-slate-500 mt-0.5">View nurses & patients — send consultation notes directly</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      ) : activeTab === 'patients' ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {patients.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No patients registered yet.</div>
          ) : (
            patients.map((p) => {
              const thread = getInboxEntry(p._id);
              const unread = thread?.unreadCount || 0;
              return (
                <div key={p._id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm select-none">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                      {thread?.lastNote && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last message: {new Date(thread.lastNote.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/doctor/patient/${p._id}`)}
                    className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {thread ? 'View Thread' : 'Send Note'}
                    {unread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {filteredNurses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No active nurses found.</div>
          ) : (
            filteredNurses.map((n) => (
              <div key={n._id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm select-none">
                    {n.firstName?.[0]}{n.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{n.firstName} {n.lastName}</p>
                    <p className="text-xs text-slate-500">{n.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full">
                      NURSE
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${n.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {n.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorPanel;
