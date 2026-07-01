'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  StatusBadge,
  Modal,
  Input,
  Button,
} from '@/src/components/ui';
import {
  getInspirations,
  createInspiration,
  updateInspiration,
  deleteInspiration,
} from '@/src/services/adminApi';

interface Inspiration {
  id: string;
  quote: string;
  author: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function InspirationsPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [showModal, setShowModal] = useState(false);
  const [currentInspiration, setCurrentInspiration] = useState<Partial<Inspiration> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchInspirations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInspirations({
        page,
        limit,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setInspirations(res.inspirations || []);
      } else {
        setError(res.error || 'Failed to fetch inspirations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching inspirations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInspirations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inspiration?')) return;
    try {
      const res = await deleteInspiration(id);
      if (res.success) {
        fetchInspirations();
      } else {
        alert(res.error || 'Failed to delete inspiration');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting inspiration');
    }
  };

  const handleOpenCreate = () => {
    setCurrentInspiration({
      quote: '',
      author: '',
      active: true,
      sort_order: 0,
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (inspiration: Inspiration) => {
    setCurrentInspiration(inspiration);
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInspiration) return;

    if (!currentInspiration.quote?.trim() || !currentInspiration.author?.trim()) {
      setSaveError('Quote and Author are required.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      quote: currentInspiration.quote.trim(),
      author: currentInspiration.author.trim(),
      active: currentInspiration.active ?? true,
      sort_order: currentInspiration.sort_order ?? 0,
    };

    try {
      let res;
      if (currentInspiration.id) {
        res = await updateInspiration(currentInspiration.id, payload);
      } else {
        res = await createInspiration(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchInspirations();
      } else {
        setSaveError(res.error || 'Failed to save inspiration');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred while saving inspiration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            Daily Inspirations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage daily quotes and inspirational messages for elders
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Inspiration
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote or author..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header rounded-tl-xl text-left">Quote Text</th>
                <th className="table-header text-left">Author</th>
                <th className="table-header text-left">Sort Order</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Created At</th>
                <th className="table-header rounded-tr-xl text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading inspirations...
                  </td>
                </tr>
              ) : inspirations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell py-16 text-center text-slate-400 dark:text-slate-500">
                    No inspirations found.
                  </td>
                </tr>
              ) : (
                inspirations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell max-w-md font-medium text-slate-900 dark:text-white text-sm whitespace-normal italic">
                      "{item.quote}"
                    </td>
                    <td className="table-cell text-sm text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {item.author}
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                      {item.sort_order}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={item.active ? 'active' : 'inactive'} />
                    </td>
                    <td className="table-cell text-xs text-slate-500 dark:text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && inspirations.length > 0 && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-medium text-slate-700 dark:text-slate-200">{page}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={inspirations.length < limit}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModal && currentInspiration && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={currentInspiration.id ? 'Edit Inspiration' : 'Add Inspiration'}
          footer={
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                onClick={(e) => handleSave(e)}
              >
                Save
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            {saveError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Quote Text *
              </label>
              <textarea
                className="input-field min-h-[120px]"
                required
                value={currentInspiration.quote || ''}
                onChange={(e) => setCurrentInspiration({ ...currentInspiration, quote: e.target.value })}
                placeholder="e.g. The only limit to our realization of tomorrow will be our doubts of today."
              />
            </div>

            <Input
              label="Author *"
              required
              value={currentInspiration.author || ''}
              onChange={(e) => setCurrentInspiration({ ...currentInspiration, author: e.target.value })}
              placeholder="e.g. Franklin D. Roosevelt"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Sort Order"
                type="number"
                value={currentInspiration.sort_order ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentInspiration({ ...currentInspiration, sort_order: isNaN(val) ? 0 : val });
                }}
                placeholder="0"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  className="input-field"
                  value={currentInspiration.active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setCurrentInspiration({ ...currentInspiration, active: e.target.value === 'active' })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
