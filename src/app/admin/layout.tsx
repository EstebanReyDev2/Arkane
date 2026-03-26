import React from 'react';
import { AdminSidebar } from '@/src/components/admin/AdminSidebar';
import { AdminTopbar } from '@/src/components/admin/AdminTopbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F4F4F5] overflow-hidden font-sans">
      {/* SIDEBAR — 240px, fixed */}
      <AdminSidebar />
      
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
