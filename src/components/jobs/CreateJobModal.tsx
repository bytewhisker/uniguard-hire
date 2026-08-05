import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { X, Briefcase } from 'lucide-react';
import type { Job } from '../../types/recruitment';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose }) => {
  const { createJob } = useRecruitment();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Corporate Guarding');
  const [location, setLocation] = useState('');
  const [payRate, setPayRate] = useState('15.50');
  const [employmentType, setEmploymentType] = useState<Job['employmentType']>('Full-Time');
  const [siaRequirement, setSiaRequirement] = useState<Job['siaRequirement']>('Security Guarding');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    createJob({
      title,
      department,
      location,
      payRate: parseFloat(payRate) || 15.00,
      employmentType,
      siaRequirement,
      status: 'active',
      description
    });

    onClose();
    // Reset
    setTitle('');
    setLocation('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-panel border border-line rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Post New Security Job</h2>
              <p className="text-xs text-secondary">Create a vacancy post for UK security applicants</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="Corporate Guarding">Corporate Guarding</option>
                <option value="Event & Venue Security">Event & Venue Security</option>
                <option value="Control Room Operations">Control Room Operations</option>
                <option value="VIP Protection">VIP Protection</option>
                <option value="Retail Guarding">Retail Guarding</option>
              </select>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-primary font-medium mb-1">Required SIA Licence</label>
              <select
                value={siaRequirement}
                onChange={e => setSiaRequirement(e.target.value as any)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="Door Supervision">Door Supervision</option>
                <option value="Security Guarding">Security Guarding</option>
                <option value="CCTV (PSS)">CCTV (PSS)</option>
                <option value="Close Protection">Close Protection</option>
                <option value="None">None</option>
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
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-lg shadow-emerald-950/40"
            >
              Post Job Posting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
