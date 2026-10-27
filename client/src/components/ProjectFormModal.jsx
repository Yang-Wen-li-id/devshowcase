import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Database, 
  Layers, 
  FileText, 
  Cpu, 
  GitCommit, 
  Plus, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { projectsAPI } from '../services/api';

const categories = ['Web App', 'Network Topology', 'Game Dev', 'System Admin'];

export default function ProjectFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [activeTab, setActiveTab] = useState('sql'); // 'sql' | 'markdown' | 'specs'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // MariaDB Core fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Web App');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [license, setLicense] = useState('MIT');
  const [featured, setFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // MongoDB Document fields
  const [markdownContent, setMarkdownContent] = useState('');
  const [architectureDiagramUrl, setArchitectureDiagramUrl] = useState('');
  const [specsList, setSpecsList] = useState([{ key: '', value: '' }]);
  const [changelogList, setChangelogList] = useState([{ version: '', notes: '', releaseDate: '' }]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setCategory(initialData.category || 'Web App');
      setRepoUrl(initialData.repo_url || '');
      setDemoUrl(initialData.demo_url || '');
      setLicense(initialData.license || 'MIT');
      setFeatured(!!initialData.featured);
      setTagsInput(initialData.tags ? initialData.tags.map((t) => t.name).join(', ') : '');

      const details = initialData.details || {};
      setMarkdownContent(details.markdownContent || '');
      setArchitectureDiagramUrl(details.architectureDiagramUrl || '');

      // Specs
      if (details.systemSpecs && typeof details.systemSpecs === 'object') {
        const specArr = Object.entries(details.systemSpecs).map(([k, v]) => ({ key: k, value: String(v) }));
        setSpecsList(specArr.length > 0 ? specArr : [{ key: '', value: '' }]);
      } else {
        setSpecsList([{ key: '', value: '' }]);
      }

      // Changelog
      if (Array.isArray(details.changelog) && details.changelog.length > 0) {
        setChangelogList(
          details.changelog.map((c) => ({
            version: c.version || '',
            notes: c.notes || '',
            releaseDate: c.releaseDate ? c.releaseDate.split('T')[0] : '',
          }))
        );
      } else {
        setChangelogList([{ version: '', notes: '', releaseDate: '' }]);
      }
    } else {
      // Reset form for create
      setTitle('');
      setSlug('');
      setCategory('Web App');
      setRepoUrl('');
      setDemoUrl('');
      setLicense('MIT');
      setFeatured(false);
      setTagsInput('');
      setMarkdownContent('# Ringkasan Proyek\n\nTulis dokumentasi teknis arsitektur di sini.');
      setArchitectureDiagramUrl('');
      setSpecsList([
        { key: 'OS', value: 'Ubuntu 24.04 LTS' },
        { key: 'Memory', value: '8GB DDR5' },
      ]);
      setChangelogList([{ version: 'v1.0.0', notes: 'Rilis inisial', releaseDate: new Date().toISOString().split('T')[0] }]);
    }
    setError('');
    setActiveTab('sql');
  }, [initialData, isOpen]);

  // Handle Specs
  const addSpecRow = () => setSpecsList([...specsList, { key: '', value: '' }]);
  const removeSpecRow = (idx) => setSpecsList(specsList.filter((_, i) => i !== idx));
  const updateSpecRow = (idx, field, val) => {
    const updated = [...specsList];
    updated[idx][field] = val;
    setSpecsList(updated);
  };

  // Handle Changelog
  const addChangelogRow = () => setChangelogList([...changelogList, { version: '', notes: '', releaseDate: '' }]);
  const removeChangelogRow = (idx) => setChangelogList(changelogList.filter((_, i) => i !== idx));
  const updateChangelogRow = (idx, field, val) => {
    const updated = [...changelogList];
    updated[idx][field] = val;
    setChangelogList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul Proyek wajib diisi.');
      setActiveTab('sql');
      return;
    }

    // Convert specs array to object
    const systemSpecs = {};
    specsList.forEach((s) => {
      if (s.key.trim()) {
        systemSpecs[s.key.trim()] = s.value.trim();
      }
    });

    // Clean changelog
    const changelog = changelogList
      .filter((c) => c.version.trim() && c.notes.trim())
      .map((c) => ({
        version: c.version.trim(),
        notes: c.notes.trim(),
        releaseDate: c.releaseDate ? new Date(c.releaseDate) : new Date(),
      }));

    // Parse tags
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category,
      repo_url: repoUrl.trim() || null,
      demo_url: demoUrl.trim() || null,
      license: license.trim() || 'MIT',
      featured,
      tags,
      markdownContent,
      architectureDiagramUrl: architectureDiagramUrl.trim(),
      systemSpecs,
      changelog,
    };

    setLoading(true);
    try {
      if (initialData?.id) {
        await projectsAPI.update(initialData.id, payload);
      } else {
        await projectsAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submit project error:', err);
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan proyek.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-cyan-500 inline-block" />
              {initialData ? 'Edit Proyek (Dual-Store Sync)' : 'Tambah Proyek Baru (MariaDB + MongoDB)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data relasional disimpan ke MariaDB, dokumen teknis & spesifikasi disimpan ke MongoDB.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#060a14] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            1. Entitas Inti (MariaDB SQL)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'markdown'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Studi Kasus (MongoDB Doc)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            3. Spek & Changelog (MongoDB)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: MariaDB SQL Core */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Judul Proyek <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Enterprise Multi-Site SD-WAN"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Slug (Opsional - otomatis dibuat jika kosong)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="enterprise-multisite-sdwan"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lisensi
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="MIT, Apache-2.0, GPL-3.0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Tandai sebagai Featured</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL Repository GitHub
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL Live Demo / Tunnel
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.devshowcase.local"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags Tech-Stack (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React, WireGuard, Node.js, Docker, Linux"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tag akan otomatis disimpan ke tabel MariaDB <code className="text-cyan-400">tags</code> dan dipetakan di tabel pivot <code className="text-cyan-400">project_tags</code>.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: MongoDB Markdown Document */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Dokumentasi Studi Kasus / Whitepaper (Markdown)
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Mendukung syntax highlight, headers, diagram ASCII
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="# Arsitektur Sistem..."
                  className="w-full p-4 rounded-lg bg-[#02050e] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MongoDB Specs & Changelog */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL Diagram Arsitektur (Gambar)
                </label>
                <input
                  type="url"
                  value={architectureDiagramUrl}
                  onChange={(e) => setArchitectureDiagramUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Dynamic System Specs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Spesifikasi Sistem & Hardware (Key-Value Dinamis)
                  </label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Spesifikasi
                  </button>
                </div>

                <div className="space-y-2">
                  {specsList.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Key (misal: Routing Engine)"
                        value={spec.key}
                        onChange={(e) => updateSpecRow(idx, 'key', e.target.value)}
                        className="w-1/3 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Value (misal: BGP + WireGuard Mesh)"
                        value={spec.value}
                        onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Changelog */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Riwayat Rilis / Changelog
                  </label>
                  <button
                    type="button"
                    onClick={addChangelogRow}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Versi
                  </button>
                </div>

                <div className="space-y-3">
                  {changelogList.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Versi (v1.0.0)"
                          value={item.version}
                          onChange={(e) => updateChangelogRow(idx, 'version', e.target.value)}
                          className="w-28 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                        />
                        <input
                          type="date"
                          value={item.releaseDate}
                          onChange={(e) => updateChangelogRow(idx, 'releaseDate', e.target.value)}
                          className="w-36 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                        />
                        <div className="flex-1" />
                        <button
                          type="button"
                          onClick={() => removeChangelogRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Catatan rilis / fitur..."
                        value={item.notes}
                        onChange={(e) => updateChangelogRow(idx, 'notes', e.target.value)}
                        className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              MariaDB Transaction + MongoDB Upsert
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-cyan transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyinkronkan...' : initialData ? 'Perbarui Proyek' : 'Simpan ke Dual-Database'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
