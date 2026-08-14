import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  ShieldCheck, 
  Upload, 
  ArrowRight, 
  MapPin, 
  FileText, 
  Lock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export const PublicApplyForm: React.FC = () => {
  const { jobs, addApplicant, setActivePage, setSelectedApplicant, applicants } = useRecruitment();

  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || 'job-1');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [nationalInsuranceNo, setNationalInsuranceNo] = useState('');
  const [siaLicenceNo, setSiaLicenceNo] = useState('');
  const [siaLicenceSector, setSiaLicenceSector] = useState<any>('Door Supervision');
  const [siaLicenceExpiry, setSiaLicenceExpiry] = useState('2028-02-28');
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedCvName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !siaLicenceNo) return;

    // Create candidate application in system
    addApplicant({
      fullName,
      email,
      phone,
      address: address || '14 Regent Street, London',
      postcode: postcode || 'SW1Y 4PH',
      nationalInsuranceNo: nationalInsuranceNo || 'QQ 88 99 00 B',
      siaLicenceNo,
      siaLicenceSector,
      siaLicenceExpiry,
      appliedJobId: selectedJob.id,
      appliedJobTitle: selectedJob.title,
    });

    // Find latest added applicant ID
    setIsSubmitted(true);
  };

  const handleGoToAdmin = () => {
    // Select latest applicant if available
    if (applicants.length > 0) {
      setSelectedApplicant(applicants[0]);
    }
    setActivePage('dashboard');
  };

  return (
    <div className="min-h-screen bg-page text-primary py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Top Banner Navigation back to Admin */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-primary flex items-center gap-2">
              Uniguard Security UK
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                Official Careers Portal
              </span>
            </h1>
            <p className="text-xs text-tertiary">Online Guard Recruitment & SIA Vetting System</p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-panel-2 hover:bg-panel-3 text-secondary border border-line text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Switch to Admin Dashboard</span>
        </button>
      </div>

      {/* Submission Success Screen */}
      {isSubmitted ? (
        <div className="w-full max-w-2xl linear-card p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-200 border-emerald-500/50 glow-emerald">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/40 text-2xl">
            ✓
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-primary">Application Submitted Successfully!</h2>
            <p className="text-sm text-secondary max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-emerald-600 font-semibold">{fullName}</span>. Your security guard application for <span className="text-primary font-medium">"{selectedJob.title}"</span> has been registered into the Uniguard Vetting System.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-panel-2 border border-line max-w-md mx-auto text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between text-tertiary">
              <span>Candidate Reference:</span>
              <span className="text-emerald-600 font-bold">#UG-APP-2026</span>
            </div>
            <div className="flex justify-between text-tertiary">
              <span>SIA Licence Number:</span>
              <span className="text-amber-600">{siaLicenceNo}</span>
            </div>
            <div className="flex justify-between text-tertiary">
              <span>Vetting Status:</span>
              <span className="text-amber-600">Pending Manual Verification</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoToAdmin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <span>View Submitted Application on Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFullName('');
                setEmail('');
                setSiaLicenceNo('');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-panel-2 hover:bg-panel-3 text-secondary text-xs font-semibold transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        /* Public Candidate Application Form */
        <div className="w-full max-w-3xl space-y-8">
          
          {/* Vacancy Selector Header */}
          <div className="linear-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Step 1: Choose Security Position</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Select Job Vacancy</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {jobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedJobId === job.id
                      ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-panel-2 border-line hover:border-line-strong'
                  }`}
                >
                  <div className="font-semibold text-xs text-primary leading-tight">
                    {job.title}
                  </div>
                  <div className="text-[11px] text-tertiary flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-faint" />
                    <span>{job.location}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600">
                    £{job.payRate.toFixed(2)}/hr
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Form */}
          <form onSubmit={handleSubmit} className="linear-card p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-base font-bold text-primary">Step 2: Candidate Details & SIA Information</h3>
                <p className="text-xs text-tertiary">Please provide accurate information for UK Home Office & SIA verification</p>
              </div>
              <span className="text-xs text-emerald-600 font-mono flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-secondary font-medium mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full linear-input rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-secondary font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@example.co.uk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full linear-input rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-secondary font-medium mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+44 7700 900555"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full linear-input rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-secondary font-medium mb-1">National Insurance Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QQ 12 34 56 A"
                  value={nationalInsuranceNo}
                  onChange={e => setNationalInsuranceNo(e.target.value)}
                  className="w-full linear-input rounded-xl p-3 font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-secondary font-medium mb-1">UK Residential Address *</label>
                <input
                  type="text"
                  required
                  placeholder="24 Oxford Street, London"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full linear-input rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-secondary font-medium mb-1">Postcode *</label>
                <input
                  type="text"
                  required
                  placeholder="W1D 1AN"
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  className="w-full linear-input rounded-xl p-3 font-mono"
                />
              </div>
            </div>

            {/* SIA Licence Info */}
            <div className="p-5 rounded-2xl bg-panel-2 border border-line-strong space-y-4 text-xs">
              <h4 className="font-semibold text-primary text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>SIA Licence Credentials (Required for Vetting)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-tertiary mb-1">SIA Licence Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0102-3498-1184-9023"
                    value={siaLicenceNo}
                    onChange={e => setSiaLicenceNo(e.target.value)}
                    className="w-full linear-input rounded-xl p-3 font-mono text-amber-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-tertiary mb-1">Licence Sector</label>
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

                <div>
                  <label className="block text-tertiary mb-1">Licence Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={siaLicenceExpiry}
                    onChange={e => setSiaLicenceExpiry(e.target.value)}
                    className="w-full linear-input rounded-xl p-3 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CV Dropzone simulation */}
            <div className="space-y-2 text-xs">
              <label className="block text-secondary font-medium">Upload CV / Resume (PDF / DOCX) *</label>
              <div className="border-2 border-dashed border-line hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-panel-2 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-faint mx-auto mb-2" />
                {uploadedCvName ? (
                  <div className="text-emerald-600 font-semibold flex items-center justify-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{uploadedCvName} Attached</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-secondary font-medium">Click to select file or drag & drop</span>
                    <p className="text-[11px] text-faint mt-0.5">PDF or Word document up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-3 pt-2 text-xs text-tertiary">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer">
                I declare that I hold Right to Work in the UK and authorize Uniguard to verify my SIA Licence on Home Office register.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedTerms}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span>Submit Security Guard Application</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
