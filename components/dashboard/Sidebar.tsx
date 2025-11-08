'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reservations', href: '/dashboard/reservations', icon: CalendarCheck },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-screen flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-900 w-64 fixed left-0 top-0 shadow-xl dark:shadow-2xl"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-900">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 bg-gradient-to-br from-[#3B5BFF] to-[#2A4BE0] rounded-xl flex items-center justify-center text-white font-bold text-sm glow-blue group-hover:glow-blue-strong transition-all duration-300"
          >
            R
          </motion.div>
          <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            Relayo
          </span>
          <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 group overflow-hidden
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-lg glow-blue'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-900'
                  }
                `}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </>
                )}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="relative z-10"
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-lg' : 'group-hover:text-primary'} transition-colors`} />
                </motion.div>
                <span className="relative z-10">{item.name}</span>
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent dark:hover:bg-gray-900 transition-all cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-medium text-white shadow-md group-hover:shadow-lg group-hover:glow-blue transition-all"
          >
            DU
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Demo User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">demo@relayo.com</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
