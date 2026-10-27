import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Workflow
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import MarkdownViewer from '../components/MarkdownViewer';
import SystemSpecsHUD from '../components/SystemSpecsHUD';
import ChangelogTimeline from '../components/ChangelogTimeline';
import ArchitectureModal from '../components/ArchitectureModal';

export default function ProjectDetail() {
  const { slug } = useParams();

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-subtle-pattern">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">
            Memuat dokumentasi dan spesifikasi proyek...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 pt-24 text-center bg-subtle-pattern">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Proyek Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">{error || 'Slug proyek tidak valid.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
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
    <div className="min-h-screen pb-24 bg-subtle-pattern">
      
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Showcase
            </Link>
            <span>/</span>
            <span className="text-slate-700">{project.category}</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold truncate max-w-xs">{project.slug}</span>
          </div>

          {/* Project Title & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Featured
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200">
                  {project.license || 'MIT'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {details.architectureDiagramUrl && (
                <button
                  onClick={() => setDiagramModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Diagram Arsitektur
                </button>
              )}

              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  Repository
                </a>
              )}

              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
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
              <span className="text-xs text-slate-500 font-medium mr-1">Tech Stack:</span>
              {project.tags.map((tag) => (
                <span
                  key={tag.id || tag.name}
                  className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1"
                >
                  <TagIcon className="w-2.5 h-2.5 text-blue-600" />
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
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-2 shadow-sm">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Studi Kasus & Dokumentasi
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Spesifikasi Sistem
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`flex items-center gap-2 py-3.5 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'changelog'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
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
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-soft">
                <MarkdownViewer content={details.markdownContent} />
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Spesifikasi Lingkungan & Parameter Teknis
                  </h3>
                  <SystemSpecsHUD specs={details.systemSpecs} />
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft">
                <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-blue-600" />
                  Milestone & Riwayat Rilis Versi
                </h3>
                <ChangelogTimeline changelog={details.changelog} />
              </div>
            )}
          </div>

          {/* Right Sidebar (1 Col) */}
          <div className="space-y-6">
            
            {/* Architecture Diagram Preview Card */}
            {details.architectureDiagramUrl && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  Diagram Topologi
                </h4>
                <div 
                  onClick={() => setDiagramModalOpen(true)}
                  className="relative rounded-lg overflow-hidden border border-slate-200 cursor-pointer group shadow-sm"
                >
                  <img
                    src={details.architectureDiagramUrl}
                    alt={`Preview ${project.title}`}
                    className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-white bg-slate-900/80 px-2.5 py-1 rounded-md">
                      Buka Diagram
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Project Quick Overview Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Project Metadata
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-900">{project.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">License</span>
                  <span className="font-mono text-slate-900">{project.license || 'MIT'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Identifier</span>
                  <span className="font-mono text-blue-600">#{project.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-emerald-600">Production Ready</span>
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
