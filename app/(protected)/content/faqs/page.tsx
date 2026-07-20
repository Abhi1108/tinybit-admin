'use client';
import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';
import {
  getHelpFaqs,
  createHelpFaq,
  updateHelpFaq,
  deleteHelpFaq,
  type HelpFaq,
} from '@/src/services/adminApi';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'published' | 'draft';
  order: number;
}

function mapFaq(f: HelpFaq): FAQ {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: 'General',
    status: f.is_active ? 'published' : 'draft',
    order: f.sort_order,
  };
}

const statusFilters = ['All', 'published', 'draft'] as const;

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All');
  const [compose, setCompose] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHelpFaqs({ limit: 100 });
      if (res.success) {
        setFaqs((res.faqs || []).map(mapFaq));
      } else {
        setError(res.error || 'Failed to load FAQs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const filtered = faqs.filter(f => statusFilter === 'All' || f.status === statusFilter);

  const resetForm = () => {
    setCompose(false);
    setEditingId(null);
    setQuestion('');
    setAnswer('');
  };

  const openCreate = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setCompose(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCompose(true);
  };

  const handleSave = async (asDraft: boolean) => {
    if (!question.trim() || !answer.trim()) {
      setError('Question and answer are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        is_active: !asDraft,
        sort_order: editingId ? faqs.find(f => f.id === editingId)?.order ?? 0 : faqs.length,
      };
      const res = editingId
        ? await updateHelpFaq(editingId, payload)
        : await createHelpFaq(payload);
      if (res.success) {
        resetForm();
        await loadFaqs();
      } else {
        setError(res.error || 'Failed to save FAQ');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const res = await deleteHelpFaq(id);
      if (res.success) await loadFaqs();
      else setError(res.error || 'Failed to delete FAQ');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><HelpCircle className="w-6 h-6 text-brand-500" /> FAQ Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage frequently asked questions for the app</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">{editingId ? 'Edit FAQ' : 'New FAQ'}</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Question</label>
              <input type="text" className="input-field" placeholder="Enter the question..." value={question} onChange={e => setQuestion(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Answer</label>
              <textarea className="input-field h-24 resize-none" placeholder="Write the answer..." value={answer} onChange={e => setAnswer(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={resetForm} disabled={saving}>Cancel</button>
            <button className="btn-secondary" onClick={() => handleSave(true)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save as Draft
            </button>
            <button className="btn-primary" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Publish
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map(c => (
          <button
            key={c}
            onClick={() => setStatusFilter(c)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              statusFilter === c
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
            )}
          >
            {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading FAQs…
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(faq => (
            <div key={faq.id} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpanded(faq.id === expanded ? null : faq.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">{faq.category}</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{faq.question}</p>
                  <Badge variant={faq.status === 'published' ? 'success' : 'default'} size="sm">{faq.status}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" onClick={e => { e.stopPropagation(); openEdit(faq); }}>
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" onClick={e => { e.stopPropagation(); handleDelete(faq.id); }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                  {expanded === faq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {expanded === faq.id && (
                <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No FAQs found</div>
          )}
        </div>
      )}
    </div>
  );
}
