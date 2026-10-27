import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Database, 
  Layers, 
  Activity, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { projectsAPI, analyticsAPI } from '../services/api';
import ProjectFormModal from '../components/ProjectFormModal';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Active view tab: 'telemetry' | 'projects'
  const [activeTab, setActiveTab] = useState('telemetry');

  // Stats & Analytics State
  const [overview, setOverview] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Projects Management State
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Status message
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('devshowcase_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch Overview and Chart
  const fetchAnalytics = async (page = 1) => {
    setAnalyticsLoading(true);
    try {
      const [overviewRes, trendRes, logsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrend(14),
        analyticsAPI.getLogs({ page, limit: 10 }),
      ]);

      setOverview(overviewRes.data?.data || null);
      setTrendData(trendRes.data?.data || []);
      setRawLogs(logsRes.data?.data || []);
      setLogsPagination(logsRes.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch Projects List
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await projectsAPI.getAll({ search: projectSearch });
      setProjects(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(1);
    fetchProjects();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= logsPagination.totalPages) {
      fetchAnalytics(newPage);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus proyek "${title}"? Tindakan ini akan menghapus entitas dari MariaDB dan dokumen MongoDB secara atomik.`)) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      setActionMessage({ type: 'success', text: `Proyek "${title}" berhasil dihapus dari MariaDB dan MongoDB.` });
      fetchProjects();
      fetchAnalytics(logsPagination.page);
    } catch (err) {
      console.error('Error deleting project:', err);
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus proyek.' });
    }
  };

  // Edit Project Handler (loads single project with details)
  const handleOpenEdit = async (slug) => {
    try {
      const res = await projectsAPI.getBySlug(slug);
      setEditingProject(res.data?.data || null);
      setIsModalOpen(true);
    } catch (err) {
      alert('Gagal mengambil data proyek untuk diedit: ' + err.message);
    }
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-grid-pattern">
      
      {/* Top Admin Bar */}
      <div className="border-b border-slate-800 bg-[#060a14]/90 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400 font-mono">
                MariaDB + MongoDB Dual-Store Synchronization & Audit Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'telemetry'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              Telemetri & Audit Log
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-emerald-500 text-black shadow-glow-emerald'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Manajemen Proyek ({projects.length})
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Action Alert Banner */}
        {actionMessage.text && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage({ type: '', text: '' })} className="underline text-slate-400 hover:text-white">
              Tutup
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: TELEMETRY & AUDIT ANALYTICS */}
        {/* ============================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass-panel rounded-2xl p-5 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Total Proyek (MariaDB)</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {overview?.totalProjects ?? 0}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  Entitas relasional aktif
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Total Log Akses (MongoDB)</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-cyan-400">
                  {overview?.totalVisits ?? 0}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  Footprint audit tercatat
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Rata-rata Respon</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-amber-400">
                  {overview?.avgResponseTime ?? 0} <span className="text-sm font-normal text-slate-400">ms</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  Min: {overview?.minResponseTime ?? 0}ms • Max: {overview?.maxResponseTime ?? 0}ms
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-5 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Pengunjung Unik</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-400">
                  {overview?.uniqueVisitors ?? 0}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  {overview?.visits24h ?? 0} kunjungan 24 jam terakhir
                </span>
              </div>

            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Trend Chart (2 Cols) */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Tren Kunjungan API & Showcase (14 Hari Terakhir)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Agregasi per hari dari koleksi MongoDB AccessLogs
                    </p>
                  </div>
                  <button
                    onClick={() => fetchAnalytics(logsPagination.page)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        name="Kunjungan"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#cyanGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Paths Bar Chart (1 Col) */}
              <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Endpoint Paling Sering Diakses
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Top 5 path API yang tercatat
                  </p>
                </div>

                <div className="space-y-3">
                  {overview?.topPaths && overview.topPaths.length > 0 ? (
                    overview.topPaths.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300 truncate max-w-[200px]" title={item._id}>
                            {item._id}
                          </span>
                          <span className="text-cyan-400 font-bold">{item.count} hit</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.count / (overview.topPaths[0]?.count || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Belum ada data path tercatat.</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  Support: Cloudflare Tunnel Real-IP Header
                </div>
              </div>

            </div>

            {/* Raw Access Logs Table from MongoDB */}
            <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Log Audit Akses Mentah (MongoDB `access_logs`)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Menampilkan footprint IP pengunjung (mendukung reverse proxy/Cloudflare Tunnel), User-Agent, dan durasi respon.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAnalytics(logsPagination.page)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Logs
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#03060f] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Waktu (UTC/WIB)</th>
                      <th className="py-3 px-4">IP Pengunjung</th>
                      <th className="py-3 px-4">Path Diakses</th>
                      <th className="py-3 px-4">Target Proyek</th>
                      <th className="py-3 px-4">Durasi Respon</th>
                      <th className="py-3 px-4">User-Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#060a14]">
                    {rawLogs.length > 0 ? (
                      rawLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 font-bold text-cyan-400 whitespace-nowrap">
                            {log.ipAddress}
                          </td>
                          <td className="py-3 px-4 text-slate-200 truncate max-w-xs" title={log.path}>
                            {log.path}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.project ? (
                              <span className="text-emerald-400 font-semibold">
                                #{log.targetProjectId} - {log.project.title}
                              </span>
                            ) : log.targetProjectId ? (
                              <span className="text-slate-400">#{log.targetProjectId}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.responseTimeMs < 20 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : log.responseTimeMs < 60
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {log.responseTimeMs} ms
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 truncate max-w-xs" title={log.userAgent}>
                            {log.userAgent}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          Belum ada catatan log audit di MongoDB.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
                <span>
                  Halaman {logsPagination.page} dari {logsPagination.totalPages || 1} ({logsPagination.total} total log)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(logsPagination.page - 1)}
                    disabled={logsPagination.page <= 1}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(logsPagination.page + 1)}
                    disabled={logsPagination.page >= logsPagination.totalPages}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PROJECTS MANAGEMENT (CRUD) */}
        {/* ============================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari proyek..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleOpenCreate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-cyan transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                Tambah Proyek Baru
              </button>
            </div>

            {/* Projects Table */}
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#03060f] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-mono">
                    <tr>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Judul & Slug</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Tech-Stack Tags</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi Atomik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#060a14]">
                    {projects.length > 0 ? (
                      projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            #{proj.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block text-sm">
                              {proj.title}
                            </span>
                            <span className="font-mono text-cyan-400 text-[11px]">
                              /{proj.slug}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                              {proj.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {proj.tags && proj.tags.length > 0 ? (
                                proj.tags.map((t) => (
                                  <span key={t.id || t.name} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/50">
                                    {t.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {proj.featured ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                Featured
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Standard</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/project/${proj.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                title="Lihat Halaman Publik"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleOpenEdit(proj.slug)}
                                className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                                title="Edit Proyek"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id, proj.title)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Hapus Atomik"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400">
                          {projectsLoading ? 'Memuat proyek...' : 'Belum ada proyek terdaftar.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Synchronized Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProject}
        onSuccess={() => {
          fetchProjects();
          fetchAnalytics(logsPagination.page);
          setActionMessage({
            type: 'success',
            text: editingProject 
              ? 'Proyek berhasil diperbarui di MariaDB dan MongoDB.' 
              : 'Proyek baru berhasil dibuat di kedua database secara atomik.',
          });
        }}
      />

    </div>
  );
}
