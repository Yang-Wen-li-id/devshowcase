import React from 'react';
import { Layers, Database, Shield, Server, Terminal, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Overview */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[6px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              DevShowcase
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Platform portofolio rekayasa teknis interaktif dengan arsitektur dual-database (MariaDB untuk konsistensi relasional ACID dan MongoDB untuk fleksibilitas dokumen skema dinamis & telemetry audit log).
          </p>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Ubuntu Server 10.100.30.57
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Cloudflare Tunnel Ready
            </span>
          </div>
        </div>

        {/* Col 2: Architecture Roles */}
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
            Database Roles
          </h4>
          <ul className="space-y-2 text-xs font-mono text-slate-400">
            <li className="flex items-start gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>MariaDB 3306:</strong> Users, Projects, Tags & Pivot M-to-M</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span><strong>MongoDB 27017:</strong> Case Study Docs, Hardware Specs, Audit Footprint</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Tech Stack */}
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
            Core Technologies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['React 19', 'Vite', 'Express.js', 'Sequelize', 'Mongoose', 'Tailwind CSS', 'Recharts', 'JWT'].map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} DevShowcase. High-Performance Engineering Portfolio Platform.</p>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Active
          </span>
          <span>Dual-Store Synchronized</span>
        </div>
      </div>
    </footer>
  );
}
