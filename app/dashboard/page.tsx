'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  todayBookings: number;
  totalCustomers: number;
  pendingConfirmations: number;
  thisWeekRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    totalCustomers: 0,
    pendingConfirmations: 0,
    thisWeekRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Pending Confirmations',
      value: stats.pendingConfirmations,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3%',
    },
    {
      title: 'This Week Revenue',
      value: `$${stats.thisWeekRevenue}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+18%',
    },
  ];

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/reservations?new=true')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#3B5BFF] hover:bg-blue-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#3B5BFF]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New Reservation</p>
              <p className="text-sm text-gray-600">Create a new booking</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/contacts?new=true')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#3B5BFF] hover:bg-blue-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Customer</p>
              <p className="text-sm text-gray-600">Register new contact</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/calendar')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#3B5BFF] hover:bg-blue-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Performance insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
