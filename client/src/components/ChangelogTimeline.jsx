import React from 'react';
import { GitCommit, Calendar, Tag } from 'lucide-react';

export default function ChangelogTimeline({ changelog }) {
  if (!Array.isArray(changelog) || changelog.length === 0) {
    return (
      <div className="clean-card rounded-2xl p-6 text-center text-slate-500">
        <GitCommit className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm">Belum ada riwayat changelog / versi untuk proyek ini.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
      {changelog.map((entry, idx) => {
        const dateFormatted = entry.releaseDate 
          ? new Date(entry.releaseDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Tanggal tidak tercatat';

        return (
          <div key={idx} className="relative group">
            {/* Dot Node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center group-hover:scale-125 transition-transform shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>

            {/* Content Card */}
            <div className="clean-card rounded-xl p-4 bg-white border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                  <Tag className="w-3 h-3" />
                  {entry.version}
                </span>

                <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateFormatted}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {entry.notes}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
