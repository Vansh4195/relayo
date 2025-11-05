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
    <div className="flex h-screen flex-col bg-gray-900 text-white w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3B5BFF] to-[#2A4BE0] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="text-xl font-bold">Relayo</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gray-800 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
            DU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-gray-400 truncate">demo@relayo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
