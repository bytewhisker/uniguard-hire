import React, { useState, useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { X, Briefcase, Pencil } from 'lucide-react';
import type { Job } from '../../types/recruitment';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: Job | null;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, editingJob }) => {
  const { createJob, updateJob } = useRecruitment();
  const isEditing = !!editingJob;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [payRate, setPayRate] = useState('15.50');
  const [employmentType, setEmploymentType] = useState<Job['employmentType']>('Full-Time');
  const [siaRequired, setSiaRequired] = useState<boolean>(true);
  const [status, setStatus] = useState<Job['status']>('active');
  const [description, setDescription] = useState('');

  // Populate form when editing an existing job
  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title);
      setLocation(editingJob.location);
      setPayRate(String(editingJob.payRate));
      setEmploymentType(editingJob.employmentType);
      setSiaRequired(editingJob.siaRequired);
      setStatus(editingJob.status);
      setDescription(editingJob.description);
    } else {
      // Reset to defaults for create mode
      setTitle('');
      setLocation('');
      setPayRate('15.50');
      setEmploymentType('Full-Time');
      setSiaRequired(true);
      setStatus('active');
      setDescription('');
    }
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const jobData = {
      title,
      location,
      payRate: parseFloat(payRate) || 15.00,
      employmentType,
      siaRequired,
      status,
      description
    };

    if (isEditing && editingJob) {
      updateJob(editingJob.id, jobData);
    } else {
      createJob(jobData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-panel border border-line rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isEditing
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {isEditing ? <Pencil className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">
                {isEditing ? 'Edit Security Job' : 'Post New Security Job'}
              </h2>
              <p className="text-xs text-secondary">
                {isEditing ? 'Update the vacancy details — changes go live instantly' : 'Create a vacancy post for UK security applicants'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-primary font-medium mb-1">Job Title / Vacancy Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. SIA Door Supervisor — Soho Venue"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full linear-input rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-primary font-medium mb-1">UK Location / Site *</label>
            <input
              type="text"
              required
              placeholder="e.g. Canary Wharf, London"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full linear-input rounded-xl p-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Pay Rate (£/hr)</label>
              <input
                type="number"
                step="0.10"
                value={payRate}
                onChange={e => setPayRate(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value as any)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Zero-Hours">Zero-Hours</option>
                <option value="Shift-Based">Shift-Based</option>
              </select>
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">SIA Licence Required?</label>
              <select
                value={siaRequired ? 'yes' : 'no'}
                onChange={e => setSiaRequired(e.target.value === 'yes')}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Job Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="active">Active — Accepting Applicants</option>
                <option value="draft">Draft — Hidden</option>
                <option value="closed">Closed — No Longer Accepting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-primary font-medium mb-1">Job Description & Site Duties</label>
            <textarea
              rows={3}
              placeholder="Outline shift patterns, site duties, access control requirements..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full linear-input rounded-xl p-3"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-panel-2 text-primary font-semibold hover:bg-panel-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold transition-all shadow-lg ${
                isEditing
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/25'
                  : 'bg-[#AF7C28] hover:bg-[#c99a3e] shadow-amber-500/25'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Post Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};