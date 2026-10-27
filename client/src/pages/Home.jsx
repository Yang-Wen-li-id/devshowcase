import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  Database, 
  Activity, 
  Terminal, 
  Cpu, 
  Filter, 
  Sparkles,
  ArrowRight,
  Shield,
  Server,
  RefreshCw
} from 'lucide-react';
import { projectsAPI, healthAPI } from '../services/api';
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
      setError('Gagal memuat daftar proyek. Pastikan server backend dan database berjalan.');
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
    <div className="min-h-screen bg-grid-pattern pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center space-y-5 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dual-Database Platform (MariaDB + MongoDB)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Platform Rekayasa Teknis & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Audit Akses Proyek
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eksplorasi portofolio arsitektur jaringan, aplikasi web full-stack berkinerja tinggi, dan otomatisasi server dengan telemetri audit akses transparan.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="glass-panel rounded-xl p-3 text-center border-slate-800">
              <span className="text-2xl font-extrabold text-cyan-400">{projects.length}</span>
              <span className="text-[11px] font-mono text-slate-400 block">Proyek Terdaftar</span>
            </div>
            <div className="glass-panel rounded-xl p-3 text-center border-slate-800">
              <span className="text-2xl font-extrabold text-emerald-400">MariaDB</span>
              <span className="text-[11px] font-mono text-slate-400 block">Relational ACID</span>
            </div>
            <div className="glass-panel rounded-xl p-3 text-center border-slate-800">
              <span className="text-2xl font-extrabold text-indigo-400">MongoDB</span>
              <span className="text-[11px] font-mono text-slate-400 block">Doc & Telemetry</span>
            </div>
            <div className="glass-panel rounded-xl p-3 text-center border-slate-800">
              <span className="text-2xl font-extrabold text-amber-400">&lt; 20ms</span>
              <span className="text-[11px] font-mono text-slate-400 block">Avg Response</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Filter & Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 mb-8 space-y-4 border-slate-800">
          
          {/* Search + Category Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul proyek atau slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-black shadow-glow-cyan'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Tech-Stack Tag Filter Chips */}
          {tags.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-cyan-400" />
                Filter Tag:
              </span>

              <button
                onClick={() => setSelectedTag('All')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 ${
                  selectedTag === 'All'
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'bg-slate-800/90 text-slate-400 hover:text-white'
                }`}
              >
                Semua Tag
              </button>

              {tags.map((t) => (
                <button
                  key={t.id || t.name}
                  onClick={() => setSelectedTag(selectedTag === t.name ? 'All' : t.name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 ${
                    selectedTag === t.name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
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
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-mono">Memuat portofolio rekayasa teknis...</p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-2xl p-8 text-center border-red-500/30 max-w-lg mx-auto">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
            >
              Coba Muat Ulang
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-slate-800 max-w-md mx-auto">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Tidak Ada Proyek</h3>
            <p className="text-xs text-slate-400">
              Tidak ditemukan proyek dengan kategori atau kata kunci tersebut.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}

      </section>

      {/* Dual-Database Architecture Explanation Section */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Arsitektur Dual-Database & Pipeline Telemetri
          </h2>
          <p className="text-sm text-slate-400">
            Pemisahan tanggung jawab data untuk performa tinggi, integritas transaksional, dan elastisitas dokumen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MariaDB Card */}
          <div className="glass-panel rounded-2xl p-6 border-emerald-500/20 hover:border-emerald-500/40 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MariaDB 11.4 (Relasional)</h3>
                <span className="text-xs font-mono text-emerald-400">Port 3306 • Sequelize ORM</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bertanggung jawab terhadap entitas inti yang memerlukan jaminan transaksi ACID, konsistensi relasi foreign key, dan integritas skema terstruktur.
            </p>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="text-emerald-400 font-semibold mb-1">Tabel yang Dikelola:</div>
              <div>• <code>users</code>: Akun Admin, otentikasi bcrypt & hak akses role</div>
              <div>• <code>projects</code>: Judul, slug unik, kategori, repo, demo URL</div>
              <div>• <code>tags</code>: Kamus tech-stack & icon class</div>
              <div>• <code>project_tags</code>: Pivot table relasi Many-to-Many</div>
            </div>
          </div>

          {/* MongoDB Card */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 hover:border-cyan-500/40 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MongoDB 7.0 (Dokumen NoSQL)</h3>
                <span className="text-xs font-mono text-cyan-400">Port 27017 • Mongoose ODM</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bertanggung jawab atas konten dokumen fleksibel tanpa batasan kolom tetap dan penyimpanan time-series log audit footprint pengunjung berkecepatan tinggi.
            </p>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="text-cyan-400 font-semibold mb-1">Koleksi yang Dikelola:</div>
              <div>• <code>project_details</code>: Markdown case study, diagram URL, system specs, changelog</div>
              <div>• <code>access_logs</code>: Cloudflare client IP, latency ms, User-Agent, audit timestamp</div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
