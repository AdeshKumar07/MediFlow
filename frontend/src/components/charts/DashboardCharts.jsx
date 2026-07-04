import React from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

// ─── Color palette (Warm Enterprise Colors) ──────────────────────────────────
export const CHART_COLORS = {
  primary:   '#2563EB', // Blue
  secondary: '#0D9488', // Teal
  success:   '#16A34A', // Green
  warning:   '#D97706', // Amber
  danger:    '#DC2626', // Red
  purple:    '#7C3AED', // Violet
};

const PIE_COLORS = ['#2563EB', '#0D9488', '#16A34A', '#D97706', '#DC2626', '#7C3AED'];

// ─── Custom Tooltip (Enterprise White Theme) ──────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-500 mb-2 font-semibold">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-600 capitalize">{entry.name}:</span>
          <span className="text-slate-900 font-bold">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Revenue Area Chart ──────────────────────────────────────────────────────
export const RevenueAreaChart = ({ data = [], height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
             tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
      <Tooltip content={<CustomTooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />} />
      <Area
        type="monotone" dataKey="revenue" name="Revenue"
        stroke={CHART_COLORS.primary} strokeWidth={2.5}
        fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: CHART_COLORS.primary }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Patient Growth Bar Chart ────────────────────────────────────────────────
export const PatientGrowthBarChart = ({ data = [], height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={CHART_COLORS.success} stopOpacity={0.9} />
          <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="patients" name="New Patients" fill="url(#patGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Appointment Trend Line Chart ────────────────────────────────────────────
export const AppointmentTrendChart = ({ data = [], height = 280, showBreakdown = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<CustomTooltip />} />
      {showBreakdown && <Legend wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 12 }} />}
      <Line
        type="monotone" dataKey="total" name="Total"
        stroke={CHART_COLORS.secondary} strokeWidth={2.5}
        dot={false} activeDot={{ r: 5 }}
      />
      {showBreakdown && (
        <>
          <Line type="monotone" dataKey="completed" name="Completed"
                stroke={CHART_COLORS.success} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cancelled" name="Cancelled"
                stroke={CHART_COLORS.danger} strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="pending" name="Pending"
                stroke={CHART_COLORS.warning} strokeWidth={2} dot={false} />
        </>
      )}
    </LineChart>
  </ResponsiveContainer>
);

// ─── Status Pie Chart ─────────────────────────────────────────────────────
export const StatusPieChart = ({ data = [], height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
        dataKey="value" nameKey="name" paddingAngle={3}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        labelLine={false}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  </ResponsiveContainer>
);
