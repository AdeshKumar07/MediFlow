import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointmentsForMonth();
  }, [currentDate]);

  const fetchAppointmentsForMonth = async () => {
    try {
      setLoading(true);
      // In a real app, fetch only for this month using filters.
      const res = await appointmentService.getAppointments();
      setAppointments(res.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border-b border-r border-gray-100"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(apt => apt.date.startsWith(dateStr));
    
    days.push(
      <div key={`day-${d}`} className="h-24 p-2 border-b border-r border-gray-200 bg-white hover:bg-gray-50 transition-colors overflow-y-auto">
        <div className="font-medium text-sm text-gray-500 mb-1">{d}</div>
        <div className="space-y-1">
          {dayAppointments.map(apt => (
            <div key={apt._id} className="text-xs p-1 rounded bg-indigo-100 text-indigo-700 truncate cursor-pointer hover:bg-indigo-200 transition-colors">
              {apt.timeSlot.split(' - ')[0]} - {apt.patientId?.firstName}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">View your monthly schedule and appointments.</p>
        </div>
        <Link to="/dashboard/appointments" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <CalendarIcon className="w-4 h-4 mr-2" />
          List View
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {days}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
