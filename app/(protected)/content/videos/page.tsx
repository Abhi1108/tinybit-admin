'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Film,
  Search,
  Trash2,
  Edit2,
  Upload,
  X,
  Save,
  Clock,
  Eye,
  CheckSquare,
  Square,
  FolderOpen,
  Loader2,
  AlertCircle,
  Youtube,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  getMoodMedia,
  createMoodMediaTrack,
  updateMoodMediaTrack,
  deleteMoodMediaTrack,
  presignCatalogUpload,
} from '@/src/services/adminApi';

type MoodCategory = 'bhajans' | 'meditation' | 'jokes_fun' | 'nature_sounds';
type MediaType = 'video' | 'youtube';

interface VideoTrack {
  id: string;
  category: MoodCategory;
  media_type: MediaType;
  title: string;
  subtitle: string | null;
  duration_seconds: number | null;
  duration_label: string | null;
  media_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES: { id: MoodCategory; name: string; icon: string; description: string }[] = [
  { id: 'bhajans', name: 'Bhajans', icon: '🙏', description: 'Devotional and spiritual video content' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', description: 'Guided meditation and breathing videos' },
  { id: 'nature_sounds', name: 'Nature Sounds', icon: '🌿', description: 'Nature and ambient video loops' },
  { id: 'jokes_fun', name: 'Jokes & Fun', icon: '😄', description: 'Light entertainment videos' },
];

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  category: 'meditation' as MoodCategory,
  media_type: 'youtube' as MediaType,
  media_url: '',
  duration_label: '',
  duration_seconds: '' as string | number,
  is_active: true,
  sort_order: 0,
};

function categoryMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '🎬', description: '' };
}

function formatDuration(track: VideoTrack) {
  if (track.duration_label) return track.duration_label;
  if (track.duration_seconds == null) return '—';
  const m = Math.floor(track.duration_seconds / 60);
  const s = track.duration_seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoManagementPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'categories'>('videos');
  const [videos, setVideos] = useState<VideoTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCat, setBulkCat] = useState('');
  const [catSearch, setCatSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadVideos() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMoodMedia({
        limit: 100,
        media_type: 'video,youtube',
        search: search.trim() || undefined,
        category: catFilter === 'all' ? undefined : catFilter,
      });
      if (res.success) {
        setVideos((res.tracks || []) as VideoTrack[]);
      } else {
        setError(res.error || 'Failed to load videos');
        setVideos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadVideos, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, catFilter]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (statusFilter === 'published' && !v.is_active) return false;
      if (statusFilter === 'draft' && v.is_active) return false;
      if (typeFilter !== 'all' && v.media_type !== typeFilter) return false;
      return true;
    });
  }, [videos, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: videos.length,
    cats: CATEGORIES.length,
    published: videos.filter((v) => v.is_active).length,
    draft: videos.filter((v) => !v.is_active).length,
    youtube: videos.filter((v) => v.media_type === 'youtube').length,
    recent: [...videos]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 3),
  }), [videos]);

  const filteredCats = useMemo(
    () => CATEGORIES.filter((c) => !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase())),
    [catSearch],
  );

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(v: VideoTrack) {
    setEditingId(v.id);
    setForm({
      title: v.title,
      subtitle: v.subtitle || '',
      category: v.category,
      media_type: v.media_type,
      media_url: v.media_url || '',
      duration_label: v.duration_label || '',
      duration_seconds: v.duration_seconds ?? '',
      is_active: v.is_active,
      sort_order: v.sort_order ?? 0,
    });
    setShowForm(true);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const presign = await presignCatalogUpload(file.name, file.type || 'video/mp4');
      const putRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'video/mp4' },
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload to storage failed');
      setForm((f) => ({ ...f, media_type: 'video', media_url: presign.fileUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.category || !form.media_url.trim()) {
      setError('Title, category, and video URL are required');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      category: form.category,
      media_type: form.media_type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      media_url: form.media_url.trim(),
      audio_url: null,
      duration_label: form.duration_label.trim() || null,
      duration_seconds: form.duration_seconds === '' ? null : Number(form.duration_seconds) || null,
      sort_order: form.sort_order ?? 0,
      is_active: form.is_active,
    };
    try {
      const res = editingId
        ? await updateMoodMediaTrack(editingId, payload)
        : await createMoodMediaTrack(payload);
      if (res.success) {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        await loadVideos();
      } else {
        setError(res.error || 'Failed to save video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save video');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video?')) return;
    try {
      const res = await deleteMoodMediaTrack(id);
      if (res.success) {
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await loadVideos();
      } else {
        setError(res.error || 'Failed to delete video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  }

  async function togglePublish(v: VideoTrack) {
    try {
      const res = await updateMoodMediaTrack(v.id, { is_active: !v.is_active });
      if (res.success) await loadVideos();
      else setError(res.error || 'Failed to update status');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  async function bulkDelete() {
    if (!selected.size || !confirm(`Delete ${selected.size} video(s)?`)) return;
    setSaving(true);
    try {
      await Promise.all(Array.from(selected).map((id) => deleteMoodMediaTrack(id)));
      setSelected(new Set());
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setSaving(false);
    }
  }

  async function bulkUpdateCat() {
    if (!bulkCat || !selected.size) return;
    setSaving(true);
    try {
      await Promise.all(Array.from(selected).map((id) => updateMoodMediaTrack(id, { category: bulkCat })));
      setSelected(new Set());
      setBulkCat('');
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk move failed');
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelected(
      filtered.length === selected.size && selected.size > 0
        ? new Set()
        : new Set(filtered.map((v) => v.id)),
    );
  }

  const formPanel = showForm && (
    <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">{editingId ? 'Edit Video' : 'Add Video'}</h2>
        <button
          type="button"
          onClick={() => { setShowForm(false); setEditingId(null); }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            placeholder="e.g. Morning Yoga for Seniors"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MoodCategory }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subtitle / description</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Brief description"
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Media type <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.media_type}
            onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value as MediaType }))}
          >
            <option value="youtube">YouTube</option>
            <option value="video">Uploaded video (S3)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
          <select
            className="input-field"
            value={form.is_active ? 'published' : 'draft'}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'published' }))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Video URL <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            placeholder={form.media_type === 'youtube' ? 'https://youtube.com/watch?v=... or youtu.be/...' : 'https://... (S3 URL after upload)'}
            value={form.media_url}
            onChange={(e) => setForm((f) => ({ ...f, media_url: e.target.value }))}
          />
          {form.media_type === 'video' && (
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-brand-600 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading…' : 'Upload video file'}
              <input type="file" accept="video/*" className="hidden" disabled={uploading} onChange={handleFileSelected} />
            </label>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration label</label>
          <input
            className="input-field"
            placeholder="e.g. 12:34"
            value={form.duration_label}
            onChange={(e) => setForm((f) => ({ ...f, duration_label: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (seconds)</label>
          <input
            className="input-field"
            type="number"
            min={0}
            placeholder="Optional"
            value={form.duration_seconds}
            onChange={(e) => setForm((f) => ({ ...f, duration_seconds: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || uploading}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editingId ? 'Save Changes' : 'Save Video'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-500" /> Video Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Video &amp; YouTube tracks from mood media (same catalog as Mood Media)
          </p>
        </div>
        {activeTab === 'videos' && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Upload className="w-4 h-4" /> Add Video
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {([
          { label: 'Total Videos', value: loading ? '—' : stats.total, icon: <Film className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Categories', value: stats.cats, icon: <FolderOpen className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Published', value: loading ? '—' : stats.published, icon: <Eye className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Drafts', value: loading ? '—' : stats.draft, icon: <Edit2 className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'YouTube', value: loading ? '—' : stats.youtube, icon: <Youtube className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ] as const).map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['videos', 'categories'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeTab === t
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700',
            )}
          >
            {t === 'videos' ? `Videos (${videos.length})` : `Categories (${CATEGORIES.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {formPanel}

          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="input-field w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select className="input-field w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="youtube">YouTube</option>
                <option value="video">Uploaded</option>
              </select>
              <div className="flex gap-1">
                {(['list', 'grid'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setViewMode(m)}
                    className={cn(
                      'p-2 rounded-lg border transition-colors',
                      viewMode === m
                        ? 'bg-brand-50 border-brand-300 text-brand-600 dark:bg-brand-900/20 dark:border-brand-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400',
                    )}
                  >
                    {m === 'list' ? 'List' : 'Grid'}
                  </button>
                ))}
              </div>
            </div>
            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-brand-600">{selected.size} selected</span>
                <select className="input-field w-auto text-xs py-1" value={bulkCat} onChange={(e) => setBulkCat(e.target.value)}>
                  <option value="">Move to category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" className="btn-secondary text-xs py-1 px-3" onClick={bulkUpdateCat} disabled={!bulkCat || saving}>
                  Apply Move
                </button>
                <button type="button" className="btn-danger text-xs py-1 px-3" onClick={bulkDelete} disabled={saving}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </button>
                <button type="button" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="card py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading videos...
            </div>
          ) : viewMode === 'list' ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 w-8">
                        <button type="button" onClick={selectAll}>
                          {selected.size === filtered.length && filtered.length > 0
                            ? <CheckSquare className="w-4 h-4 text-brand-500" />
                            : <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                      </th>
                      {['Video', 'Category', 'Type', 'Duration', 'Views', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((v) => {
                      const meta = categoryMeta(v.category);
                      return (
                        <tr
                          key={v.id}
                          className={cn(
                            'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors',
                            selected.has(v.id) && 'bg-brand-50/40 dark:bg-brand-900/10',
                          )}
                        >
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => toggleSelect(v.id)}>
                              {selected.has(v.id)
                                ? <CheckSquare className="w-4 h-4 text-brand-500" />
                                : <Square className="w-4 h-4 text-slate-300" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                                {meta.icon}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[220px]">
                                  {v.title}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-[220px]">
                                  {v.subtitle || '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {meta.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={v.media_type === 'youtube' ? 'danger' : 'teal'} size="sm">
                              {v.media_type === 'youtube' ? (
                                <span className="flex items-center gap-1"><Youtube className="w-3 h-3" /> YouTube</span>
                              ) : (
                                <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                              )}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3" />{formatDuration(v)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">—</span>
                          </td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => togglePublish(v)}>
                              <Badge variant={v.is_active ? 'success' : 'default'} size="sm">
                                {v.is_active ? 'Published' : 'Draft'}
                              </Badge>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {v.media_url && (
                                <a
                                  href={v.media_url.startsWith('http') ? v.media_url : `https://www.youtube.com/watch?v=${v.media_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => openEdit(v)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(v.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                          No videos found. Add a YouTube or uploaded video to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Showing {filtered.length} of {videos.length} videos</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((v) => {
                const meta = categoryMeta(v.category);
                return (
                  <div key={v.id} className={cn('card p-4 flex flex-col gap-3 relative', selected.has(v.id) && 'ring-2 ring-brand-400')}>
                    <button type="button" onClick={() => toggleSelect(v.id)} className="absolute top-3 left-3 z-10">
                      {selected.has(v.id)
                        ? <CheckSquare className="w-4 h-4 text-brand-500" />
                        : <Square className="w-4 h-4 text-slate-300 bg-white rounded" />}
                    </button>
                    <div className="w-full h-28 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-5xl">
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{v.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{v.subtitle || '—'}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(v)}</span>
                      <span>—</span>
                      <button type="button" onClick={() => togglePublish(v)}>
                        <Badge variant={v.is_active ? 'success' : 'default'} size="sm">
                          {v.is_active ? 'published' : 'draft'}
                        </Badge>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary flex-1 text-xs py-1.5" onClick={() => openEdit(v)}>
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-slate-400">No videos match your filters</div>
              )}
            </div>
          )}

          <div className="card p-5">
            <p className="section-title mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-teal-500" /> Recently Added
            </p>
            <div className="space-y-3">
              {stats.recent.length === 0 && (
                <p className="text-sm text-slate-400">No videos yet</p>
              )}
              {stats.recent.map((v) => {
                const meta = categoryMeta(v.category);
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{v.title}</p>
                      <p className="text-xs text-slate-400">
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <Badge variant={v.is_active ? 'success' : 'default'} size="sm">
                      {v.is_active ? 'published' : 'draft'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Categories are fixed by the mood media catalog (bhajans, meditation, nature sounds, jokes &amp; fun). Counts below are for video/YouTube tracks only.
          </p>
          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Search categories..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCats.map((cat) => {
              const catVids = videos.filter((v) => v.category === cat.id);
              const published = catVids.filter((v) => v.is_active).length;
              return (
                <div key={cat.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.id}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">active</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{cat.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{catVids.length}</p>
                      <p className="text-[10px] text-slate-400">Total Videos</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{published}</p>
                      <p className="text-[10px] text-slate-400">Published</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
