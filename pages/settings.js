import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { Cog6ToothIcon, ShieldCheckIcon, CreditCardIcon, BriefcaseIcon, DeviceTabletIcon, CloudArrowUpIcon, CloudArrowDownIcon, DocumentArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Settings() {
  const [hardware, setHardware] = useState({
    barcodeScanner: true,
    receiptPrinter: true,
    cashDrawer: false,
    cardReader: true
  });

  const sections = [
    { name: 'General Settings', desc: 'Shop name, currency, and basic profile', icon: BriefcaseIcon },
    { name: 'Tax & Regional', desc: 'VAT settings, tax rates and local currency', icon: CreditCardIcon },
    { name: 'Security & Access', desc: 'Firewall, API keys and sensitive controls', icon: ShieldCheckIcon },
  ];

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/reports/export'); // I'll create this API
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Backup exported successfully');
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  const handleRestoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = JSON.parse(event.target.result);
          const res = await fetch('/api/reports/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: content.data })
          });
          
          if (!res.ok) throw new Error('Restore failed');
          toast.success('System data restored successfully');
          window.location.reload(); // Reload to reflect changes
        } catch (err) {
          toast.error('Invalid backup file or restore failed');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Layout title="System Settings">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">System Settings</h1>
          <p className="text-slate-400 dark:text-slate-400 mt-1">Configure global application behavior and sensitive controls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map(s => (
            <div key={s.name} className="card p-6 hover:border-primary-500/50 transition-all cursor-pointer group">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit mb-4 group-hover:bg-primary-600 transition-colors">
                <s.icon className="h-7 w-7 text-slate-500 dark:text-slate-400 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{s.name}</h3>
              <p className="text-sm text-slate-400 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Hardware Integration Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <DeviceTabletIcon className="h-6 w-6 text-primary-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hardware Integration</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(hardware).map(([key, value]) => (
              <div key={key} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs text-slate-400">{value ? 'Connected' : 'Disconnected'}</p>
                </div>
                <button 
                  onClick={() => setHardware(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Recovery Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <CloudArrowUpIcon className="h-6 w-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Backup & Data Recovery</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 border-l-4 border-emerald-500">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <DocumentArrowDownIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Export Database Backup</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Download a complete snapshot of your products, sales, and customers in JSON format.</p>
                  <button onClick={handleExportData} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                    <CloudArrowDownIcon className="h-4 w-4" /> Download Backup
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <CloudArrowUpIcon className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Restore from Backup</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Upload a previously exported backup file to restore system data. This will overwrite current data.</p>
                  <button onClick={handleRestoreData} className="btn-secondary py-2 px-4 text-xs flex items-center gap-2">
                    <ArrowPathIcon className="h-4 w-4" /> Upload & Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-amber-500/10 rounded-full mb-4">
            <Cog6ToothIcon className="h-10 w-10 text-amber-500 animate-spin-slow" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Sensitive Control Panel</h2>
          <p className="text-sm text-slate-400 max-w-md mt-2">
            This area is restricted to Top-Level Administrators only. Managers cannot access these system-level configuration options.
          </p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
