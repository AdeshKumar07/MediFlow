import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import DashboardHome from '../pages/DashboardHome';
import Unauthorized from '../pages/Unauthorized';
import { useAuth } from '../context/AuthContext';
import HospitalProfile from '../pages/hospital/HospitalProfile';
import BranchesList from '../pages/hospital/BranchesList';
import DepartmentsList from '../pages/hospital/DepartmentsList';
import HospitalGallery from '../pages/hospital/HospitalGallery';

import StaffList from '../pages/staff/StaffList';
import StaffForm from '../pages/staff/StaffForm';
import PatientsList from '../pages/patients/PatientsList';
import PatientProfile from '../pages/patients/PatientProfile';
import AppointmentsList from '../pages/appointments/AppointmentsList';
import BookAppointment from '../pages/appointments/BookAppointment';
import CalendarView from '../pages/appointments/CalendarView';
import PatientTimeline from '../pages/emr/PatientTimeline';
import ConsultationScreen from '../pages/emr/ConsultationScreen';
import MedicineList from '../pages/pharmacy/MedicineList';
import MedicineForm from '../pages/pharmacy/MedicineForm';
import PrescriptionList from '../pages/pharmacy/PrescriptionList';
import PatientPrescriptions from '../pages/patients/PatientPrescriptions';
import TestList from '../pages/laboratory/TestList';
import TestForm from '../pages/laboratory/TestForm';
import InvoiceList from '../pages/billing/InvoiceList';
import InvoiceCreate from '../pages/billing/InvoiceCreate';
import InvoiceDetail from '../pages/billing/InvoiceDetail';
import PaymentHistory from '../pages/billing/PaymentHistory';
import PaymentSuccess from '../pages/billing/PaymentSuccess';
import PaymentFailure from '../pages/billing/PaymentFailure';
import RevenueReport from '../pages/reports/RevenueReport';
import PatientReport from '../pages/reports/PatientReport';
import AppointmentReport from '../pages/reports/AppointmentReport';
import Profile from '../pages/dashboard/Profile';
import SystemSettings from '../pages/settings/SystemSettings';
import DoctorPanel from '../pages/doctor/DoctorPanel';
import PatientChat from '../pages/doctor/PatientChat';
import PatientMessages from '../pages/doctor/PatientMessages';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Landing Home */}
      <Route path="/" element={<Home />} />

      {/* Public Guest Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard/home" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard/home" replace /> : <Register />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Dashboard Routes (Open to all authenticated roles) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Module 2 Routes */}
          <Route path="hospital" element={<HospitalProfile />} />
          <Route path="hospital/gallery" element={<HospitalGallery />} />
          <Route path="branches" element={<BranchesList />} />
          <Route path="departments" element={<DepartmentsList />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/:id" element={<StaffForm />} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          
          {/* Module 3 Routes (Appointments & EMR) */}
          <Route path="appointments" element={<AppointmentsList />} />
          <Route path="appointments/book" element={<BookAppointment />} />
          <Route path="appointments/calendar" element={<CalendarView />} />
          <Route path="emr/timeline/:id" element={<PatientTimeline />} />
          <Route path="emr/consultation/:appointmentId" element={<ConsultationScreen />} />

          {/* Module 6 Routes (Pharmacy & Laboratory) */}
          <Route path="pharmacy" element={<MedicineList />} />
          <Route path="pharmacy/new" element={<MedicineForm />} />
          <Route path="pharmacy/edit/:id" element={<MedicineForm />} />
          <Route path="pharmacy/prescriptions" element={<PrescriptionList />} />
          
          <Route path="patients/prescriptions" element={<PatientPrescriptions />} />
          
          <Route path="laboratory" element={<TestList />} />
          <Route path="laboratory/new" element={<TestForm />} />
          <Route path="laboratory/edit/:id" element={<TestForm />} />

          {/* Module 7 Routes (Billing & Payments) */}
          <Route path="billing" element={<InvoiceList />} />
          <Route path="billing/new" element={<InvoiceCreate />} />
          <Route path="billing/:id" element={<InvoiceDetail />} />
          <Route path="billing/payments" element={<PaymentHistory />} />
          <Route path="billing/payment-success" element={<PaymentSuccess />} />
          <Route path="billing/payment-failure" element={<PaymentFailure />} />

          {/* Module 8 Routes (Dashboard Reports) */}
          <Route path="reports/revenue" element={<RevenueReport />} />
          <Route path="reports/patients" element={<PatientReport />} />
          <Route path="reports/appointments" element={<AppointmentReport />} />
          <Route path="settings" element={<SystemSettings />} />

          {/* Doctor Advanced Panel Routes */}
          <Route path="doctor/team" element={<DoctorPanel />} />
          <Route path="doctor/patient/:patientId" element={<PatientChat />} />
          <Route path="doctor/messages" element={<PatientMessages />} />

          {/* Patient Messages Routes */}
          <Route path="patient/messages" element={<PatientMessages />} />
          <Route path="patient/thread/:doctorId" element={<PatientChat />} />

          {/* We can define additional Module routes under allowed roles like this:
              <Route path="admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="settings" element={<AdminSettings />} />
              </Route>
          */}
        </Route>
      </Route>

      {/* Fallback routing */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard/home" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
