import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getAnnouncements, createAnnouncement, deleteAnnouncement 
} from '../../services/announcementService';
import { Megaphone, Trash2, Send, ShieldAlert, Sparkles, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const HIERARCHY_OPTIONS = {
  SUPER_ADMIN: [
    { label: 'All Users', value: 'ALL' },
    { label: 'Super Admins', value: 'SUPER_ADMIN' },
    { label: 'Hospital Admins', value: 'HOSPITAL_ADMIN' },
    { label: 'Doctors', value: 'DOCTOR' },
    { label: 'Nurses', value: 'NURSE' },
    { label: 'Receptionists', value: 'RECEPTIONIST' },
    { label: 'Pharmacists', value: 'PHARMACIST' },
    { label: 'Lab Technicians', value: 'LAB_TECH' },
    { label: 'Patients', value: 'PATIENT' }
  ],
  HOSPITAL_ADMIN: [
    { label: 'All Users', value: 'ALL' },
    { label: 'Doctors', value: 'DOCTOR' },
    { label: 'Nurses', value: 'NURSE' },
    { label: 'Receptionists', value: 'RECEPTIONIST' },
    { label: 'Pharmacists', value: 'PHARMACIST' },
    { label: 'Lab Technicians', value: 'LAB_TECH' },
    { label: 'Patients', value: 'PATIENT' }
  ],
  DOCTOR: [
    { label: 'Nurses', value: 'NURSE' },
    { label: 'Patients', value: 'PATIENT' }
  ],
  NURSE: [
    { label: 'Patients', value: 'PATIENT' }
  ],
  RECEPTIONIST: [
    { label: 'Patients', value: 'PATIENT' }
  ],
  PHARMACIST: [
    { label: 'Patients', value: 'PATIENT' }
  ],
  LAB_TECH: [
    { label: 'Patients', value: 'PATIENT' }
  ]
};

const SystemSettings = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedTargets = HIERARCHY_OPTIONS[user?.role] || [];
  const canPublish = allowedTargets.length > 0;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.targetRole) {
      toast.error('Please fill in all announcement fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnnouncement(formData);
      toast.success('Announcement broadcasted successfully');
      setFormData({ title: '', content: '', targetRole: '' });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to retract/delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <Megaphone className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">
            {user?.role === 'SUPER_ADMIN' ? 'System Settings & Announcements' : 'Broadcast Center'}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {user?.role === 'SUPER_ADMIN' 
              ? 'Manage system-wide settings, user credentials, and broadcast notifications.' 
              : 'Send custom notifications and broadcasts to lower-tier user roles.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Write Announcement Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Send className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 text-base font-outfit">New Announcement</h2>
            </div>

            {canPublish ? (
              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target Role Group
                  </label>
                  <select
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all p-2.5 bg-white"
                    required
                  >
                    <option value="">Select target role...</option>
                    {allowedTargets.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter short headline..."
                    className="w-full rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all px-3 py-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Content Body
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Type detail message..."
                    className="w-full rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all px-3 py-2.5 resize-none"
                    required
                  />
                </div>

                {/* ── Send Button – always visible ───────────────────── */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-white px-4 py-3 text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Broadcasting...' : 'Broadcast Message'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center text-xs text-amber-700 font-semibold space-y-1">
                <ShieldAlert className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                <p>Role Not Permitted</p>
                <p className="font-normal text-slate-500">Patients and guest roles cannot publish system announcements.</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-slate-800 text-base font-outfit">Active Broadcast History</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                Total: {announcements.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-500 font-medium">Loading history...</div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                No active announcements found.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map(ann => {
                  const isCreator = ann.senderId?._id === user?._id;
                  const canDelete = isCreator || user?.role === 'SUPER_ADMIN';
                  
                  return (
                    <div 
                      key={ann._id} 
                      className="p-5 border border-slate-150 rounded-2xl hover:border-slate-300 transition flex justify-between items-start gap-4"
                    >
                      <div className="space-y-2 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                            To: {ann.targetRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(ann.createdAt).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            By {ann.senderId?.firstName} {ann.senderId?.lastName} ({ann.senderId?.role.replace('_', ' ')})
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm font-outfit">{ann.title}</h4>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium whitespace-pre-line leading-relaxed">{ann.content}</p>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(ann._id)}
                          className="p-2 -mr-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-50 transition"
                          title="Delete/Retract Announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
