import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Terminal, 
  Cpu, 
  Filter, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  RefreshCw,
  Code2,
  Layers,
  CheckCircle2,
  FileCode2,
  Workflow
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';

const CATEGORIES = ['All', 'Web App', 'Network Topology', 'Game Dev', 'System Admin'];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedTag !== 'All') params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await projectsAPI.getAll(params);
      setProjects(res.data?.data || []);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError('Gagal memuat daftar proyek. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await projectsAPI.getTags();
      setTags(res.data?.data || []);
    } catch (err) {
      console.warn('Fetch tags error:', err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-subtle-pattern pb-20">
      
      {/* Minimalist Hero Section */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Production Systems & Architecture Portfolio</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Engineering & Technical <br className="hidden sm:inline" />
            <span className="text-blue-600">Project Showcase</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Koleksi proyek rekayasa perangkat lunak full-stack, topologi jaringan enterprise, dan infrastruktur sistem berkinerja tinggi.
          </p>

          {/* Quick Stats Banner */}
          <div className="pt-2 flex items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {projects.length} Featured Engineering Projects
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified Case Studies
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Production Architecture
            </span>
          </div>

        </div>
      </section>

      {/* Main Filter & Showcase Section */}
      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl p-5 mb-8 space-y-4 border border-slate-200 shadow-soft">
          
          {/* Search + Category Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama proyek atau slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Tech-Stack Tag Filter Chips */}
          {tags.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Filter Tag:
              </span>

              <button
                onClick={() => setSelectedTag('All')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  selectedTag === 'All'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                Semua
              </button>

              {tags.map((t) => (
                <button
                  key={t.id || t.name}
                  onClick={() => setSelectedTag(selectedTag === t.name ? 'All' : t.name)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    selectedTag === t.name
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Memuat katalog proyek rekayasa...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-red-200 max-w-lg mx-auto shadow-soft">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-soft">
            <Code2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Tidak Ada Proyek Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Tidak ada proyek yang sesuai dengan kategori atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}

      </section>

      {/* Case Studies / Architectural Highlights Section */}
      <section id="case-studies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Case Studies & Architecture Deep-Dives
          </h2>
          <p className="text-sm text-slate-600">
            Setiap proyek dilengkapi dokumentasi studi kasus teknis, diagram topologi, serta spesifikasi sistem terukur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multi-Tier Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pemisahan tanggung jawab data antara konsistensi relasional transaksional dan elastisitas dokumen dokumen tidak terstruktur untuk performa optimal.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Production Resiliency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penerapan multi-layer guard rails seperti rate limiting, quota enforcement, validasi MIME berkas, dan sub-second automatic link failover.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Open Technical Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparansi implementasi kode sumber melalui repositori terbuka, riwayat rilis terperinci, dan spesifikasi lingkungan produksi.
            </p>
          </div>

        </div>

      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              About The Platform
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Engineering with Scalability, Security, & Precision
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              DevShowcase dirancang sebagai repositori terpadu untuk mendokumentasikan hasil riset rekayasa sistem komputer. Menggabungkan frontend modern yang responsif dengan backend berstandar industri untuk memvisualisasikan arsitektur sistem secara komprehensif.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all text-center"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
