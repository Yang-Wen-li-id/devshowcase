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
  TrendingUp,
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
    if (!window.confirm(`Yakin ingin menghapus proyek "${title}"? Data akan dihapus secara permanen.`)) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      setActionMessage({ type: 'success', text: `Proyek "${title}" berhasil dihapus.` });
      fetchProjects();
      fetchAnalytics(logsPagination.page);
    } catch (err) {
      console.error('Error deleting project:', err);
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus proyek.' });
    }
  };

  // Edit Project Handler
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
    <div className="min-h-screen pb-20 bg-subtle-pattern">
      
      {/* Top Admin Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">
                Manajemen Katalog Proyek & Telemetri Akses Kunjungan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'telemetry'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              Telemetri & Audit
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Kelola Proyek ({projects.length})
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Action Alert Banner */}
        {actionMessage.text && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage({ type: '', text: '' })} className="underline text-slate-500 hover:text-slate-800">
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
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">Total Proyek</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {overview?.totalProjects ?? 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Katalog proyek terdaftar
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">Total Kunjungan</span>
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-600">
                  {overview?.totalVisits ?? 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Footprint akses tercatat
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">Waktu Respon Rata-rata</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-extrabold text-amber-600">
                  {overview?.avgResponseTime ?? 0} <span className="text-sm font-normal text-slate-500">ms</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Min: {overview?.minResponseTime ?? 0}ms • Max: {overview?.maxResponseTime ?? 0}ms
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">Pengunjung Unik</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {overview?.uniqueVisitors ?? 0}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {overview?.visits24h ?? 0} kunjungan 24 jam terakhir
                </span>
              </div>

            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Trend Chart (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Tren Kunjungan Harian (14 Hari Terakhir)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Volume kunjungan halaman proyek dan API
                    </p>
                  </div>
                  <button
                    onClick={() => fetchAnalytics(logsPagination.page)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        name="Kunjungan"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#blueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Paths (1 Col) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Endpoint Populer
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Top path yang paling sering diakses
                  </p>
                </div>

                <div className="space-y-3">
                  {overview?.topPaths && overview.topPaths.length > 0 ? (
                    overview.topPaths.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-700 truncate max-w-[200px]" title={item._id}>
                            {item._id}
                          </span>
                          <span className="text-blue-600 font-bold">{item.count} hit</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
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

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                  Real-time visitor telemetry active
                </div>
              </div>

            </div>

            {/* Raw Access Logs Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Log Audit Akses Pengunjung
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rekaman jejak IP pengunjung, durasi respon, dan halaman yang diakses
                  </p>
                </div>

                <button
                  onClick={() => fetchAnalytics(logsPagination.page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">IP Pengunjung</th>
                      <th className="py-3 px-4">Path Diakses</th>
                      <th className="py-3 px-4">Target Proyek</th>
                      <th className="py-3 px-4">Durasi Respon</th>
                      <th className="py-3 px-4">User-Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rawLogs.length > 0 ? (
                      rawLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                            {log.ipAddress}
                          </td>
                          <td className="py-3 px-4 text-slate-800 truncate max-w-xs" title={log.path}>
                            {log.path}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.project ? (
                              <span className="text-emerald-700 font-semibold">
                                #{log.targetProjectId} - {log.project.title}
                              </span>
                            ) : log.targetProjectId ? (
                              <span className="text-slate-500">#{log.targetProjectId}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.responseTimeMs < 20 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.responseTimeMs < 60
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {log.responseTimeMs} ms
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 truncate max-w-xs" title={log.userAgent}>
                            {log.userAgent}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          Belum ada catatan log audit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2">
                <span>
                  Halaman {logsPagination.page} dari {logsPagination.totalPages || 1} ({logsPagination.total} total log)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(logsPagination.page - 1)}
                    disabled={logsPagination.page <= 1}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(logsPagination.page + 1)}
                    disabled={logsPagination.page >= logsPagination.totalPages}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40"
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleOpenCreate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                Tambah Proyek Baru
              </button>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-mono">
                    <tr>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Judul & Slug</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Tech-Stack Tags</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {projects.length > 0 ? (
                      projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            #{proj.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-sm">
                              {proj.title}
                            </span>
                            <span className="font-mono text-blue-600 text-[11px]">
                              /{proj.slug}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {proj.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {proj.tags && proj.tags.length > 0 ? (
                                proj.tags.map((t) => (
                                  <span key={t.id || t.name} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
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
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Featured
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Standard</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/project/${proj.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-blue-600"
                                title="Lihat Halaman Publik"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleOpenEdit(proj.slug)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                title="Edit Proyek"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id, proj.title)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                title="Hapus Proyek"
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
              ? 'Proyek berhasil diperbarui.' 
              : 'Proyek baru berhasil disimpan.',
          });
        }}
      />

    </div>
  );
}
