import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Star, 
  Calendar, 
  Tag as TagIcon, 
  FileText, 
  Cpu, 
  GitCommit, 
  Image as ImageIcon,
  Activity,
  Layers,
  Database,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import MarkdownViewer from '../components/MarkdownViewer';
import SystemSpecsHUD from '../components/SystemSpecsHUD';
import ChangelogTimeline from '../components/ChangelogTimeline';
import ArchitectureModal from '../components/ArchitectureModal';

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('docs'); // 'docs' | 'specs' | 'changelog'
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await projectsAPI.getBySlug(slug);
        setProject(res.data?.data || null);
      } catch (err) {
        console.error('Error fetching project detail:', err);
        setError(err.response?.data?.message || 'Proyek tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProjectDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">
            Menggabungkan metadata MariaDB dan dokumen MongoDB...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 pt-24 text-center">
        <div className="glass-panel rounded-2xl p-8 border-red-500/30 space-y-4">
          <h2 className="text-xl font-bold text-white">Proyek Tidak Ditemukan</h2>
          <p className="text-sm text-slate-400">{error || 'Slug proyek tidak valid.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Showcase
          </Link>
        </div>
      </div>
    );
  }

  const details = project.details || {};

  return (
    <div className="min-h-screen pb-20 bg-grid-pattern">
      
      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Showcase
            </Link>
            <span>/</span>
            <span className="text-slate-300">{project.category}</span>
            <span>/</span>
            <span className="text-cyan-400 truncate max-w-xs">{project.slug}</span>
          </div>

          {/* Project Title & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-300" />
                    Featured
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {project.license || 'MIT'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {details.architectureDiagramUrl && (
                <button
                  onClick={() => setDiagramModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Diagram Arsitektur
                </button>
              )}

              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  <Github className="w-4 h-4" />
                  Source Code
                </a>
              )}

              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-xs font-bold hover:opacity-95 shadow-glow-cyan transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live System
                </a>
              )}
            </div>

          </div>

          {/* Tags bar */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-slate-400 font-mono mr-1">Tech Stack:</span>
              {project.tags.map((tag) => (
                <span
                  key={tag.id || tag.name}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1"
                >
                  <TagIcon className="w-2.5 h-2.5" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 bg-slate-950/40 rounded-t-xl px-2">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'docs'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Studi Kasus & Dokumentasi
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Spesifikasi Sistem
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'changelog'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            3. Riwayat Rilis ({details.changelog?.length || 0})
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Body (3 Cols) */}
          <div className="lg:col-span-3">
            {activeTab === 'docs' && (
              <div className="glass-panel rounded-2xl p-6 sm:p-8 border-slate-800">
                <MarkdownViewer content={details.markdownContent} />
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="glass-panel rounded-2xl p-6 border-slate-800">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    Spesifikasi Hardware & Lingkungan Eksekusi
                  </h3>
                  <SystemSpecsHUD specs={details.systemSpecs} />
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="glass-panel rounded-2xl p-6 sm:p-8 border-slate-800">
                <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-indigo-400" />
                  Milestone & Catatan Rilis Versi
                </h3>
                <ChangelogTimeline changelog={details.changelog} />
              </div>
            )}
          </div>

          {/* Right Sidebar: Dual-DB Meta & Architecture Quick View (1 Col) */}
          <div className="space-y-6">
            
            {/* Architecture Diagram Preview Card */}
            {details.architectureDiagramUrl && (
              <div className="glass-panel rounded-2xl p-4 border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Diagram Topologi
                </h4>
                <div 
                  onClick={() => setDiagramModalOpen(true)}
                  className="relative rounded-lg overflow-hidden border border-slate-700/80 cursor-pointer group"
                >
                  <img
                    src={details.architectureDiagramUrl}
                    alt={`Preview ${project.title}`}
                    className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-white bg-black/70 px-2.5 py-1 rounded-md">
                      Perbesar Diagram
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Dual-Database Audit Footprint Tracker Card */}
            <div className="glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Audit Trail Telemetry
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kunjungan Anda pada halaman proyek ini secara otomatis dicatat oleh middleware backend <code className="text-cyan-300 font-mono">auditLogger.js</code> ke koleksi <code className="text-cyan-300 font-mono">AccessLogs</code> MongoDB untuk audit akses transparan.
              </p>
              
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Target Project ID:</span>
                  <span className="text-white font-bold">{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>SQL Entity:</span>
                  <span className="text-emerald-400">MariaDB #projects</span>
                </div>
                <div className="flex justify-between">
                  <span>NoSQL Doc:</span>
                  <span className="text-cyan-400">MongoDB #project_details</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={diagramModalOpen}
        onClose={() => setDiagramModalOpen(false)}
        imageUrl={details.architectureDiagramUrl}
        title={project.title}
      />

    </div>
  );
}
