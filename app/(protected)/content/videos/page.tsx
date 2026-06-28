'use client';
import React, { useState, useMemo } from 'react';
import {
  Film, Plus, Search, Trash2, Edit2, Star, Upload, X, Save,
  Tag, Clock, Eye, CheckSquare, Square, FolderOpen, BarChart2,
  ToggleLeft, ToggleRight, Grid3X3, List,
} from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

/* ─── Types ─────────────────────────────────────────────── */
type VideoStatus = 'published' | 'draft';
type CatStatus = 'active' | 'inactive';

interface VideoCategory {
  id: string; name: string; description: string; icon: string;
  videoCount: number; status: CatStatus; createdAt: string;
}
interface VideoItem {
  id: string; title: string; description: string;
  categoryId: string; category: string; tags: string[];
  duration: string; status: VideoStatus; featured: boolean;
  emoji: string; views: number; uploadedAt: string;
}

/* ─── Mock Data ─────────────────────────────────────────── */
const INIT_CATS: VideoCategory[] = [
  { id: 'c001', name: 'Wellness', description: 'Mind and body wellness content', icon: '🧘', videoCount: 3, status: 'active', createdAt: '2026-01-10' },
  { id: 'c002', name: 'Breathing Exercises', description: 'Guided breathing techniques for relaxation', icon: '🌬️', videoCount: 2, status: 'active', createdAt: '2026-01-15' },
  { id: 'c003', name: 'Tutorials', description: 'App how-to guides and feature walkthroughs', icon: '📱', videoCount: 2, status: 'active', createdAt: '2026-02-01' },
  { id: 'c004', name: 'Healthcare', description: 'Medical information and senior health advice', icon: '🏥', videoCount: 2, status: 'active', createdAt: '2026-02-10' },
  { id: 'c005', name: 'Memory Games', description: 'Cognitive exercises to improve memory', icon: '🧩', videoCount: 1, status: 'inactive', createdAt: '2026-03-01' },
  { id: 'c006', name: 'Morning Routines', description: 'Daily morning activity guides for seniors', icon: '🌅', videoCount: 1, status: 'active', createdAt: '2026-03-15' },
];
const INIT_VIDEOS: VideoItem[] = [
  { id: 'v001', title: 'Morning Yoga for Seniors', description: 'Gentle 12-min yoga routine focusing on flexibility and balance.', categoryId: 'c001', category: 'Wellness', tags: ['yoga', 'morning', 'flexibility'], duration: '12:34', status: 'published', featured: true, emoji: '🧘', views: 3842, uploadedAt: '2026-05-20' },
  { id: 'v002', title: '4-7-8 Breathing Technique', description: 'Calming breathing exercise to reduce anxiety and improve sleep.', categoryId: 'c002', category: 'Breathing Exercises', tags: ['breathing', 'anxiety', 'sleep'], duration: '8:15', status: 'published', featured: true, emoji: '🌬️', views: 2917, uploadedAt: '2026-05-18' },
  { id: 'v003', title: 'How to Use Daily Check-In', description: 'Step-by-step tutorial on the daily check-in feature.', categoryId: 'c003', category: 'Tutorials', tags: ['tutorial', 'check-in', 'guide'], duration: '5:02', status: 'published', featured: false, emoji: '📱', views: 1456, uploadedAt: '2026-05-15' },
  { id: 'v004', title: 'Understanding Blood Pressure', description: 'Comprehensive guide to monitoring blood pressure for seniors.', categoryId: 'c004', category: 'Healthcare', tags: ['health', 'blood pressure'], duration: '15:30', status: 'published', featured: false, emoji: '🏥', views: 4201, uploadedAt: '2026-05-12' },
  { id: 'v005', title: 'Memory Training: Number Sequences', description: 'Cognitive exercise using number sequences to improve short-term memory.', categoryId: 'c005', category: 'Memory Games', tags: ['memory', 'cognitive', 'games'], duration: '10:00', status: 'draft', featured: false, emoji: '🧩', views: 0, uploadedAt: '2026-05-28' },
  { id: 'v006', title: 'Sunrise Stretching Routine', description: 'Gentle 8-min full-body stretch to start the day with energy.', categoryId: 'c006', category: 'Morning Routines', tags: ['stretch', 'morning', 'routine'], duration: '8:00', status: 'published', featured: false, emoji: '🌅', views: 2103, uploadedAt: '2026-05-10' },
  { id: 'v007', title: 'Diaphragmatic Breathing', description: 'Deep belly breathing for stress relief and improved lung capacity.', categoryId: 'c002', category: 'Breathing Exercises', tags: ['breathing', 'stress', 'lung'], duration: '6:45', status: 'published', featured: false, emoji: '🌬️', views: 1834, uploadedAt: '2026-05-08' },
  { id: 'v008', title: 'Chair Yoga: Upper Body', description: 'Seated yoga routine targeting upper body mobility.', categoryId: 'c001', category: 'Wellness', tags: ['yoga', 'chair', 'mobility'], duration: '11:20', status: 'draft', featured: false, emoji: '🧘', views: 0, uploadedAt: '2026-06-01' },
  { id: 'v009', title: 'Setting Up Family Circle', description: 'How to invite family members and set up your care network.', categoryId: 'c003', category: 'Tutorials', tags: ['tutorial', 'family', 'setup'], duration: '4:30', status: 'published', featured: false, emoji: '📱', views: 987, uploadedAt: '2026-04-22' },
  { id: 'v010', title: 'Diabetes Management Basics', description: 'Essential tips for managing blood sugar and a healthy lifestyle.', categoryId: 'c004', category: 'Healthcare', tags: ['diabetes', 'health', 'management'], duration: '18:10', status: 'published', featured: true, emoji: '🏥', views: 3654, uploadedAt: '2026-04-15' },
  { id: 'v011', title: 'Balance Improvement Exercises', description: 'Targeted exercises to improve balance and prevent falls.', categoryId: 'c001', category: 'Wellness', tags: ['balance', 'safety', 'exercise'], duration: '14:00', status: 'published', featured: false, emoji: '🧘', views: 2210, uploadedAt: '2026-04-10' },
];

const EMPTY_UPLOAD = { title: '', description: '', categoryId: '', tags: '', duration: '', status: 'draft' as VideoStatus, featured: false, url: '' };
const EMPTY_CAT = { name: '', description: '', icon: '🎬', status: 'active' as CatStatus };
const CAT_ICONS = ['🎬', '🧘', '🌬️', '📱', '🏥', '🧩', '🌅', '💊', '🏃', '🧠', '❤️', '🌿'];

/* ─── Page ──────────────────────────────────────────────── */
export default function VideoManagementPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'categories'>('videos');
  const [videos, setVideos] = useState(INIT_VIDEOS);
  const [categories, setCategories] = useState(INIT_CATS);

  // Video state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [editVideo, setEditVideo] = useState<VideoItem | null>(null);
  const [upload, setUpload] = useState(EMPTY_UPLOAD);
  const [bulkCat, setBulkCat] = useState('');

  // Category state
  const [showCreateCat, setShowCreateCat] = useState(false);
  const [editCat, setEditCat] = useState<VideoCategory | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [newCat, setNewCat] = useState(EMPTY_CAT);

  const filtered = useMemo(() => videos.filter(v => {
    const q = search.toLowerCase();
    return (!q || v.title.toLowerCase().includes(q) || v.tags.some(t => t.includes(q)))
      && (catFilter === 'all' || v.categoryId === catFilter)
      && (statusFilter === 'all' || v.status === statusFilter);
  }), [videos, search, catFilter, statusFilter]);

  const filteredCats = useMemo(() =>
    categories.filter(c => !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]);

  const stats = useMemo(() => ({
    total: videos.length,
    cats: categories.filter(c => c.status === 'active').length,
    published: videos.filter(v => v.status === 'published').length,
    draft: videos.filter(v => v.status === 'draft').length,
    featured: videos.filter(v => v.featured).length,
    topViewed: [...videos].sort((a, b) => b.views - a.views).slice(0, 3),
    recent: [...videos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 3),
  }), [videos, categories]);

  /* Video actions */
  function toggleSelect(id: string) { setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function selectAll() { setSelected(filtered.length === selected.size && selected.size > 0 ? new Set() : new Set(filtered.map(v => v.id))); }
  function bulkDelete() { setVideos(v => v.filter(x => !selected.has(x.id))); setSelected(new Set()); }
  function bulkUpdateCat() {
    const cat = categories.find(c => c.id === bulkCat);
    if (!cat) return;
    setVideos(v => v.map(x => selected.has(x.id) ? { ...x, categoryId: bulkCat, category: cat.name, emoji: cat.icon } : x));
    setSelected(new Set()); setBulkCat('');
  }
  function togglePublish(id: string) { setVideos(v => v.map(x => x.id === id ? { ...x, status: x.status === 'published' ? 'draft' : 'published' } : x)); }
  function toggleFeatured(id: string) { setVideos(v => v.map(x => x.id === id ? { ...x, featured: !x.featured } : x)); }
  function deleteVideo(id: string) { setVideos(v => v.filter(x => x.id !== id)); }
  function handleUpload() {
    if (!upload.title || !upload.categoryId) return;
    const cat = categories.find(c => c.id === upload.categoryId);
    setVideos(p => [{ id: `v${Date.now()}`, title: upload.title, description: upload.description, categoryId: upload.categoryId, category: cat?.name ?? '', tags: upload.tags.split(',').map(t => t.trim()).filter(Boolean), duration: upload.duration || '0:00', status: upload.status, featured: upload.featured, emoji: cat?.icon ?? '🎬', views: 0, uploadedAt: new Date().toISOString().slice(0, 10) }, ...p]);
    setUpload(EMPTY_UPLOAD); setShowUpload(false);
  }
  function handleEditSave() {
    if (!editVideo) return;
    setVideos(v => v.map(x => x.id === editVideo.id ? editVideo : x));
    setEditVideo(null);
  }

  /* Category actions */
  function handleCreateCat() {
    if (!newCat.name.trim()) return;
    setCategories(p => [...p, { id: `c${Date.now()}`, name: newCat.name, description: newCat.description, icon: newCat.icon, videoCount: 0, status: newCat.status, createdAt: new Date().toISOString().slice(0, 10) }]);
    setNewCat(EMPTY_CAT); setShowCreateCat(false);
  }
  function handleSaveCat() { if (!editCat) return; setCategories(p => p.map(c => c.id === editCat.id ? editCat : c)); setEditCat(null); }
  function toggleCatStatus(id: string) { setCategories(p => p.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c)); }
  function deleteCat(id: string) { setCategories(p => p.filter(c => c.id !== id)); }

  /* ── Upload / Edit panel ── */
  const uploadPanel = (showUpload || editVideo) && (
    <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">{editVideo ? 'Edit Video' : 'Upload New Video'}</h2>
        <button onClick={() => { setShowUpload(false); setEditVideo(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Video Title <span className="text-red-500">*</span></label>
          <input className="input-field" placeholder="e.g. Morning Yoga for Seniors"
            value={editVideo ? editVideo.title : upload.title}
            onChange={e => editVideo ? setEditVideo({ ...editVideo, title: e.target.value }) : setUpload(u => ({ ...u, title: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-red-500">*</span></label>
          <select className="input-field"
            value={editVideo ? editVideo.categoryId : upload.categoryId}
            onChange={e => { const cat = categories.find(c => c.id === e.target.value); editVideo ? setEditVideo({ ...editVideo, categoryId: e.target.value, category: cat?.name ?? '', emoji: cat?.icon ?? '' }) : setUpload(u => ({ ...u, categoryId: e.target.value })); }}>
            <option value="">Select category...</option>
            {categories.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Brief description of the video content"
            value={editVideo ? editVideo.description : upload.description}
            onChange={e => editVideo ? setEditVideo({ ...editVideo, description: e.target.value }) : setUpload(u => ({ ...u, description: e.target.value }))} />
        </div>
        {!editVideo && (
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Video URL (optional)</label>
            <input className="input-field" placeholder="https://youtube.com/... or leave blank to upload file" value={upload.url} onChange={e => setUpload(u => ({ ...u, url: e.target.value }))} />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags <span className="text-slate-400">(comma-separated)</span></label>
          <input className="input-field" placeholder="yoga, wellness, seniors"
            value={editVideo ? editVideo.tags.join(', ') : upload.tags}
            onChange={e => editVideo ? setEditVideo({ ...editVideo, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }) : setUpload(u => ({ ...u, tags: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration</label>
          <input className="input-field" placeholder="e.g. 12:34"
            value={editVideo ? editVideo.duration : upload.duration}
            onChange={e => editVideo ? setEditVideo({ ...editVideo, duration: e.target.value }) : setUpload(u => ({ ...u, duration: e.target.value }))} />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select className="input-field w-auto"
              value={editVideo ? editVideo.status : upload.status}
              onChange={e => { const v = e.target.value as VideoStatus; editVideo ? setEditVideo({ ...editVideo, status: v }) : setUpload(u => ({ ...u, status: v })); }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <input type="checkbox"
              checked={editVideo ? editVideo.featured : upload.featured}
              onChange={e => editVideo ? setEditVideo({ ...editVideo, featured: e.target.checked }) : setUpload(u => ({ ...u, featured: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 accent-yellow-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Featured</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-secondary" onClick={() => { setShowUpload(false); setEditVideo(null); }}>Cancel</button>
        <button className="btn-primary" onClick={editVideo ? handleEditSave : handleUpload}>
          <Save className="w-4 h-4" />{editVideo ? 'Save Changes' : 'Upload Video'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Film className="w-6 h-6 text-brand-500" /> Video Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage educational, wellness, and healthcare videos</p>
        </div>
        {activeTab === 'videos'
          ? <button className="btn-primary" onClick={() => { setShowUpload(true); setEditVideo(null); }}><Upload className="w-4 h-4" /> Upload Video</button>
          : <button className="btn-primary" onClick={() => setShowCreateCat(true)}><Plus className="w-4 h-4" /> New Category</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {([
          { label: 'Total Videos', value: stats.total, icon: <Film className="w-4 h-4" />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Active Categories', value: stats.cats, icon: <FolderOpen className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Published', value: stats.published, icon: <Eye className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Drafts', value: stats.draft, icon: <Edit2 className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Featured', value: stats.featured, icon: <Star className="w-4 h-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ] as const).map(s => (
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

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['videos', 'categories'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeTab === t ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700')}>
            {t === 'videos' ? `Videos (${videos.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {uploadPanel}

          {/* Filter bar */}
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-field pl-9" placeholder="Search videos, tags..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input-field w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div className="flex gap-1">
                {(['list', 'grid'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)} className={cn('p-2 rounded-lg border transition-colors', viewMode === m ? 'bg-brand-50 border-brand-300 text-brand-600 dark:bg-brand-900/20 dark:border-brand-700' : 'border-slate-200 dark:border-slate-700 text-slate-400')}>
                    {m === 'list' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-brand-600">{selected.size} selected</span>
                <select className="input-field w-auto text-xs py-1" value={bulkCat} onChange={e => setBulkCat(e.target.value)}>
                  <option value="">Move to category...</option>
                  {categories.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="btn-secondary text-xs py-1 px-3" onClick={bulkUpdateCat} disabled={!bulkCat}>Apply Move</button>
                <button className="btn-danger text-xs py-1 px-3" onClick={bulkDelete}><Trash2 className="w-3.5 h-3.5" /> Delete Selected</button>
                <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setSelected(new Set())}>Clear</button>
              </div>
            )}
          </div>

          {/* List view */}
          {viewMode === 'list' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 w-8">
                        <button onClick={selectAll}>{selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4 text-slate-400" />}</button>
                      </th>
                      {['Video', 'Category', 'Tags', 'Duration', 'Views', 'Status', 'Featured', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map(v => (
                      <tr key={v.id} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors', selected.has(v.id) && 'bg-brand-50/40 dark:bg-brand-900/10')}>
                        <td className="px-4 py-3"><button onClick={() => toggleSelect(v.id)}>{selected.has(v.id) ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4 text-slate-300" />}</button></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">{v.emoji}</div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 min-w-0 max-w-[200px]">{v.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-[200px]">{v.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.category}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {v.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{t}</span>)}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3" />{v.duration}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap"><Eye className="w-3 h-3" />{v.views.toLocaleString()}</span></td>
                        <td className="px-4 py-3">
                          <button onClick={() => togglePublish(v.id)}>
                            <Badge variant={v.status === 'published' ? 'success' : 'default'} size="sm">{v.status === 'published' ? 'Published' : 'Draft'}</Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFeatured(v.id)} className={cn('transition-colors', v.featured ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400')}>
                            <Star className="w-4 h-4" fill={v.featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditVideo(v); setShowUpload(false); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteVideo(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No videos match your filters</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">Showing {filtered.length} of {videos.length} videos</p>
              </div>
            </div>
          )}

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(v => (
                <div key={v.id} className={cn('card p-4 flex flex-col gap-3 relative', selected.has(v.id) && 'ring-2 ring-brand-400')}>
                  <button onClick={() => toggleSelect(v.id)} className="absolute top-3 left-3 z-10">
                    {selected.has(v.id) ? <CheckSquare className="w-4 h-4 text-brand-500" /> : <Square className="w-4 h-4 text-slate-300 bg-white rounded" />}
                  </button>
                  <div className="w-full h-28 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-5xl">{v.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 flex-1">{v.title}</p>
                      <button onClick={() => toggleFeatured(v.id)} className={cn('flex-shrink-0 mt-0.5', v.featured ? 'text-yellow-500' : 'text-slate-300')}><Star className="w-4 h-4" fill={v.featured ? 'currentColor' : 'none'} /></button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{v.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{v.duration}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views.toLocaleString()}</span>
                    <button onClick={() => togglePublish(v.id)}><Badge variant={v.status === 'published' ? 'success' : 'default'} size="sm">{v.status}</Badge></button>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 text-xs py-1.5" onClick={() => { setEditVideo(v); setShowUpload(false); }}><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                    <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={() => deleteVideo(v.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="col-span-full py-12 text-center text-sm text-slate-400">No videos match your filters</div>}
            </div>
          )}

          {/* Most Viewed + Recently Added */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="section-title mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-brand-500" /> Most Viewed</p>
              <div className="space-y-3">
                {stats.topViewed.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-700 w-7 text-center leading-none">{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">{v.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{v.title}</p>
                      <p className="text-xs text-slate-400">{v.views.toLocaleString()} views</p>
                    </div>
                    <Badge variant="default" size="sm">{v.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <p className="section-title mb-4 flex items-center gap-2"><Film className="w-4 h-4 text-teal-500" /> Recently Added</p>
              <div className="space-y-3">
                {stats.recent.map(v => (
                  <div key={v.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">{v.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{v.title}</p>
                      <p className="text-xs text-slate-400">{v.uploadedAt}</p>
                    </div>
                    <Badge variant={v.status === 'published' ? 'success' : 'default'} size="sm">{v.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Create/Edit panel */}
          {(showCreateCat || editCat) && (
            <div className="card p-6 border-2 border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">{editCat ? `Edit: ${editCat.name}` : 'New Category'}</h2>
                <button onClick={() => { setShowCreateCat(false); setEditCat(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category Name <span className="text-red-500">*</span></label>
                  <input className="input-field" placeholder="e.g. Wellness"
                    value={editCat ? editCat.name : newCat.name}
                    onChange={e => editCat ? setEditCat({ ...editCat, name: e.target.value }) : setNewCat(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {CAT_ICONS.map(ic => (
                      <button key={ic} onClick={() => editCat ? setEditCat({ ...editCat, icon: ic }) : setNewCat(c => ({ ...c, icon: ic }))}
                        className={cn('text-xl w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all',
                          (editCat ? editCat.icon : newCat.icon) === ic ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        )}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <input className="input-field" placeholder="Brief description of this category"
                    value={editCat ? editCat.description : newCat.description}
                    onChange={e => editCat ? setEditCat({ ...editCat, description: e.target.value }) : setNewCat(c => ({ ...c, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select className="input-field w-auto"
                    value={editCat ? editCat.status : newCat.status}
                    onChange={e => { const v = e.target.value as CatStatus; editCat ? setEditCat({ ...editCat, status: v }) : setNewCat(c => ({ ...c, status: v })); }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button className="btn-secondary" onClick={() => { setShowCreateCat(false); setEditCat(null); }}>Cancel</button>
                <button className="btn-primary" onClick={editCat ? handleSaveCat : handleCreateCat}><Save className="w-4 h-4" />{editCat ? 'Save Changes' : 'Create Category'}</button>
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search categories..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCats.map(cat => {
              const catVids = videos.filter(v => v.categoryId === cat.id);
              const published = catVids.filter(v => v.status === 'published').length;
              return (
                <div key={cat.id} className={cn('card p-5', cat.status === 'inactive' && 'opacity-60')}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl">{cat.icon}</div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Since {cat.createdAt}</p>
                      </div>
                    </div>
                    <Badge variant={cat.status === 'active' ? 'success' : 'default'} size="sm">{cat.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{cat.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{catVids.length}</p>
                      <p className="text-[10px] text-slate-400">Total Videos</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{published}</p>
                      <p className="text-[10px] text-slate-400">Published</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 text-xs py-1.5" onClick={() => { setEditCat(cat); setShowCreateCat(false); }}><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                    <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => toggleCatStatus(cat.id)}>
                      {cat.status === 'active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                    </button>
                    {catVids.length === 0 && (
                      <button className="btn-secondary text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 border-red-200" onClick={() => deleteCat(cat.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
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
