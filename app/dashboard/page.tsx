'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { 
  Clock, 
  Users, 
  TrendingDown, 
  Shield,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface Stats {
  todayBookings: number;
  totalCustomers: number;
  pendingConfirmations: number;
  thisWeekRevenue: number;
  recentActivity?: Activity[];
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    totalCustomers: 0,
    pendingConfirmations: 0,
    thisWeekRevenue: 0,
    recentActivity: [],
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return Calendar;
      case 'message':
        return MessageSquare;
      case 'confirmation':
        return CheckCircle;
      case 'cancellation':
        return XCircle;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'reservation':
        return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
      case 'message':
        return 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30';
      case 'confirmation':
        return 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
      case 'cancellation':
        return 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30';
      default:
        return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  const statCards = [
    {
      title: 'Hours Saved',
      value: stats.todayBookings,
      subtitle: 'This month',
      icon: Clock,
      change: '+12%',
      changePositive: true,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Tasks Completed',
      value: stats.totalCustomers,
      subtitle: 'This month',
      icon: Users,
      change: '+8%',
      changePositive: true,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Avg Response Time',
      value: `${stats.pendingConfirmations}m`,
      subtitle: 'Down from 45m',
      icon: TrendingDown,
      change: '-95%',
      changePositive: true,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Guardrail Saves',
      value: Math.floor(stats.thisWeekRevenue / 100),
      subtitle: 'Issues prevented',
      icon: Shield,
      change: 'High security',
      changePositive: true,
      gradient: 'from-purple-500 to-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Welcome Back</p>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Good morning, {firstName}!
          </h1>
          <motion.div
            animate={{ 
              rotate: [0, 14, -8, 14, -4, 10, 0],
              scale: [1, 1.1, 1.05, 1.1, 1.05, 1.1, 1]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Sparkles className="w-7 h-7 text-primary" />
          </motion.div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what your AI assistant has been up to
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900 
                       hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 
                           shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                
                {/* Value */}
                <div className="flex items-baseline gap-2 mb-1">
                  <motion.h3 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                  >
                    {stat.value}
                  </motion.h3>
                  <span className={`text-xs font-semibold ${
                    stat.changePositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                
                {/* Subtitle */}
                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900"
      >
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-950/50 
                             transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-900"
                  >
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 
                               shadow-sm group-hover:shadow-md transition-all duration-300`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
