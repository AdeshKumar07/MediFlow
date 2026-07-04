import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientThreads } from '../../services/consultationNoteService';
import { MessageSquare, Stethoscope, Clock, ChevronRight, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientMessages = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await getPatientThreads();
        setThreads(res.data || []);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Doctor Messages</h1>
          <p className="text-xs text-slate-500 mt-0.5">Consultation notes and replies from your doctors</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading messages…
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Inbox className="h-16 w-16 opacity-20" />
          <p className="font-semibold text-slate-500">No messages yet</p>
          <p className="text-sm text-center max-w-xs">Your doctors will send you consultation notes here. Check back after your appointment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {threads.map((thread) => (
            <button
              key={thread.doctor?._id}
              onClick={() => navigate(`/dashboard/patient/thread/${thread.doctor?._id}`)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              {/* Doctor avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm select-none">
                  {thread.doctor?.firstName?.[0]}{thread.doctor?.lastName?.[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                  <Stethoscope className="h-3 w-3 text-blue-600" />
                </div>
              </div>

              {/* Thread info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 text-sm">
                    Dr. {thread.doctor?.firstName} {thread.doctor?.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0 ml-2">
                    <Clock className="h-2.5 w-2.5" />
                    {thread.lastNote?.createdAt ? formatTime(thread.lastNote.createdAt) : ''}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {thread.lastNote?.senderRole === 'DOCTOR' ? '🩺 ' : '👤 You: '}
                  {thread.lastNote?.message || 'Start of conversation'}
                </p>
              </div>

              {/* Unread badge & chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {thread.unreadCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientMessages;
