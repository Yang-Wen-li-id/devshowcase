import React from 'react';
import { Code2, Github, ExternalLink, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Bio */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              DevShowcase
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md">
            Portfolio sistem rekayasa perangkat lunak, arsitektur jaringan terdistribusi, dan aplikasi produksi berstandar enterprise.
          </p>
        </div>

        {/* Col 2: Focus Domains */}
        <div>
          <h4 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-3">
            Focus Areas
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• Full-Stack Web Applications</li>
            <li>• Network Topology & SD-WAN</li>
            <li>• Cloud Infrastructure & DevOps</li>
            <li>• System Admin & High-Throughput APIs</li>
          </ul>
        </div>

        {/* Col 3: Tech Ecosystem */}
        <div>
          <h4 className="text-slate-900 text-xs font-bold uppercase tracking-wider mb-3">
            Core Tech Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['React 19', 'Node.js', 'Express', 'Docker', 'Linux', 'Tailwind CSS', 'Sequelize', 'MongoDB'].map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} DevShowcase. Crafted with engineering precision.</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Production Ready
          </span>
        </div>
      </div>
    </footer>
  );
}
