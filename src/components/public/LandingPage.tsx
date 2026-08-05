import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Lock, 
  Upload, 
  FileText,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { jobs, addApplicant, setActivePage, isAuthenticated } = useRecruitment();

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

    addApplicant({
      fullName,
      email,
      phone,
      address: address || '24 Oxford Street, London',
      postcode: postcode || 'W1D 1AN',
      nationalInsuranceNo: nationalInsuranceNo || 'QQ 12 34 56 A',
      siaLicenceNo,
      siaLicenceSector,
      siaLicenceExpiry,
      appliedJobId: selectedJob.id,
      appliedJobTitle: selectedJob.title,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* 1. Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 shadow-md">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5 leading-none">
              Uniguard Security
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACS Approved
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 mt-0.5">UK Guard Vetting & Deployment Portal</p>
          </div>
        </div>

        <button
          onClick={() => setActivePage(isAuthenticated ? 'dashboard' : 'login')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all hover:border-zinc-700"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAuthenticated ? 'Admin Dashboard' : '🔐 Recruiter Login'}</span>
        </button>
      </header>

      {/* 2. Hero Section */}
      <section className="py-16 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Now Hiring: SIA Guards across London & South East</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
          Start Your Security Career with <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Uniguard UK</span>
        </h2>
        
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          We provide elite security guard personnel to corporate sites, events, and venues. Apply below by submitting your SIA credentials. Our recruitment team will review and contact you within 48 hours.
        </p>

        <div className="pt-4">
          <a
            href="#apply-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <span>Jump to Application Form</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>
      </section>

      {/* 3. Job Vacancies & Form Section */}
      <main className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* Positions Available */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>1. Select an Active Vacancy</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  selectedJobId === job.id
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    {job.employmentType}
                  </span>
                  <h4 className="font-bold text-zinc-200 mt-2 text-sm leading-snug">
                    {job.title}
                  </h4>
                </div>
                
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="font-semibold text-zinc-300">
                    SIA: <span className="text-emerald-400">{job.siaRequirement}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Pay Rate:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">£{job.payRate.toFixed(2)}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div id="apply-form" className="scroll-mt-24 space-y-4">
          <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>2. Complete Your Guard Application</span>
          </h3>

          {isSubmitted ? (
            <div className="linear-card p-8 rounded-3xl text-center space-y-6 border-emerald-500/50 glow-emerald animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 text-xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-zinc-100">Application Received!</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-emerald-400 font-semibold">{fullName}</span>. Your security guard profile has been saved. The Uniguard vetting officer has been notified.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 max-w-md mx-auto text-left text-[11px] font-mono space-y-1.5 text-zinc-400">
                <div className="flex justify-between">
                  <span>Candidate:</span>
                  <span className="text-zinc-200 font-bold">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>SIA Licence:</span>
                  <span className="text-amber-400">{siaLicenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-amber-400">Awaiting Recruiter Audit</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFullName('');
                    setEmail('');
                    setSiaLicenceNo('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="linear-card p-6 sm:p-8 rounded-3xl space-y-6">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Foster"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full linear-input rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="liam.foster@example.co.uk"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full linear-input rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="07700 900222"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full linear-input rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">National Insurance Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QQ 12 34 56 B"
                    value={nationalInsuranceNo}
                    onChange={e => setNationalInsuranceNo(e.target.value)}
                    className="w-full linear-input rounded-xl p-3 font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">UK Residential Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="12 High Street, Croydon"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full linear-input rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Postcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="CR0 1YT"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    className="w-full linear-input rounded-xl p-3 font-mono"
                  />
                </div>
              </div>

              {/* SIA Details */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 text-xs">
                <h4 className="font-bold text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SIA Licence Credentials (Required)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">SIA Licence Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0130-1122-3344-5566"
                      value={siaLicenceNo}
                      onChange={e => setSiaLicenceNo(e.target.value)}
                      className="w-full linear-input rounded-xl p-3 font-mono text-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Licence Sector</label>
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
                    <label className="block text-zinc-400 mb-1">Licence Expiry Date</label>
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

              {/* Upload CV */}
              <div className="space-y-2 text-xs">
                <label className="block text-zinc-400">Attach CV / Resume *</label>
                <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/60 rounded-xl p-5 text-center bg-zinc-900/30 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-1.5" />
                  {uploadedCvName ? (
                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1"><FileText className="w-3.5 h-3.5" /> {uploadedCvName} Attached</span>
                  ) : (
                    <span className="text-zinc-500">Click to select PDF or DOCX file</span>
                  )}
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 text-[11px] text-zinc-400">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded mt-0.5 cursor-pointer shrink-0"
                />
                <label htmlFor="consent" className="cursor-pointer leading-relaxed">
                  I certify that I have the Right to Work in the UK. I authorize Uniguard to verify my licence on the SIA Public Register and contact my references.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!agreedTerms}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>Submit Security Officer Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6 text-center text-xs text-zinc-500 bg-zinc-950">
        <p>© 2026 Uniguard Security Group UK. All Rights Reserved. ACS Approved Security Contractor.</p>
      </footer>

    </div>
  );
};
