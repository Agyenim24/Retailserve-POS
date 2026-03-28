import Head from 'next/head';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

export default function Layout({ children, title = 'POS System' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-surface flex flex-col font-sans transition-colors duration-200">
      <Head>
        <title>{title} | RetailServe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-surface">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
