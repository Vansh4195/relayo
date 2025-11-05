'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus } from 'lucide-react';

type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
type AppointmentSource = 'CALENDAR_SYNC' | 'MANUAL' | 'PHONE' | 'SMS' | 'WEB';

interface Appointment {
  id: string;
  eventId: string;
  title: string;
  service: string;
  staff: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  start: string;
  end: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export default function ReservationsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus[]>([]);
  const [sourceFilter, setSourceFilter] = useState<AppointmentSource[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    service: '',
    staff: '',
    start: '',
    end: '',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchQuery, statusFilter, sourceFilter]);

  async function loadAppointments() {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        console.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.customer?.name.toLowerCase().includes(query) ||
          apt.customer?.phone.includes(query) ||
          apt.service.toLowerCase().includes(query) ||
          apt.title.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((apt) => statusFilter.includes(apt.status));
    }

    // Source filter
    if (sourceFilter.length > 0) {
      filtered = filtered.filter((apt) => sourceFilter.includes(apt.source));
    }

    setFilteredAppointments(filtered);
  }

  function toggleStatusFilter(status: AppointmentStatus) {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  function toggleSourceFilter(source: AppointmentSource) {
    setSourceFilter((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }

  async function handleCreateReservation(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create reservation');
      }

      // Reset form and close modal
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        staff: '',
        start: '',
        end: '',
        notes: '',
      });
      setShowModal(false);

      // Reload appointments
      await loadAppointments();
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create reservation');
    } finally {
      setSaving(false);
    }
  }

  const statusColors: Record<AppointmentStatus, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    'no-show': 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">
            Manage all your appointments and bookings
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#3B5BFF] text-white px-4 py-2 rounded-lg hover:bg-[#2A4BE0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-2">
            {(['confirmed', 'pending', 'cancelled'] as AppointmentStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter.includes(status)
                    ? statusColors[status]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Source Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            {(['CALENDAR_SYNC', 'MANUAL', 'PHONE'] as AppointmentSource[]).map((source) => (
              <button
                key={source}
                onClick={() => toggleSourceFilter(source)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  sourceFilter.includes(source)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {source.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Active Filters Count */}
        {(statusFilter.length > 0 || sourceFilter.length > 0 || searchQuery) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} of {appointments.length} reservations
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter([]);
                setSourceFilter([]);
              }}
              className="text-sm text-[#3B5BFF] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment, index) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColors[appointment.status]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.customer?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.customer?.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{appointment.service || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{appointment.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full bg-[#3B5BFF] flex items-center justify-center text-white text-xs font-medium"
                      >
                        {appointment.staff?.charAt(0) || 'S'}
                      </div>
                      <span className="text-sm text-gray-900">{appointment.staff || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(appointment.start).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(appointment.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{appointment.source.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-[#3B5BFF] hover:text-[#2A4BE0] font-medium">
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No reservations found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Reservation</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateReservation} className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                  />
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      placeholder="e.g., Haircut, Consultation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff
                    </label>
                    <input
                      type="text"
                      value={formData.staff}
                      onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start}
                      onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end}
                      onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Creating...
                      </>
                    ) : (
                      'Create Reservation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
