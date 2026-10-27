import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Database, 
  Layers, 
  FileText, 
  Cpu, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { projectsAPI } from '../services/api';

const categories = ['Web App', 'Network Topology', 'Game Dev', 'System Admin'];

export default function ProjectFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [activeTab, setActiveTab] = useState('sql');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Core fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Web App');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [license, setLicense] = useState('MIT');
  const [featured, setFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Details fields
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

      if (details.systemSpecs && typeof details.systemSpecs === 'object') {
        const specArr = Object.entries(details.systemSpecs).map(([k, v]) => ({ key: k, value: String(v) }));
        setSpecsList(specArr.length > 0 ? specArr : [{ key: '', value: '' }]);
      } else {
        setSpecsList([{ key: '', value: '' }]);
      }

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
        { key: 'Frontend', value: 'React 19, Tailwind CSS' },
        { key: 'Backend', value: 'Express REST API' },
      ]);
      setChangelogList([{ version: 'v1.0.0', notes: 'Initial public release', releaseDate: new Date().toISOString().split('T')[0] }]);
    }
    setError('');
    setActiveTab('sql');
  }, [initialData, isOpen]);

  const addSpecRow = () => setSpecsList([...specsList, { key: '', value: '' }]);
  const removeSpecRow = (idx) => setSpecsList(specsList.filter((_, i) => i !== idx));
  const updateSpecRow = (idx, field, val) => {
    const updated = [...specsList];
    updated[idx][field] = val;
    setSpecsList(updated);
  };

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

    const systemSpecs = {};
    specsList.forEach((s) => {
      if (s.key.trim()) {
        systemSpecs[s.key.trim()] = s.value.trim();
      }
    });

    const changelog = changelogList
      .filter((c) => c.version.trim() && c.notes.trim())
      .map((c) => ({
        version: c.version.trim(),
        notes: c.notes.trim(),
        releaseDate: c.releaseDate ? new Date(c.releaseDate) : new Date(),
      }));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-blue-600 inline-block" />
              {initialData ? 'Edit Proyek' : 'Tambah Proyek Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola entitas portofolio dan dokumentasi teknis studi kasus
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            1. Metadata Inti
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'markdown'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Dokumentasi Studi Kasus
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            3. Spesifikasi & Changelog
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Core Metadata */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Judul Proyek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Praktis - LMS"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Custom Slug (Opsional - otomatis dibuat jika kosong)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="praktis-lab-management"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lisensi
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="MIT, Apache-2.0"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
                    />
                    <span>Tandai sebagai Featured</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    URL Repository GitHub
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    URL Live Demo
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tags Tech-Stack (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React 19, Express.js, Docker, MongoDB"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Markdown Document */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dokumentasi Studi Kasus (Markdown)
                </label>
                <textarea
                  rows={14}
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="# Arsitektur Sistem..."
                  className="w-full p-4 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Specs & Changelog */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL Diagram Arsitektur (Gambar)
                </label>
                <input
                  type="url"
                  value={architectureDiagramUrl}
                  onChange={(e) => setArchitectureDiagramUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic System Specs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-700">
                    Spesifikasi Sistem (Key-Value)
                  </label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {specsList.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Key (misal: Frontend)"
                        value={spec.key}
                        onChange={(e) => updateSpecRow(idx, 'key', e.target.value)}
                        className="w-1/3 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Value (misal: React 19 + Vite)"
                        value={spec.value}
                        onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
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
                  <label className="block text-xs font-medium text-slate-700">
                    Riwayat Rilis / Changelog
                  </label>
                  <button
                    type="button"
                    onClick={addChangelogRow}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Versi
                  </button>
                </div>

                <div className="space-y-3">
                  {changelogList.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Versi (v1.0.0)"
                          value={item.version}
                          onChange={(e) => updateChangelogRow(idx, 'version', e.target.value)}
                          className="w-28 px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-mono"
                        />
                        <input
                          type="date"
                          value={item.releaseDate}
                          onChange={(e) => updateChangelogRow(idx, 'releaseDate', e.target.value)}
                          className="w-36 px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-mono"
                        />
                        <div className="flex-1" />
                        <button
                          type="button"
                          onClick={() => removeChangelogRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Catatan rilis / fitur..."
                        value={item.notes}
                        onChange={(e) => updateChangelogRow(idx, 'notes', e.target.value)}
                        className="w-full px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Dual-Store Synchronized Storage
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : initialData ? 'Perbarui Proyek' : 'Simpan Proyek'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
