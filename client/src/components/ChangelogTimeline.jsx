import React from 'react';
import { GitCommit, Calendar, Tag } from 'lucide-react';

export default function ChangelogTimeline({ changelog }) {
  if (!Array.isArray(changelog) || changelog.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 text-center text-slate-400">
        <GitCommit className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">Belum ada riwayat changelog / versi untuk proyek ini.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-transparent">
      {changelog.map((entry, idx) => {
        const dateFormatted = entry.releaseDate 
          ? new Date(entry.releaseDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Tanggal tidak tercatat';

        return (
          <div key={idx} className="relative group">
            {/* Dot Node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#090d16] border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-glow-cyan">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            </div>

            {/* Content Card */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  <Tag className="w-3 h-3" />
                  {entry.version}
                </span>

                <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateFormatted}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {entry.notes}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
