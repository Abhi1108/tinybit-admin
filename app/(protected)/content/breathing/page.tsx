'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Music,
} from 'lucide-react';
import {
  StatusBadge,
  Badge,
  Modal,
  Input,
  Button,
  Tabs,
} from '@/src/components/ui';
import {
  getMoodMedia,
  createMoodMediaTrack,
  updateMoodMediaTrack,
  deleteMoodMediaTrack,
} from '@/src/services/adminApi';

interface MoodMediaTrack {
  id: string;
  category: 'bhajans' | 'meditation' | 'jokes_fun' | 'nature_sounds';
  title: string;
  subtitle: string | null;
  duration_seconds: number | null;
  duration_label: string | null;
  icon_name: string | null;
  icon_url: string | null;
  audio_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Content' },
  { id: 'meditation', label: 'Meditation & Breathing' },
  { id: 'bhajans', label: 'Bhajans' },
  { id: 'jokes_fun', label: 'Jokes & Fun' },
  { id: 'nature_sounds', label: 'Nature Sounds' },
];

const CATEGORY_OPTIONS = [
  { value: 'meditation', label: 'Meditation & Breathing' },
  { value: 'bhajans', label: 'Bhajans' },
  { value: 'jokes_fun', label: 'Jokes & Fun' },
  { value: 'nature_sounds', label: 'Nature Sounds' },
];

export default function BreathingPage() {
  const [tracks, setTracks] = useState<MoodMediaTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [showModal, setShowModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Partial<MoodMediaTrack> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Audio preview state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryParam = activeTab === 'all' ? undefined : activeTab;
      const res = await getMoodMedia({
        page,
        limit,
        category: categoryParam,
      });

      if (res.success) {
        setTracks(res.tracks || []);
      } else {
        setError(res.error || 'Failed to fetch breathing tracks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching breathing tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Stop audio on tab change
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }

    const timer = setTimeout(() => {
      fetchTracks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;
    try {
      const res = await deleteMoodMediaTrack(id);
      if (res.success) {
        if (playingTrackId === id && audioRef.current) {
          audioRef.current.pause();
          setPlayingTrackId(null);
        }
        fetchTracks();
      } else {
        alert(res.error || 'Failed to delete track');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting track');
    }
  };

  const handleOpenCreate = () => {
    setCurrentTrack({
      category: activeTab === 'all' ? 'meditation' : (activeTab as any),
      title: '',
      subtitle: '',
      duration_seconds: 300,
      duration_label: '5:00',
      icon_name: 'wind',
      icon_url: '',
      audio_url: '',
      sort_order: 0,
      is_active: true,
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (track: MoodMediaTrack) => {
    setCurrentTrack(track);
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack) return;

    if (!currentTrack.title?.trim() || !currentTrack.audio_url?.trim() || !currentTrack.category) {
      setSaveError('Title, Category, and Audio URL are required');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      let res;
      if (currentTrack.id) {
        res = await updateMoodMediaTrack(currentTrack.id, currentTrack);
      } else {
        res = await createMoodMediaTrack(currentTrack);
      }

      if (res.success) {
        setShowModal(false);
        fetchTracks();
      } else {
        setSaveError(res.error || 'Failed to save track');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred while saving track');
    } finally {
      setSaving(false);
    }
  };

  const handlePlayPause = (track: MoodMediaTrack) => {
    if (!audioRef.current) return;

    if (playingTrackId === track.id) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch((err) => {
        alert('Failed to play audio preview. Please make sure the URL is valid.');
        console.error('Audio play error:', err);
      });
      setPlayingTrackId(track.id);
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = CATEGORY_OPTIONS.find((o) => o.value === category);
    return found ? found.label : category;
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setPlayingTrackId(null)}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Wind className="w-6 h-6 text-brand-500" />
            Breathing & Mood Media
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage audio programs, meditation tracks, and wellness media files
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Track
        </button>
      </div>

      <Tabs
        tabs={CATEGORY_TABS}
        active={activeTab}
        onChange={(id) => {
          setActiveTab(id);
          setPage(1);
        }}
      />

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or subtitle..."
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
                <th className="table-header rounded-tl-xl w-12">Preview</th>
                <th className="table-header">Track Details</th>
                <th className="table-header">Category</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Sort Order</th>
                <th className="table-header">Status</th>
                <th className="table-header rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading media tracks...
                  </td>
                </tr>
              ) : tracks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell py-16 text-center text-slate-400 dark:text-slate-500">
                    No media tracks found.
                  </td>
                </tr>
              ) : (
                tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell">
                      <button
                        type="button"
                        className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${
                          playingTrackId === track.id
                            ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 animate-pulse'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-500'
                        }`}
                        onClick={() => handlePlayPause(track)}
                        title={playingTrackId === track.id ? 'Pause Preview' : 'Play Preview'}
                      >
                        {playingTrackId === track.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 text-slate-400">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {track.title}
                          </p>
                          {track.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {track.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <Badge variant="purple" size="sm">
                        {getCategoryLabel(track.category)}
                      </Badge>
                    </td>
                    <td className="table-cell text-sm text-slate-700 dark:text-slate-300">
                      {track.duration_label || '—'}
                      {track.duration_seconds && (
                        <span className="text-xs text-slate-400 block">
                          ({track.duration_seconds}s)
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                      {track.sort_order}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={track.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"
                          onClick={() => handleOpenEdit(track)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                          onClick={() => handleDelete(track.id)}
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
        {!loading && tracks.length > 0 && (
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
                disabled={tracks.length < limit}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModal && currentTrack && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={currentTrack.id ? 'Edit Track' : 'Add Track'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Track Title *"
                required
                value={currentTrack.title || ''}
                onChange={(e) => setCurrentTrack({ ...currentTrack, title: e.target.value })}
                placeholder="e.g. 5-Minute Mindful Breathing"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  className="input-field"
                  value={currentTrack.category || 'meditation'}
                  onChange={(e) => setCurrentTrack({ ...currentTrack, category: e.target.value as any })}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Subtitle / Description"
              value={currentTrack.subtitle || ''}
              onChange={(e) => setCurrentTrack({ ...currentTrack, subtitle: e.target.value })}
              placeholder="e.g. Relieve stress and anxiety with simple deep breathing exercises"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Audio URL (HTTPS Required) *"
                required
                type="url"
                value={currentTrack.audio_url || ''}
                onChange={(e) => setCurrentTrack({ ...currentTrack, audio_url: e.target.value })}
                placeholder="https://example.com/audio.mp3"
              />
              <Input
                label="Icon / Cover Image URL"
                type="url"
                value={currentTrack.icon_url || ''}
                onChange={(e) => setCurrentTrack({ ...currentTrack, icon_url: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Duration (seconds)"
                type="number"
                value={currentTrack.duration_seconds ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentTrack({ ...currentTrack, duration_seconds: isNaN(val) ? 0 : val });
                }}
                placeholder="300"
              />
              <Input
                label="Duration Label"
                value={currentTrack.duration_label || ''}
                onChange={(e) => setCurrentTrack({ ...currentTrack, duration_label: e.target.value })}
                placeholder="e.g. 5:00"
              />
              <Input
                label="Sort Order"
                type="number"
                value={currentTrack.sort_order ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentTrack({ ...currentTrack, sort_order: isNaN(val) ? 0 : val });
                }}
                placeholder="0"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  className="input-field"
                  value={currentTrack.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setCurrentTrack({ ...currentTrack, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <Input
              label="Icon Name"
              value={currentTrack.icon_name || 'wind'}
              onChange={(e) => setCurrentTrack({ ...currentTrack, icon_name: e.target.value })}
              placeholder="e.g. wind, music, activity"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
