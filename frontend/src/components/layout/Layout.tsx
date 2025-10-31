import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
