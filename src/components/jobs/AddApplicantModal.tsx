import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { X, UserPlus } from 'lucide-react';

interface AddApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddApplicantModal: React.FC<AddApplicantModalProps> = ({ isOpen, onClose }) => {
  const { jobs, addApplicant } = useRecruitment();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [nationalInsuranceNo, setNationalInsuranceNo] = useState('');
  const [siaLicenceNo, setSiaLicenceNo] = useState('');
  const [siaLicenceSector, setSiaLicenceSector] = useState<any>('Door Supervision');
  const [siaLicenceExpiry, setSiaLicenceExpiry] = useState('2027-11-30');
  const [appliedJobId, setAppliedJobId] = useState(jobs[0]?.id || 'job-1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const selectedJob = jobs.find(j => j.id === appliedJobId);

    addApplicant({
      fullName,
      email,
      phone,
      address,
      postcode,
      nationalInsuranceNo,
      siaLicenceNo,
      siaLicenceSector,
      siaLicenceExpiry,
      appliedJobId,
      appliedJobTitle: selectedJob ? selectedJob.title : 'Security Officer'
    });

    onClose();
    // Reset
    setFullName('');
    setEmail('');
    setPhone('');
    setSiaLicenceNo('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-panel border border-line rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Add New Security Applicant</h2>
              <p className="text-xs text-secondary">Enter candidate details for UK vetting tracking</p>
            </div>
          </div>

          <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Robert Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="r.smith@example.co.uk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+44 7700 900888"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">Target Job Vacancy</label>
              <select
                value={appliedJobId}
                onChange={e => setAppliedJobId(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">National Insurance No</label>
              <input
                type="text"
                placeholder="QQ 12 34 56 A"
                value={nationalInsuranceNo}
                onChange={e => setNationalInsuranceNo(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">SIA Licence Sector</label>
              <select
                value={siaLicenceSector}
                onChange={e => setSiaLicenceSector(e.target.value as any)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="Door Supervision">Door Supervision</option>
                <option value="Security Guarding">Security Guarding</option>
                <option value="CCTV (PSS)">CCTV (PSS)</option>
                <option value="Close Protection">Close Protection</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">SIA Licence Number</label>
              <input
                type="text"
                placeholder="16-digit SIA number e.g. 0102-3498-1122"
                value={siaLicenceNo}
                onChange={e => setSiaLicenceNo(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono text-amber-400"
              />
            </div>

            <div>
              <label className="block text-primary font-medium mb-1">SIA Expiry Date</label>
              <input
                type="date"
                value={siaLicenceExpiry}
                onChange={e => setSiaLicenceExpiry(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-primary font-medium mb-1">Address</label>
              <input
                type="text"
                placeholder="10 High Street, London"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-primary font-medium mb-1">Postcode</label>
              <input
                type="text"
                placeholder="SW1A 1AA"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>
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
              Add Candidate to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
