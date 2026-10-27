import React from 'react';
import { X, ExternalLink, Maximize2, Image } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose, imageUrl, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl glass-panel rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white truncate">
              Diagram Arsitektur: {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Buka Ukuran Penuh"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="p-4 overflow-auto flex items-center justify-center bg-[#040711]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Diagram Arsitektur - ${title}`}
              className="max-h-[70vh] w-auto object-contain rounded-lg border border-slate-800"
            />
          ) : (
            <div className="py-20 text-center text-slate-400">
              <p>URL Gambar Diagram belum dikonfigurasi.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
