'use client';
import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, Loader2, AlertCircle, Search } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  getHelpTutorials,
  createHelpTutorial,
  updateHelpTutorial,
  deleteHelpTutorial,
  type HelpTutorial,
} from '@/src/services/adminApi';

const CATEGORIES = [
  'getting_started',
  'health_tracking',
  'medicine_management',
  'talking_with_sathi',
  'emergency_features',
  'family_features',
];

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<HelpTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HelpTutorial | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'getting_started',
    difficulty: 'beginner',
    video_url: '',
    thumbnail_url: '',
    duration_seconds: 0,
    sort_order: 0,
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHelpTutorials({
        limit: 100,
        category: category === 'all' ? undefined : category,
        search: search.trim() || undefined,
      });
      if (res.success) setTutorials(res.tutorials || []);
      else setError(res.error || 'Failed to load tutorials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [category, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: 'getting_started',
      difficulty: 'beginner',
      video_url: '',
      thumbnail_url: '',
      duration_seconds: 60,
      sort_order: 0,
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (t: HelpTutorial) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || '',
      category: t.category,
      difficulty: t.difficulty,
      video_url: t.video_url || '',
      thumbnail_url: t.thumbnail_url || '',
      duration_seconds: t.duration_seconds || 0,
      sort_order: t.sort_order,
      is_active: t.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        description: form.description || null,
        duration_seconds: form.duration_seconds || null,
      };
      const res = editing
        ? await updateHelpTutorial(editing.id, payload)
        : await createHelpTutorial(payload);
      if (res.success) {
        setShowForm(false);
        await load();
      } else setError(res.error || 'Failed to save tutorial');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tutorial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tutorial?')) return;
    const res = await deleteHelpTutorial(id);
    if (res.success) await load();
    else setError(res.error || 'Failed to delete');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><HelpCircle className="w-6 h-6 text-brand-500" /> Tutorials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Help center tutorial catalog</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Add Tutorial</button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />{error}
        </div>
      )}

      {showForm && (
        <div className="card p-6 border-2 border-brand-200 space-y-3">
          <h2 className="section-title">{editing ? 'Edit Tutorial' : 'New Tutorial'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <input type="number" className="input-field" placeholder="Duration seconds" value={form.duration_seconds} onChange={e => setForm({ ...form, duration_seconds: Number(e.target.value) })} />
            <input className="input-field md:col-span-2" placeholder="Video URL (https)" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />
            <input className="input-field md:col-span-2" placeholder="Thumbnail URL (https)" value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
            <textarea className="input-field md:col-span-2 h-20" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setCategory('all')} className={cn('px-3 py-1.5 rounded-full text-sm border', category === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={cn('px-3 py-1.5 rounded-full text-sm border', category === c ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200')}>{c.replace(/_/g, ' ')}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input className="bg-transparent text-sm outline-none w-40" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center gap-2 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tutorials.map(t => (
              <div key={t.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{t.title}</p>
                    <Badge variant={t.is_active ? 'success' : 'default'} size="sm">{t.is_active ? 'active' : 'inactive'}</Badge>
                    <Badge variant="info" size="sm">{t.category}</Badge>
                    <Badge variant="default" size="sm">{t.difficulty}</Badge>
                  </div>
                  {t.description && <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>}
                  {t.duration_seconds != null && <p className="text-[11px] text-slate-400 mt-1">{t.duration_seconds}s</p>}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-100 rounded" onClick={() => openEdit(t)}><Edit2 className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-2 hover:bg-red-50 rounded" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            ))}
            {tutorials.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No tutorials found</div>}
          </div>
        )}
      </div>
    </div>
  );
}
