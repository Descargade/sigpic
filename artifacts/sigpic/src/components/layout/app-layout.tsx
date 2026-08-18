import React from 'react';
import { Sidebar } from './sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full flex flex-col md:pl-0 pl-14">
          {children}
        </div>
      </main>
    </div>
  );
}
