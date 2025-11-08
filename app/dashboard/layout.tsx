'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Protected route - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col h-full">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50/80 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
