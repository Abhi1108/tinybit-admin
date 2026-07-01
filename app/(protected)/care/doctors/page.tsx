'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Star,
} from 'lucide-react';
import {
  Avatar,
  StatusBadge,
  Badge,
  Modal,
  Input,
  Button,
} from '@/src/components/ui';
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '@/src/services/adminApi';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number | null;
  experience: string;
  fee: string | null;
  address: string | null;
  image_url: string | null;
  hospital: string | null;
  phone: string | null;
  email: string | null;
  about: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [showModal, setShowModal] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Partial<Doctor> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDoctors({ page, limit, search });
      if (res.success) {
        setDoctors(res.doctors || []);
      } else {
        setError(res.error || 'Failed to fetch doctors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor record?')) return;
    try {
      const res = await deleteDoctor(id);
      if (res.success) {
        fetchDoctors();
      } else {
        alert(res.error || 'Failed to delete doctor');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting doctor');
    }
  };

  const handleOpenCreate = () => {
    setCurrentDoctor({
      name: '',
      specialty: '',
      experience: '',
      fee: '',
      address: '',
      image_url: '',
      hospital: '',
      phone: '',
      email: '',
      about: '',
      is_active: true,
      sort_order: 0,
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;

    if (
      !currentDoctor.name?.trim() ||
      !currentDoctor.specialty?.trim() ||
      !currentDoctor.experience?.trim() ||
      !currentDoctor.hospital?.trim()
    ) {
      setSaveError('Name, Specialty, Experience, and Hospital/Clinic are required');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      let res;
      if (currentDoctor.id) {
        res = await updateDoctor(currentDoctor.id, currentDoctor);
      } else {
        res = await createDoctor(currentDoctor);
      }

      if (res.success) {
        setShowModal(false);
        fetchDoctors();
      } else {
        setSaveError(res.error || 'Failed to save doctor record');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred while saving doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-500" />
            Doctor Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage healthcare professional listings and details
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialty, address..."
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
                <th className="table-header rounded-tl-xl">Doctor</th>
                <th className="table-header">Specialty</th>
                <th className="table-header">Experience & Fee</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Address</th>
                <th className="table-header">Status</th>
                <th className="table-header">Sort Order</th>
                <th className="table-header rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading doctors...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell py-16 text-center text-slate-400 dark:text-slate-500">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar name={doctor.name} src={doctor.image_url || undefined} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{doctor.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm font-medium text-brand-600 dark:text-brand-400">
                      {doctor.specialty}
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{doctor.experience}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fee: {doctor.fee || '—'}</p>
                      {doctor.phone && <p className="text-xs text-slate-400 dark:text-slate-500">{doctor.phone}</p>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {doctor.rating != null ? doctor.rating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                      {doctor.hospital && <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{doctor.hospital}</p>}
                      {doctor.address && <p className="text-xs truncate">{doctor.address}</p>}
                      {doctor.email && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{doctor.email}</p>}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={doctor.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="table-cell text-sm text-slate-500 dark:text-slate-400">
                      {doctor.sort_order}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"
                          onClick={() => handleOpenEdit(doctor)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                          onClick={() => handleDelete(doctor.id)}
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
        {!loading && doctors.length > 0 && (
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
                disabled={doctors.length < limit}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModal && currentDoctor && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={currentDoctor.id ? 'Edit Doctor' : 'Add Doctor'}
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
                label="Full Name *"
                required
                value={currentDoctor.name || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, name: e.target.value })}
                placeholder="e.g. Dr. John Doe"
              />
              <Input
                label="Specialty *"
                required
                value={currentDoctor.specialty || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, specialty: e.target.value })}
                placeholder="e.g. Cardiologist"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Experience *"
                required
                value={currentDoctor.experience || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, experience: e.target.value })}
                placeholder="e.g. 12 years"
              />
              <Input
                label="Hospital/Clinic Name *"
                required
                value={currentDoctor.hospital || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, hospital: e.target.value })}
                placeholder="e.g. City General Hospital"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Phone Contact"
                value={currentDoctor.phone || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, phone: e.target.value })}
                placeholder="e.g. +91 99999 99999"
              />
              <Input
                label="Email Contact"
                type="email"
                value={currentDoctor.email || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                placeholder="e.g. dr.doe@hospital.com"
              />
              <Input
                label="Consultation Fee"
                value={currentDoctor.fee || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, fee: e.target.value })}
                placeholder="e.g. $100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={currentDoctor.rating ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentDoctor({ ...currentDoctor, rating: isNaN(val) ? null : val });
                }}
                placeholder="4.5"
              />
              <Input
                label="Sort Order"
                type="number"
                value={currentDoctor.sort_order ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCurrentDoctor({ ...currentDoctor, sort_order: isNaN(val) ? 0 : val });
                }}
                placeholder="0"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  className="input-field"
                  value={currentDoctor.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setCurrentDoctor({ ...currentDoctor, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <Input
              label="Image URL"
              value={currentDoctor.image_url || ''}
              onChange={(e) => setCurrentDoctor({ ...currentDoctor, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                About (Biography)
              </label>
              <textarea
                className="input-field h-16 resize-none"
                value={currentDoctor.about || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, about: e.target.value })}
                placeholder="Short biography or clinic specialization info..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Clinic Address
              </label>
              <textarea
                className="input-field h-16 resize-none"
                value={currentDoctor.address || ''}
                onChange={(e) => setCurrentDoctor({ ...currentDoctor, address: e.target.value })}
                placeholder="Full address of clinic or hospital..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
