import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users, Filter, ChevronLeft, ChevronRight, RefreshCw,
  Heart, User2, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardAPI from '../../services/dashboardAPI';

// ─── Breakdown Bar ────────────────────────────────────────────────────────────
const BreakdownBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-semibold">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-900 font-bold">{count}</span>
          <span className="text-slate-400 text-[10px]">({pct}%)</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PatientReport = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({ gender: '', bloodGroup: '' });
  const [applied, setApplied] = useState({});

  const fetchReport = useCallback(async (f, p) => {
    try {
      setLoading(true);
      const params = { ...f, page: p, limit: 15 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await dashboardAPI.getPatientReport(params);
      if (res.data?.success) setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load patient report.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(applied, page); }, [fetchReport, applied, page]);

  const handleApply = () => { setPage(1); setApplied({ ...filters }); };
  const handleClear = () => { setFilters({ gender: '', bloodGroup: '' }); setApplied({}); setPage(1); };

  const { summary, patients = [], pagination } = data || {};
  const genderData = summary?.genderSummary || {};
  const bloodData  = summary?.bloodGroupSummary || {};
  const totalGender = Object.values(genderData).reduce((a, b) => a + b, 0);
  const totalBlood  = Object.values(bloodData).reduce((a, b) => a + b, 0);

  const GENDER_COLORS = { Male: 'bg-blue-600', Female: 'bg-pink-500', Other: 'bg-purple-500', Unknown: 'bg-slate-400' };
  const BLOOD_COLORS = ['bg-red-500','bg-orange-500','bg-amber-500','bg-teal-500','bg-cyan-500','bg-blue-500','bg-emerald-500','bg-purple-500'];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/home" className="text-slate-500 hover:text-slate-800 text-xs">Dashboard</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-555 text-xs font-medium">Patient Report</span>
          </div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="h-6 w-6 text-cyan-600" /> Patient Report
          </h1>
        </div>
        <button onClick={() => fetchReport(applied, page)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-button">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider self-center mb-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" /> Filters
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gender</label>
            <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors min-w-[120px]">
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Blood Group</label>
            <select value={filters.bloodGroup} onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors min-w-[120px]">
              <option value="">All Groups</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-button self-end">
            Apply
          </button>
          <button onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-250 transition-button self-end">
            Clear
          </button>
        </div>
      </div>

      {/* ── Breakdown Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gender Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 bg-cyan-500/10">
              <User2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Gender Distribution</h3>
              <p className="text-xs text-slate-500">{totalGender} profiles with gender set</p>
            </div>
          </div>
          <div className="space-y-4.5">
            {Object.entries(genderData).map(([g, count], i) => (
              <BreakdownBar key={g} label={g} count={count} total={totalGender} color={GENDER_COLORS[g] || 'bg-slate-400'} />
            ))}
            {Object.keys(genderData).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No profile data available</p>
            )}
          </div>
        </div>

        {/* Blood Group Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 bg-red-500/10">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Blood Group Distribution</h3>
              <p className="text-xs text-slate-500">{totalBlood} profiles with blood group set</p>
            </div>
          </div>
          <div className="space-y-4.5">
            {Object.entries(bloodData).map(([bg, count], i) => (
              <BreakdownBar key={bg} label={bg} count={count} total={totalBlood} color={BLOOD_COLORS[i % BLOOD_COLORS.length]} />
            ))}
            {Object.keys(bloodData).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No blood group data available</p>
            )}
          </div>
        </div>

      </div>

      {/* ── Patient Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-600" /> Patient Directory
          </h2>
          {pagination && (
            <span className="text-xs text-slate-500">
              {pagination.total} records · Page {pagination.page} of {pagination.pages}
            </span>
          )}
        </div>

        <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Patient','Email','Gender','Blood Group','Age','Allergies','Registered','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 && !loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No patient profiles found</td></tr>
              ) : (
                patients.map(p => {
                  const u = p.userId || {};
                  const age = p.dateOfBirth
                    ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))
                    : null;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-900 font-semibold">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.gender === 'Male' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          p.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>{p.gender || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                          {p.bloodGroup || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{age !== null ? `${age} yrs` : '—'}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {p.allergies?.length > 0 ? p.allergies.slice(0, 2).join(', ') + (p.allergies.length > 2 ? '…' : '') : 'None'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(u.createdAt || p.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-red-50 text-red-700 border-red-150'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${page === p ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PatientReport;
