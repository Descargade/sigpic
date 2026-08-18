import React from 'react';
import { Sidebar } from './sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto flex flex-col md:pl-0 pl-14 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
