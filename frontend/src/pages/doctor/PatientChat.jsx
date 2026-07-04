import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDoctorPatientThread,
  sendDoctorNote,
  getPatientDoctorThread,
  sendPatientReply
} from '../../services/consultationNoteService';
import { ArrowLeft, Send, Stethoscope, User, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientChat = () => {
  const { user } = useAuth();
  const { patientId, doctorId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [person, setPerson] = useState(null); // the other party (patient or doctor)
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const isDoctor = user?.role === 'DOCTOR';
  const threadPartnerId = isDoctor ? patientId : doctorId;

  const fetchThread = useCallback(async () => {
    try {
      let res;
      if (isDoctor) {
        res = await getDoctorPatientThread(patientId);
        setPerson(res.data.patient);
        setNotes(res.data.notes);
      } else {
        res = await getPatientDoctorThread(doctorId);
        setPerson(res.data.doctor);
        setNotes(res.data.notes);
      }
    } catch (err) {
      toast.error('Failed to load consultation thread');
    } finally {
      setIsLoading(false);
    }
  }, [isDoctor, patientId, doctorId]);

  useEffect(() => {
    fetchThread();
    // Poll every 15s for new messages
    const interval = setInterval(fetchThread, 15000);
    return () => clearInterval(interval);
  }, [fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      let res;
      if (isDoctor) {
        res = await sendDoctorNote(patientId, message.trim());
      } else {
        res = await sendPatientReply(doctorId, message.trim());
      }
      setNotes((prev) => [...prev, res.data]);
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Loading consultation thread…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 mb-4">
        <button
          onClick={() => navigate(isDoctor ? '/dashboard/doctor/team' : '/dashboard/patient/messages')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm select-none shadow-sm"
          style={{ background: isDoctor ? '#dcfce7' : '#dbeafe', color: isDoctor ? '#166534' : '#1e40af' }}>
          {person?.firstName?.[0]}{person?.lastName?.[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {person?.firstName} {person?.lastName}
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            {isDoctor ? <User className="h-3 w-3" /> : <Stethoscope className="h-3 w-3" />}
            {isDoctor ? 'Patient' : 'Doctor'} · {person?.email}
          </p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            Consultation Thread
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-16">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Start the consultation by sending a note below.</p>
          </div>
        ) : (
          notes.map((note) => {
            const isMine = note.senderRole === user?.role;
            return (
              <div key={note._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] group`}>
                  {/* Sender label */}
                  <p className={`text-[10px] font-bold mb-1 ${isMine ? 'text-right text-blue-600' : 'text-left text-slate-500'}`}>
                    {note.senderRole === 'DOCTOR' ? '🩺 Doctor' : '👤 Patient'}
                  </p>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {note.message}
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(note.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder={isDoctor ? 'Write a consultation note to this patient…' : 'Reply to your doctor…'}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="self-end flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-600/20"
        >
          {isSending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </button>
      </form>
      <p className="text-center text-[10px] text-slate-400 mt-2">Press <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">Enter</kbd> to send · <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">Shift + Enter</kbd> for new line</p>
    </div>
  );
};

export default PatientChat;
