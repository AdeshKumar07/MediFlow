import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Activity,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Building,
  CreditCard,
  History,
  Settings,
  Megaphone,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  Calendar,
  FolderHeart,
  FileSpreadsheet,
  FlaskConical,
  ClipboardList,
  Boxes,
  Truck,
  FileUp,
  Stethoscope,
  ChevronRight,
  Bell,
  Receipt,
  DollarSign,
  PieChart,
  FileBarChart,
  MessageSquare,
  Images
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Helper to resolve role badges colors
  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { text: 'Super Admin', style: 'bg-red-500/10 text-red-500 border border-red-500/20' };
      case 'HOSPITAL_ADMIN':
        return { text: 'Hospital Admin', style: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' };
      case 'DOCTOR':
        return { text: 'Doctor', style: 'bg-blue-500/10 text-blue-450 border border-blue-500/20' };
      case 'RECEPTIONIST':
        return { text: 'Receptionist', style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
      case 'PHARMACIST':
        return { text: 'Pharmacist', style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      case 'LAB_TECH':
        return { text: 'Laboratory Tech', style: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' };
      case 'PATIENT':
        return { text: 'Patient', style: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' };
      default:
        return { text: role, style: 'bg-slate-500/10 text-slate-400' };
    }
  };

  // Define sidebar items based on User roles
  const getSidebarLinks = (role) => {
    const defaultLinks = [
      { name: 'Dashboard Home', path: '/dashboard/home', icon: LayoutDashboard }
    ];

    switch (role) {
      case 'SUPER_ADMIN':
        return [
          ...defaultLinks,
          { name: 'Hospital Profile', path: '/dashboard/hospital', icon: Building },
          { name: 'Branches', path: '/dashboard/branches', icon: Building2 },
          { name: 'Departments', path: '/dashboard/departments', icon: Building2 },
          { name: 'Hospital Gallery', path: '/dashboard/hospital/gallery', icon: Images },
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'Pharmacy Inventory', path: '/dashboard/pharmacy', icon: Boxes },
          { name: 'Prescriptions', path: '/dashboard/pharmacy/prescriptions', icon: ClipboardList },
          { name: 'Laboratory Tests', path: '/dashboard/laboratory', icon: FlaskConical },
          { name: 'Invoices & Billing', path: '/dashboard/billing', icon: Receipt },
          { name: 'Payment History', path: '/dashboard/billing/payments', icon: DollarSign },
          { name: 'Reports', path: '#reports-header', icon: PieChart, isHeader: true },
          { name: 'Revenue Report', path: '/dashboard/reports/revenue', icon: FileBarChart },
          { name: 'Patient Report', path: '/dashboard/reports/patients', icon: FileBarChart },
          { name: 'Appointment Report', path: '/dashboard/reports/appointments', icon: FileBarChart },
          { name: 'System Settings', path: '/dashboard/settings', icon: Settings }
        ];
      case 'HOSPITAL_ADMIN':
        return [
          ...defaultLinks,
          { name: 'Hospital Profile', path: '/dashboard/hospital', icon: Building },
          { name: 'Branches', path: '/dashboard/branches', icon: Building2 },
          { name: 'Departments', path: '/dashboard/departments', icon: Building2 },
          { name: 'Hospital Gallery', path: '/dashboard/hospital/gallery', icon: Images },
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'Invoices & Billing', path: '/dashboard/billing', icon: Receipt },
          { name: 'Payment History', path: '/dashboard/billing/payments', icon: DollarSign },
          { name: 'Reports', path: '#reports-header', icon: PieChart, isHeader: true },
          { name: 'Revenue Report', path: '/dashboard/reports/revenue', icon: FileBarChart },
          { name: 'Patient Report', path: '/dashboard/reports/patients', icon: FileBarChart },
          { name: 'Appointment Report', path: '/dashboard/reports/appointments', icon: FileBarChart },
          { name: 'System Settings', path: '/dashboard/settings', icon: Settings }
        ];
      case 'DOCTOR':
        return [
          ...defaultLinks,
          { name: 'My Team', path: '/dashboard/doctor/team', icon: Users },
          { name: 'Hospital Gallery', path: '/dashboard/hospital/gallery', icon: Images },
          { name: 'Patient Messages', path: '/dashboard/doctor/messages', icon: MessageSquare },
          { name: 'My Appointments', path: '/dashboard/appointments', icon: Calendar },
          { name: 'E-Prescriptions', path: '/dashboard/pharmacy/prescriptions', icon: FileSpreadsheet },
          { name: 'Announcements', path: '/dashboard/settings', icon: Megaphone }
        ];
      case 'NURSE':
        return [
          ...defaultLinks,
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'My Appointments', path: '#appointments', icon: Calendar },
          { name: 'E-Prescriptions', path: '#prescripts', icon: FileSpreadsheet },
          { name: 'Announcements', path: '/dashboard/settings', icon: Megaphone }
        ];
      case 'RECEPTIONIST':
        return [
          ...defaultLinks,
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients Register', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'Scheduling Desk', path: '#schedule', icon: Calendar },
          { name: 'Room Allocations', path: '#rooms', icon: Building },
          { name: 'Announcements', path: '/dashboard/settings', icon: Megaphone }
        ];
      case 'PHARMACIST':
        return [
          ...defaultLinks,
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'Inventory', path: '/dashboard/pharmacy', icon: Boxes },
          { name: 'Prescriptions', path: '/dashboard/pharmacy/prescriptions', icon: ClipboardList },
          { name: 'Invoices', path: '/dashboard/billing', icon: Receipt },
          { name: 'Announcements', path: '/dashboard/settings', icon: Megaphone }
        ];
      case 'LAB_TECH':
        return [
          ...defaultLinks,
          { name: 'Staff Directory', path: '/dashboard/staff', icon: Users },
          { name: 'Patients', path: '/dashboard/patients', icon: FolderHeart },
          { name: 'Lab Tests', path: '/dashboard/laboratory', icon: FlaskConical },
          { name: 'Announcements', path: '/dashboard/settings', icon: Megaphone }
        ];
      case 'PATIENT':
        return [
          ...defaultLinks,
          { name: 'My Profile', path: `/dashboard/patients/${user?._id}`, icon: User },
          { name: 'Doctor Messages', path: '/dashboard/patient/messages', icon: MessageSquare },
          { name: 'My Lab Reports', path: '/dashboard/laboratory', icon: FileUp },
          { name: 'Prescriptions List', path: '/dashboard/patients/prescriptions', icon: FileSpreadsheet },
          { name: 'Book Appointment', path: '/dashboard/appointments/book', icon: Calendar },
          { name: 'My Invoices', path: '/dashboard/billing', icon: Receipt },
          { name: 'Payment History', path: '/dashboard/billing/payments', icon: DollarSign },
        ];
      default:
        return defaultLinks;
    }
  };

  const badge = getRoleBadge(user?.role);
  const links = getSidebarLinks(user?.role);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-20">
        {/* Brand Header */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-600/10">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-outfit text-xl font-bold text-slate-850 tracking-wide">
            Medi<span className="text-brand-600">Flow</span>
          </span>
        </div>
        
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            // Section header (e.g., "Reports")
            if (link.isHeader) {
              return (
                <div key={link.name} className="pt-4 pb-1 px-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" /> {link.name}
                  </p>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`mr-3 h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="flex-1">{link.name}</span>
                {!isActive && link.path.startsWith('#') && (
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <Link to="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 mb-3 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
            {user?.profileImage ? (
              <img
                src={user.profileImage.startsWith('http') ? user.profileImage : user.profileImage}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover border border-slate-100"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-brand-600 border border-slate-200 font-bold text-xs select-none">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100 transition-button"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 max-w-xs bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-outfit text-lg font-bold text-slate-900">
              MediFlow
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            if (link.isHeader) {
              return (
                <div key={link.name} className="pt-4 pb-1 px-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" /> {link.name}
                  </p>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-100 transition-button"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content body wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30">
          {/* Mobile open button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Left panel placeholder */}
          <div className="hidden sm:flex items-center text-xs text-slate-500 font-semibold uppercase tracking-wider select-none">
            <span className="text-emerald-500 mr-2 animate-pulse-slow">●</span> SECURE ENTERPRISE LAYER ACTIVE
          </div>

          {/* Right navbar options */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Role Badge */}
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.style}`}>
              {badge.text}
            </span>

            {/* Notification Bell */}
            <button className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-600 animate-ping"></span>
            </button>

            {/* Profile Avatar Widget */}
            <Link to="/dashboard/profile" className="flex items-center gap-2 border-l border-slate-200 pl-4 hover:opacity-85 transition-opacity">
              {user?.profileImage ? (
                <img
                  src={user.profileImage.startsWith('http') ? user.profileImage : user.profileImage}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs select-none">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
              )}
              <div className="hidden lg:block text-left select-none">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">ID: {user?._id?.substring(18)}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard content viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
