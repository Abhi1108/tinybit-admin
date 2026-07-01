'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
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
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from '@/src/services/adminApi';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function QuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states for creating/editing options
  const [options, setOptions] = useState<string[]>(['', '', '', '']);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQuizQuestions({
        page,
        limit,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setQuestions(res.questions || []);
      } else {
        setError(res.error || 'Failed to fetch quiz questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching quiz questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz question?')) return;
    try {
      const res = await deleteQuizQuestion(id);
      if (res.success) {
        fetchQuestions();
      } else {
        alert(res.error || 'Failed to delete question');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting question');
    }
  };

  const handleOpenCreate = () => {
    setCurrentQuestion({
      question: '',
      correct_index: 0,
      active: true,
      sort_order: 0,
    });
    setOptions(['', '', '', '']);
    setSaveError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (q: QuizQuestion) => {
    setCurrentQuestion(q);
    const opts = [...q.options];
    while (opts.length < 2) {
      opts.push('');
    }
    setOptions(opts);
    setSaveError(null);
    setShowModal(true);
  };

  const handleAddOptionField = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOptionField = (idx: number) => {
    if (options.length <= 2) {
      setSaveError('A quiz question must have at least 2 options.');
      return;
    }
    const newOpts = options.filter((_, i) => i !== idx);
    setOptions(newOpts);

    if (currentQuestion && currentQuestion.correct_index !== undefined) {
      if (currentQuestion.correct_index >= newOpts.length) {
        setCurrentQuestion({ ...currentQuestion, correct_index: newOpts.length - 1 });
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    const filteredOptions = options.map(o => o.trim()).filter(Boolean);

    if (!currentQuestion.question?.trim()) {
      setSaveError('Question text is required.');
      return;
    }

    if (filteredOptions.length < 2) {
      setSaveError('At least 2 non-empty options are required.');
      return;
    }

    const correctIdx = currentQuestion.correct_index ?? 0;
    if (correctIdx < 0 || correctIdx >= filteredOptions.length) {
      setSaveError('Please select a valid correct answer option.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      question: currentQuestion.question.trim(),
      options: filteredOptions,
      correct_index: correctIdx,
      active: currentQuestion.active ?? true,
      sort_order: currentQuestion.sort_order ?? 0,
    };

    try {
      let res;
      if (currentQuestion.id) {
        res = await updateQuizQuestion(currentQuestion.id, payload);
      } else {
        res = await createQuizQuestion(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchQuestions();
      } else {
        setSaveError(res.error || 'Failed to save question');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred while saving question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-500" />
            Daily Quizzes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage daily multiple-choice quiz questions for elders
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by question text..."
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
                <th className="table-header rounded-tl-xl text-left">Question Text</th>
                <th className="table-header text-left">Options</th>
                <th className="table-header text-left">Correct Answer Index</th>
                <th className="table-header text-left">Sort Order</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Created At</th>
                <th className="table-header rounded-tr-xl text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading quiz questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400 dark:text-slate-500">
                    No quiz questions found.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell max-w-xs md:max-w-md font-medium text-slate-900 dark:text-white text-sm whitespace-normal">
                      {q.question}
                    </td>
                    <td className="table-cell whitespace-normal">
                      <div className="flex flex-col gap-1 my-1">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="text-xs flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                idx === q.correct_index
                                  ? 'bg-green-500'
                                  : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            />
                            <span
                              className={
                                idx === q.correct_index
                                  ? 'font-medium text-green-700 dark:text-green-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }
                            >
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-700 dark:text-slate-300 font-mono">
                      {q.correct_index} (Option {q.correct_index + 1})
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                      {q.sort_order}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={q.active ? 'active' : 'inactive'} />
                    </td>
                    <td className="table-cell text-xs text-slate-500 dark:text-slate-400">
                      {q.created_at ? new Date(q.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                          onClick={() => handleDelete(q.id)}
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
        {!loading && questions.length > 0 && (
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
                disabled={questions.length < limit}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModal && currentQuestion && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={currentQuestion.id ? 'Edit Quiz Question' : 'Add Quiz Question'}
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
                Question Text *
              </label>
              <textarea
                className="input-field min-h-[80px]"
                required
                value={currentQuestion.question || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                placeholder="e.g. What is the national flower of India?"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Options *
                </label>
                <button
                  type="button"
                  onClick={handleAddOptionField}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Option
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      label={`Option ${idx + 1}`}
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Enter option ${idx + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionField(idx)}
                        className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                        title="Remove Option"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Correct Answer Index *
                </label>
                <select
                  className="input-field"
                  value={currentQuestion.correct_index ?? 0}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correct_index: parseInt(e.target.value, 10),
                    })
                  }
                >
                  {options.map((opt, idx) => (
                    <option key={idx} value={idx}>
                      Option {idx + 1} {opt.trim() ? `(${opt.trim().substring(0, 25)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Sort Order"
                type="number"
                value={currentQuestion.sort_order ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentQuestion({ ...currentQuestion, sort_order: isNaN(val) ? 0 : val });
                }}
                placeholder="0"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  className="input-field"
                  value={currentQuestion.active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, active: e.target.value === 'active' })
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
