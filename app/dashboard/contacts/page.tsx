'use client';

import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            customer.email?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const newCustomer = await response.json();
      setCustomers([newCustomer, ...customers]);
      setFilteredCustomers([newCustomer, ...customers]);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Failed to add customer:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading customers</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={loadCustomers}
          className="px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your customer directory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#3B5BFF] text-white px-4 py-2 rounded-lg hover:bg-[#2A4BE0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B5BFF] to-[#2A4BE0] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button className="text-sm text-[#3B5BFF] hover:text-[#2A4BE0] font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          {searchQuery ? (
            <>
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            </>
          ) : (
            <>
              <p className="text-gray-500">No customers yet. Add your first customer to get started.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[#3B5BFF] text-white px-4 py-2 rounded-lg hover:bg-[#2A4BE0] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Customer
              </button>
            </>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!isSubmitting) {
                setShowAddModal(false);
                setFormError(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Contact</h2>
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowAddModal(false);
                      setFormError(null);
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                    placeholder="+1234567890"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormError(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Contact'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
