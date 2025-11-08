'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/components/ThemeProvider';
import { Search, Bell, ChevronDown, LogOut, User, Moon, Sun, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
        className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 flex items-center justify-between px-6 backdrop-blur-xl"
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </motion.div>
          <input
            type="text"
            placeholder="Search reservations, customers..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm
            bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-gray-900
            transition-all duration-300 hover:border-primary/50"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 text-gray-600 dark:text-gray-300 rounded-xl
          hover:bg-accent dark:hover:bg-gray-900 transition-all group overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-5 h-5 group-hover:text-primary transition-colors" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-5 h-5 group-hover:text-primary transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-accent dark:hover:bg-gray-900 transition-all group"
        >
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </motion.button>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent dark:hover:bg-gray-900 transition-all group"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-md group-hover:shadow-lg group-hover:glow-blue transition-all"
            >
              {user?.name?.charAt(0) || 'D'}
            </motion.div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
              {user?.name || 'Demo User'}
            </span>
            <motion.div
              animate={{ rotate: showUserMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </motion.div>
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-1 z-20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <motion.button
                    onClick={() => {
                      router.push('/dashboard/settings');
                      setShowUserMenu(false);
                    }}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-900 transition-all group"
                  >
                    <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                    Settings
                    <Zap className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
