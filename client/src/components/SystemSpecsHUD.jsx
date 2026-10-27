import React from 'react';
import { Cpu, Server, HardDrive, Wifi, Shield, Activity, Layers, Terminal } from 'lucide-react';

const getSpecIcon = (key) => {
  const lower = key.toLowerCase();
  if (lower.includes('cpu') || lower.includes('processor')) return Cpu;
  if (lower.includes('ram') || lower.includes('memory')) return HardDrive;
  if (lower.includes('os') || lower.includes('system') || lower.includes('kernel') || lower.includes('backend') || lower.includes('frontend')) return Terminal;
  if (lower.includes('network') || lower.includes('traffic') || lower.includes('throughput') || lower.includes('bandwidth')) return Wifi;
  if (lower.includes('security') || lower.includes('encryption') || lower.includes('auth')) return Shield;
  if (lower.includes('latency') || lower.includes('response') || lower.includes('ping')) return Activity;
  return Server;
};

export default function SystemSpecsHUD({ specs }) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="clean-card rounded-2xl p-6 text-center text-slate-500">
        <Server className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm">Belum ada spesifikasi sistem atau konfigurasi teknis terdaftar.</p>
      </div>
    );
  }

  const entries = Object.entries(specs);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([key, value]) => {
        const IconComponent = getSpecIcon(key);
        return (
          <div 
            key={key} 
            className="clean-card rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all flex items-start gap-3.5 group bg-white"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-blue-600">
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block truncate">
                {key}
              </span>
              <span className="text-sm font-semibold text-slate-900 break-words mt-0.5 block">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
