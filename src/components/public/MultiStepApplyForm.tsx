import React, { useState, useEffect, useRef } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { ArrowRight, ArrowLeft, CheckCircle2, Plus, Trash2, Upload, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressEvidence } from '../../lib/compressFile';

const steps = [
  { title: 'Personal Details', sub: 'Who you are' },
  { title: '5 Years Activity', sub: 'Education & work history' },
  { title: 'Address History', sub: 'Last 5 years' },
  { title: 'Security Questions', sub: 'Declarations' },
  { title: 'References', sub: 'Character & next of kin' },
  { title: 'Screening & Consent', sub: 'What gets checked' },
  { title: 'Declaration & Sign', sub: 'Final review' },
];

const WORLD_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian',
  'Bengali', 'Bosnian', 'Bulgarian', 'Burmese', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese (Cantonese)',
  'Chinese (Mandarin)', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto', 'Estonian',
  'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
  'Haitian Creole', 'Hausa', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian',
  'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Korean',
  'Kurdish', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian',
  'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Nepali', 'Norwegian',
  'Odia', 'Pashto', 'Persian (Farsi)', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian',
  'Samoan', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali',
  'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Telugu', 'Thai', 'Turkish',
  'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu',
];

const LanguageSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = (lang: string) => {
    const next = selected.includes(lang) ? selected.filter(l => l !== lang) : [...selected, lang];
    onChange(next.join(', '));
  };

  const filtered = query ? WORLD_LANGUAGES.filter(l => l.toLowerCase().includes(query.toLowerCase())) : WORLD_LANGUAGES;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full min-h-[42px] px-4 py-2.5 rounded-lg border border-line text-sm text-left focus:outline-none focus:border-line-strong bg-panel flex flex-wrap items-center gap-1.5"
      >
        {selected.length === 0 && <span className="text-faint">Search & select languages…</span>}
        {selected.map(s => (
          <span key={s} className="text-xs font-medium px-2 py-1 rounded bg-panel-2 border border-line text-primary">{s}</span>
        ))}
        <ChevronDown className={`w-4 h-4 text-faint ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-line bg-panel shadow-lg overflow-hidden">
          <div className="p-2 border-b border-line">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search languages…"
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel-2"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 && <p className="text-xs text-faint px-3 py-2">No languages match "{query}"</p>}
            {filtered.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggle(lang)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selected.includes(lang) ? 'bg-amber-50 text-amber-700 font-medium' : 'text-secondary hover:bg-panel-2'}`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${selected.includes(lang) ? 'border-amber-400 bg-amber-400 text-white' : 'border-line'}`}>
                  {selected.includes(lang) ? '✓' : ''}
                </span>
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const emptyForm = {
  fullName: '', dob: '', position: '', address: '', postcode: '', telephone: '', mobile: '',
  niNumber: '', siaLicence: '', hasDrivingLicence: '', drivingLicenceNumber: '',
  education: '', hasFirstAid: '', languages: '', lenAtAddress: '', prevAddresses: '',
  q1: '', q1Details: '', q2: '', q2Details: '', q3: '', q3Details: '',
  q4: '', q4Details: '', q5: '', q5Details: '', q6: '', q6Details: '', q7: '', q7Details: '',
  ref1Name: '', ref1Address: '', ref1Postcode: '', ref1Occupation: '', ref1Known: '',
  ref2Name: '', ref2Address: '', ref2Postcode: '', ref2Occupation: '', ref2Known: '',
  nokName: '', nokAddress: '', nokPostcode: '', nokTelephone: '', nokMobile: '', nokRelationship: '',
  charRefName: '', charRefAddress: '', charRefPostcode: '', charRefTelephone: '', charRefKnown: '',
  criminalDetails: '', agree1: false, agree2: false, printName: '', signature: '', sigDate: '',
};

const sampleActivity = (id: number, type: string, title: string, from: string, to: string, mobile: string, email: string) => ({ id, type, title, from, to, evidence: '', mobile, email, file: null as File | null });

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const ALLOWED_EVIDENCE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

export const MultiStepApplyForm: React.FC = () => {
  const { jobs, setActivePage, publicUser, showToast } = useRecruitment();
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');

  const selectedJob = jobs[0];

  const [form, setForm] = useState(emptyForm);

  const [activities, setActivities] = useState([
    { id: 1, type: 'education', title: '', from: '', to: '', evidence: '', mobile: '', email: '', file: null as File | null },
  ]);

  const [picker, setPicker] = useState<{ id: number; field: 'from' | 'to'; year: number; month: number | null } | null>(null);
  const [popFlash, setPopFlash] = useState(0);
  const [evidenceError, setEvidenceError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const formatYM = (v: string) => {
    if (!v) return '';
    if (v === 'Present') return 'Present';
    const [y, m, d] = v.split('-');
    if (d) return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
    return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
  };

  const openDatePicker = (id: number, field: 'from' | 'to') => {
    const activity = activities.find(a => a.id === id);
    const val = activity?.[field] || '';
    const parts = val.split('-');
    setPicker({
      id,
      field,
      year: parts[0] ? Number(parts[0]) : new Date().getFullYear(),
      month: parts[1] ? Number(parts[1]) : null,
    });
  };

  const coverageYears = () => {
    let months = 0;
    let hasAny = false;
    activities.forEach(a => {
      if (!a.from || !a.to) return;
      hasAny = true;
      const from = new Date(a.from);
      const to = a.to === 'Present' ? new Date() : new Date(a.to);
      if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return;
      months += (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    });
    return { months, hasAny };
  };

  const coverageInvalid = () => {
    const { months, hasAny } = coverageYears();
    return hasAny && months < 60;
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const updateActivity = (id: number, field: string, value: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addActivity = () => {
    setActivities(prev => [...prev, { id: Date.now(), type: 'education', title: '', from: '', to: '', evidence: '', mobile: '', email: '', file: null as File | null }]);
  };

  const removeActivity = (id: number) => {
    setActivities(prev => prev.length > 1 ? prev.filter(a => a.id !== id) : prev);
  };

  const autoFill = () => {
    setForm({
      fullName: 'John Smith', dob: '1990-05-15', position: 'Security Officer — Static Site',
      address: '12 High Street, London', postcode: 'EC1A 1BB', telephone: '020 7123 4567', mobile: '07700 900123',
      niNumber: 'QQ 12 34 56 C', siaLicence: 'SIA123456', hasDrivingLicence: 'yes',
      drivingLicenceNumber: 'SMITH901055J9AB', education: 'City of London College', hasFirstAid: 'yes',
      languages: 'English, Spanish', lenAtAddress: '5plus', prevAddresses: '',
      q1: 'no', q1Details: '', q2: 'no', q2Details: '', q3: 'no', q3Details: '',
      q4: 'no', q4Details: '', q5: 'no', q5Details: '', q6: 'no', q6Details: '', q7: 'yes', q7Details: '',
      ref1Name: 'Sarah Jones', ref1Address: '5 Park Lane, London', ref1Postcode: 'W1K 1AH', ref1Occupation: 'Teacher', ref1Known: '8',
      ref2Name: 'David Brown', ref2Address: '22 Green Road, London', ref2Postcode: 'N1 2AB', ref2Occupation: 'Engineer', ref2Known: '5',
      nokName: 'Emma Smith', nokAddress: '12 High Street, London', nokPostcode: 'EC1A 1BB', nokTelephone: '020 7123 4567',
      nokMobile: '07700 900456', nokRelationship: 'Wife',
      charRefName: 'Michael Green', charRefAddress: '44 Oak Avenue, London', charRefPostcode: 'SW1 1AA', charRefTelephone: '07700 900789', charRefKnown: '6',
      criminalDetails: '', agree1: true, agree2: true, printName: 'John Smith', signature: 'John Smith', sigDate: '',
    });
    setActivities([
      sampleActivity(1, 'work', 'Security Officer — SecuriGuard UK', '2021-06-15', '2024-12-20', '07700 900123', 'hr@securiguard.co.uk'),
      sampleActivity(2, 'education', 'City of London College', '2016-09-01', '2020-06-30', '', ''),
    ]);
  };

  const clearForm = () => {
    setForm(emptyForm);
    setActivities([sampleActivity(1, 'education', '', '', '', '', '')]);
  };

  useEffect(() => {
    if (submitted) setRefNum('REF-' + Math.floor(100000 + Math.random() * 900000));
  }, [submitted]);

  const next = () => {
    if (current === 1) {
      const { months, hasAny } = coverageYears();
      if (hasAny && months < 60) {
        setPopFlash(f => f + 1);
        return;
      }
      if (activities.some(a => !a.evidence && !a.file)) {
        setEvidenceError(true);
        setPopFlash(f => f + 1);
        return;
      }
      setEvidenceError(false);
    }
    if (current < steps.length - 1) setCurrent(current + 1);
  };
  const back = () => { if (current > 0) setCurrent(current - 1); };

  const handleSubmit = async () => {
    if (!form.agree1 || !form.agree2 || !form.printName || submitting) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      if (!supabase) {
        throw new Error('Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment.');
      }
      const { data: { user } } = await supabase.auth.getUser();
      let storedActivities = activities.map(a => ({ ...a, file: undefined }));

      if (user) {
        const uploaded: typeof storedActivities = [];
        for (const a of activities) {
          if (!a.file) { uploaded.push({ ...a, file: undefined }); continue; }
          const compressed = await compressEvidence(a.file);
          const ext = compressed.name.match(/\.[^.]+$/)?.[0] || '.pdf';
          const path = `evidence/${user.id}/${a.id}-${Date.now()}${ext}`;
          const { error: upErr } = await supabase.storage.from('evidence').upload(path, compressed, { cacheControl: '3600', upsert: false });
          if (upErr) throw new Error(`Evidence upload failed: ${upErr.message}`);
          const { data } = supabase.storage.from('evidence').getPublicUrl(path);
          uploaded.push({ ...a, evidence: data.publicUrl, file: undefined });
        }
        storedActivities = uploaded;
      }

      const { error: insertError } = await supabase.from('applications').insert({
        applicant_email: publicUser?.email || user?.email || '',
        user_id: user?.id,
        full_name: form.fullName,
        applied_job: selectedJob?.title || '',
        status: 'applied',
        form_data: { ...form, activities: storedActivities },
      });
      if (insertError) throw new Error(`Could not save application: ${insertError.message}`);

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-6" style={{ borderColor: '#3E8E63', color: '#3E8E63' }}>
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Application Received</h2>
          <p className="text-secondary mb-2">Your application has been submitted to Uniguard's recruitment team.</p>
          <p className="text-sm text-faint mb-8">Reference: <span className="font-mono font-bold" style={{ color: '#AF7C28' }}>{refNum}</span></p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => setActivePage('user-dashboard')} className="px-6 py-3 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg" style={{ backgroundColor: '#AF7C28' }}>Back to Dashboard</button>
            <button onClick={() => { setSubmitted(false); setCurrent(0); }} className="px-6 py-3 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors">Submit Another Application</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-line bg-panel sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard" className="h-9 w-auto object-contain" />
            <div className="text-left">
              <h1 className="font-bold text-base text-primary leading-none">Application for Employment</h1>
              <p className="text-[10px] text-secondary tracking-wider uppercase mt-0.5">Uniguard Security UK</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={autoFill} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-line text-secondary hover:text-primary hover:border-line-strong transition-colors">Auto Fill</button>
            <button onClick={clearForm} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-line text-secondary hover:text-rose-500 hover:border-rose-300 transition-colors">Clear</button>
            <button onClick={() => setActivePage('user-dashboard')} className="text-sm font-medium text-secondary hover:text-primary transition-colors">← Back to Dashboard</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0">
          {/* Left Rail */}
          <aside className="hidden lg:block border-r border-line pr-8 py-2">
            <div className="mb-2">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-faint mb-1">Progress</p>
              <p className="text-3xl font-bold" style={{ color: '#AF7C28' }}>{Math.round((current / (steps.length - 1)) * 100)}%</p>
              <p className="text-xs text-secondary mt-0.5">{current === steps.length - 1 ? 'Final review' : 'In progress'}</p>
            </div>
            <div className="h-1.5 w-full bg-panel-2 rounded-full overflow-hidden mb-8">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / (steps.length - 1)) * 100}%`, backgroundColor: '#AF7C28' }}></div>
            </div>
            <ul className="space-y-0">
              {steps.map((s, i) => (
                <li key={i} onClick={() => i <= current && setCurrent(i)} className={`flex items-start gap-3 py-3 cursor-pointer transition-opacity ${i <= current ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5 ${i < current ? 'bg-emerald-600 border-emerald-600 text-white' : i === current ? 'border-amber-500 text-amber-600' : 'border-line text-faint'}`}>
                    {i < current ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${i === current ? 'text-primary' : 'text-secondary'}`}>{s.title}</p>
                    <p className="text-[11px] text-faint">{s.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Form Area */}
          <div className="pl-0 lg:pl-10 py-2">
            <div className="flex items-center gap-2 mb-6 lg:hidden overflow-x-auto pb-2">
              {steps.map((_, i) => (
                <div key={i} className={`h-2 rounded-full flex-shrink-0 transition-all ${i === current ? 'w-8' : 'w-2'} ${i < current ? 'bg-emerald-600' : i === current ? 'bg-amber-500' : 'bg-panel-2'}`}></div>
              ))}
            </div>

            <div className="mb-8">
              <p className="text-xs font-mono tracking-wider uppercase mb-2" style={{ color: '#AF7C28' }}>Section {String(current + 1).padStart(2, '0')} / 07</p>
              <h2 className="text-2xl font-bold text-primary mb-2">{steps[current].title}</h2>
              <p className="text-sm text-secondary">{steps[current].sub === 'Who you are' ? 'Your basic details and the role you\'re applying for.' : steps[current].sub === 'Education & work history' ? 'Provide your education and employment history covering the last 5 years.' : steps[current].sub === 'Last 5 years' ? 'If you\'ve lived at your current address fewer than 5 years, list previous addresses.' : steps[current].sub === 'Declarations' ? 'Answer honestly — these responses are cross-checked during BS 7858 screening.' : steps[current].sub === 'Character & next of kin' ? 'Provide two character references and next of kin details.' : steps[current].sub === 'What gets checked' ? 'All applicants undergo financial history and BS 7858 screening.' : 'Read the declaration below, then sign to confirm.'}</p>
            </div>

            {current === 0 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Applicant</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full legal name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Date of birth <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="date" required value={form.dob} onChange={e => update('dob', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Position applied for <span style={{ color: '#AF7C28' }}>•</span></label>
                      <select required value={form.position} onChange={e => update('position', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel">
                        <option value="">Select a role</option>
                        <option>Security Officer — Static Site</option>
                        <option>Security Officer — Mobile Patrol</option>
                        <option>Door Supervisor</option>
                        <option>CCTV / Control Room Operator</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Home address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.address} onChange={e => update('address', e.target.value)} rows={3} placeholder="House number and street" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.postcode} onChange={e => update('postcode', e.target.value)} placeholder="e.g. EC1A 1BB" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Telephone</label>
                      <input type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Mobile <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.mobile} onChange={e => update('mobile', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">National Insurance number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.niNumber} onChange={e => update('niNumber', e.target.value)} placeholder="QQ 12 34 56 C" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">SIA licence number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.siaLicence} onChange={e => update('siaLicence', e.target.value)} placeholder="SIA licence number" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Driving</legend>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Do you hold a valid driving licence? <span style={{ color: '#AF7C28' }}>•</span></label>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update('hasDrivingLicence', val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.hasDrivingLicence === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form.hasDrivingLicence === 'yes' && (
                      <div className="mt-3 p-4 rounded-lg border-l-2 bg-panel-2" style={{ borderColor: '#AF7C28' }}>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Driving licence number</label>
                        <input type="text" value={form.drivingLicenceNumber} onChange={e => update('drivingLicenceNumber', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Education & certification</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Secondary school / college / university attended</label>
                      <input type="text" value={form.education} onChange={e => update('education', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Foreign languages spoken <span className="text-faint font-normal">(select all that apply)</span></label>
                      <LanguageSelect value={form.languages} onChange={v => update('languages', v)} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-secondary mb-2">First aid training certificate?</label>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update('hasFirstAid', val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.hasFirstAid === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form.hasFirstAid === 'no' && <p className="mt-2 text-xs text-faint">No certificate on file yet — you'll be prompted to upload one after submitting this form.</p>}
                  </div>
                </fieldset>
              </div>
            )}

            {current === 1 && (
              <div className="space-y-6">
                {(() => {
                  const { months, hasAny } = coverageYears();
                  const ok = months >= 60;
                  if (!hasAny) return null;
                  return (
                    <div key={popFlash} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${ok && !evidenceError ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}` + (popFlash > 0 && !ok ? ' animate-pop-in' : '')}>
                      <div>
                        <p className={`text-sm font-bold ${ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {ok ? 'Minimum 5 years covered' : 'At least 5 years of activity needed'}
                        </p>
                        <p className={`text-xs mt-0.5 ${ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {ok ? 'Your entries cover the 5-year requirement.' : `Your entries currently cover ${(months / 12).toFixed(1)} of 5 years — add more activities or extend the dates.`}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 text-sm font-bold font-mono ${ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {Math.min(Math.round((months / 60) * 100), 100)}%
                      </span>
                    </div>
                  );
                })()}

                {evidenceError && (
                  <div key="evidence-banner" className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 animate-pop-in">
                    <div>
                      <p className="text-sm font-bold text-rose-600">Evidence required</p>
                      <p className="text-xs text-rose-500 mt-0.5">Upload evidence for every activity before continuing.</p>
                    </div>
                  </div>
                )}

                {activities.map((activity, index) => (
                  <div key={activity.id} className="rounded-xl border border-line bg-panel p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-panel-2 border border-line flex items-center justify-center text-[11px] font-mono font-bold text-secondary">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">Activity {index + 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        disabled={activities.length === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-secondary border border-line hover:border-rose-300 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Type <span style={{ color: '#AF7C28' }}>•</span></label>
                        <select
                          value={activity.type}
                          onChange={e => updateActivity(activity.id, 'type', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel [&>option]:bg-panel"
                        >
                          <option value="education">Education</option>
                          <option value="work">Work</option>
                          <option value="training">Training / Course</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">School / employer / course <span style={{ color: '#AF7C28' }}>•</span></label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={e => updateActivity(activity.id, 'title', e.target.value)}
                          placeholder={activity.type === 'education' ? 'School / college / university' : activity.type === 'work' ? 'Employer / role' : 'Course / provider'}
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-secondary mb-1.5">From (month & year) <span style={{ color: coverageInvalid() ? '#e11d48' : '#AF7C28' }}>•</span></label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(activity.id, 'from')}
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left focus:outline-none focus:border-line-strong bg-panel transition-colors ${activity.from ? 'text-primary' : 'text-faint'} ${picker?.field === 'from' && picker.id === activity.id ? 'border-line-strong' : 'border-line'} ${coverageInvalid() ? 'border-rose-300 bg-rose-50 text-rose-600' : ''}`}
                        >
                          {activity.from ? formatYM(activity.from) : 'Select month & year'}
                        </button>
                        {picker?.field === 'from' && picker.id === activity.id && (
                          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-line bg-panel shadow-lg p-4">
                            {picker.month ? (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, month: null })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{MONTHS[picker.month - 1]} {picker.year}</span>
                                  <span className="w-7"></span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {WEEKDAYS.map(d => <span key={d} className="text-center text-[10px] font-semibold text-faint">{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: (new Date(picker.year, picker.month - 1, 1).getDay() + 6) % 7 }).map((_, i) => <span key={`e${i}`} />)}
                                  {Array.from({ length: new Date(picker.year, picker.month, 0).getDate() }, (_, i) => {
                                    const d = i + 1;
                                    const val = `${picker.year}-${String(picker.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                    const selected = activity.from === val;
                                    return (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={() => { updateActivity(activity.id, 'from', val); setPicker(null); }}
                                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year - 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{picker.year}</span>
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year + 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">›</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {MONTHS.map((m, i) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setPicker({ ...picker, month: i + 1 })}
                                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${activity.from?.startsWith(`${picker.year}-${String(i + 1).padStart(2, '0')}`) ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-secondary mb-1.5">To (month & year) <span style={{ color: coverageInvalid() ? '#e11d48' : '#AF7C28' }}>•</span></label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(activity.id, 'to')}
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left focus:outline-none focus:border-line-strong bg-panel transition-colors ${activity.to ? 'text-primary' : 'text-faint'} ${picker?.field === 'to' && picker.id === activity.id ? 'border-line-strong' : 'border-line'} ${coverageInvalid() ? 'border-rose-300 bg-rose-50 text-rose-600' : ''}`}
                        >
                          {activity.to ? formatYM(activity.to) : 'Select month & year'}
                        </button>
                        {picker?.field === 'to' && picker.id === activity.id && (
                          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-line bg-panel shadow-lg p-4">
                            {picker.month ? (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, month: null })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{MONTHS[picker.month - 1]} {picker.year}</span>
                                  <span className="w-7"></span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {WEEKDAYS.map(d => <span key={d} className="text-center text-[10px] font-semibold text-faint">{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: (new Date(picker.year, picker.month - 1, 1).getDay() + 6) % 7 }).map((_, i) => <span key={`e${i}`} />)}
                                  {Array.from({ length: new Date(picker.year, picker.month, 0).getDate() }, (_, i) => {
                                    const d = i + 1;
                                    const val = `${picker.year}-${String(picker.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                    const selected = activity.to === val;
                                    return (
                                      <button
                                        key={d}
                                        type="button"
                                        onClick={() => { updateActivity(activity.id, 'to', val); setPicker(null); }}
                                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${selected ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                      >
                                        {d}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year - 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">‹</button>
                                  <span className="text-sm font-bold text-primary">{picker.year}</span>
                                  <button type="button" onClick={() => setPicker({ ...picker, year: picker.year + 1 })} className="w-7 h-7 rounded-lg border border-line flex items-center justify-center text-sm text-secondary hover:border-line-strong hover:text-primary transition-colors">›</button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { updateActivity(activity.id, 'to', 'Present'); setPicker(null); }}
                                  className={`w-full mb-2 py-2 rounded-lg text-xs font-medium border transition-colors ${activity.to === 'Present' ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                >
                                  Present
                                </button>
                                <div className="grid grid-cols-3 gap-2">
                                  {MONTHS.map((m, i) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setPicker({ ...picker, month: i + 1 })}
                                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${activity.to?.startsWith(`${picker.year}-${String(i + 1).padStart(2, '0')}`) ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-transparent text-secondary hover:bg-panel-2 hover:text-primary'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Evidence <span style={{ color: '#AF7C28' }}>•</span></label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => {
                                  if (e.target.files && e.target.files[0]) {
                                    const f = e.target.files[0];
                                    if (!ALLOWED_EVIDENCE_TYPES.includes(f.type)) {
                                      showToast('File type not allowed', 'Evidence must be a PDF, JPG, PNG, WebP or Word (.doc/.docx) file.', 'error');
                                      e.target.value = '';
                                      return;
                                    }
                                    if (f.size > MAX_EVIDENCE_BYTES) {
                                      showToast('File too large', 'Evidence files must be 10 MB or smaller.', 'error');
                                      e.target.value = '';
                                      return;
                                    }
                                    updateActivity(activity.id, 'evidence', f.name);
                                    setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, file: f } : a));
                                    setEvidenceError(false);
                                  }
                                }}
                          />
                          <div className={`w-full h-[42px] rounded-lg border border-dashed bg-panel-2 flex items-center justify-center gap-2 px-3 cursor-pointer transition-colors ${evidenceError && !activity.evidence ? 'border-rose-300 bg-rose-50' : 'border-line hover:border-line-strong'}`}>
                            <Upload className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                            <span className={`text-xs truncate ${activity.evidence ? 'font-medium' : 'text-faint'}`} style={activity.evidence ? { color: '#AF7C28' } : {}}>
                              {activity.evidence || 'Upload document'}
                            </span>
                          </div>
                        </div>
                        {evidenceError && !activity.evidence && <p className="mt-1.5 text-[10px] font-medium text-rose-500">Evidence is required for every activity.</p>}
                        <p className="mt-1.5 text-[10px] text-faint">PDF, JPG, PNG, WebP or Word — max 10MB</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact reference — mobile <span className="text-faint font-normal">(optional)</span></label>
                        <input
                          type="tel"
                          value={activity.mobile}
                          onChange={e => updateActivity(activity.id, 'mobile', e.target.value)}
                          placeholder="Mobile number"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1.5">Contact reference — email <span className="text-faint font-normal">(optional)</span></label>
                        <input
                          type="email"
                          value={activity.email}
                          onChange={e => updateActivity(activity.id, 'email', e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addActivity}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-line text-sm font-medium text-secondary hover:text-primary hover:border-line-strong hover:bg-panel-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Activity
                </button>
              </div>
            )}

            {current === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">How long have you lived at your current address? <span style={{ color: '#AF7C28' }}>•</span></label>
                  <select value={form.lenAtAddress} onChange={e => update('lenAtAddress', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel">
                    <option value="">Select</option>
                    <option value="5plus">5 years or more</option>
                    <option value="under5">Less than 5 years</option>
                  </select>
                </div>
                {form.lenAtAddress === 'under5' && (
                  <div className="p-5 rounded-xl border border-line bg-panel-2 space-y-4">
                    <p className="text-xs text-faint">You'll need to provide proof of address for each entry covering the 5-year period.</p>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Previous addresses (most recent first)</label>
                      <textarea value={form.prevAddresses} onChange={e => update('prevAddresses', e.target.value)} rows={5} placeholder="Address 1:\nFrom:\nTo:\n\nAddress 2:\nFrom:\nTo:" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono"></textarea>
                    </div>
                  </div>
                )}
                {form.lenAtAddress === '5plus' && (
                  <div className="p-5 rounded-xl border border-line bg-panel-2">
                    <p className="text-sm text-secondary">Since you've been at your current address 5+ years, no previous addresses are needed.</p>
                  </div>
                )}
              </div>
            )}

            {current === 3 && (
              <div className="space-y-6">
                {[
                  { key: 'q1', label: 'Have you or any immediate family been convicted, fined, imprisoned, placed on probation, discharged on payment of costs, or had any order made against you by a criminal, civil or military court or public authority (excluding minor motoring offences)?', cond: 'q1Details' },
                  { key: 'q2', label: 'Do you have any police cautions?', cond: 'q2Details' },
                  { key: 'q3', label: 'Any prosecutions pending against you?', cond: 'q3Details' },
                  { key: 'q4', label: 'Have you ever been subject to bankruptcy proceedings?', cond: 'q4Details' },
                  { key: 'q5', label: 'Are there any outstanding County Court Judgments for debt?', cond: 'q5Details' },
                  { key: 'q6', label: 'Do you have any relatives working for the company?', cond: 'q6Details' },
                  { key: 'q7', label: 'Do you own a motor vehicle or motorcycle?', cond: 'q7Details' },
                ].map(q => (
                  <div key={q.key} className="p-5 rounded-xl border border-line bg-panel">
                    <label className="block text-sm font-medium text-secondary mb-3">{q.label} <span style={{ color: '#AF7C28' }}>•</span></label>
                    <div className="flex gap-3 mb-3">
                      {['yes', 'no'].map(val => (
                        <button key={val} type="button" onClick={() => update(q.key, val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${form[q.key as keyof typeof form] === val ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-line text-secondary hover:border-line-strong'}`}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </button>
                      ))}
                    </div>
                    {form[q.key as keyof typeof form] === 'yes' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-secondary mb-1.5">Give details</label>
                        <textarea value={form[q.cond as keyof typeof form] as string} onChange={e => update(q.cond, e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {current === 4 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Personal reference 1</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref1Name} onChange={e => update('ref1Name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.ref1Address} onChange={e => update('ref1Address', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref1Postcode} onChange={e => update('ref1Postcode', e.target.value)} placeholder="e.g. W1K 1AH" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Occupation</label>
                      <input type="text" value={form.ref1Occupation} onChange={e => update('ref1Occupation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Known for (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.ref1Known} onChange={e => update('ref1Known', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Personal reference 2</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref2Name} onChange={e => update('ref2Name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.ref2Address} onChange={e => update('ref2Address', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.ref2Postcode} onChange={e => update('ref2Postcode', e.target.value)} placeholder="e.g. N1 2AB" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Occupation</label>
                      <input type="text" value={form.ref2Occupation} onChange={e => update('ref2Occupation', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Known for (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.ref2Known} onChange={e => update('ref2Known', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Next of kin</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokName} onChange={e => update('nokName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.nokAddress} onChange={e => update('nokAddress', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokPostcode} onChange={e => update('nokPostcode', e.target.value)} placeholder="e.g. EC1A 1BB" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Telephone</label>
                      <input type="tel" value={form.nokTelephone} onChange={e => update('nokTelephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Mobile <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.nokMobile} onChange={e => update('nokMobile', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Relationship to you <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.nokRelationship} onChange={e => update('nokRelationship', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Character referee (screening)</legend>
                  <p className="text-xs text-faint mb-4">One person who has known you at least 2 years immediately prior to screening. Not a relative, not a previous employer, not someone at your address — a current or previous colleague is fine.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full name <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.charRefName} onChange={e => update('charRefName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Address <span style={{ color: '#AF7C28' }}>•</span></label>
                      <textarea required value={form.charRefAddress} onChange={e => update('charRefAddress', e.target.value)} rows={2} placeholder="House number and street, town/city" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-1.5">Postcode <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="text" required value={form.charRefPostcode} onChange={e => update('charRefPostcode', e.target.value)} placeholder="e.g. SW1 1AA" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Full telephone number <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="tel" required value={form.charRefTelephone} onChange={e => update('charRefTelephone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1.5">Length of time known (years) <span style={{ color: '#AF7C28' }}>•</span></label>
                      <input type="number" min="2" required value={form.charRefKnown} onChange={e => update('charRefKnown', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {current === 5 && (
              <div className="space-y-6">
                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">What gets checked</legend>
                  <div className="space-y-4">
                    {[
                      { title: 'Financial history', tag: 'CREDIT CHECK', desc: 'Required for all applicants under BS 7858. Results may be shared with credit reference agencies.' },
                      { title: 'Right to work', tag: 'UK / NON-UK', desc: 'UK nationals: passport check. Non-UK nationals: passport plus visa/permit verification.' },
                      { title: 'Sanctions & terrorism check', tag: 'GLOBAL', desc: 'Cross-referenced against UK sanctions lists and global watch lists.' },
                    ].map(item => (
                      <div key={item.title} className="p-5 rounded-xl border border-line bg-panel-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-primary text-sm">{item.title}</h4>
                          <span className="text-[10px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-panel border border-line text-secondary">{item.tag}</span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Criminal offences</legend>
                  <p className="text-xs text-faint mb-3">Convictions that are legally 'spent' under the Rehabilitation of Offenders Act 1974 do not need to be declared.</p>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Give full details of any unspent criminal proceedings, if applicable</label>
                  <textarea value={form.criminalDetails} onChange={e => update('criminalDetails', e.target.value)} rows={4} placeholder="Leave blank if not applicable" className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel"></textarea>
                </fieldset>

                <fieldset className="border-none p-0">
                  <legend className="text-sm font-bold text-primary uppercase tracking-wider pb-3 border-b border-line w-full mb-4">Conditional employment</legend>
                  <div className="p-5 rounded-xl border border-line bg-panel-2">
                    <p className="text-xs text-secondary leading-relaxed">Uniguard may offer a role on a conditional basis while remaining references are verified — this period runs for no longer than 12 weeks. Failing to meet screening standards during that window ends the conditional offer.</p>
                  </div>
                </fieldset>
              </div>
            )}

            {current === 6 && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl border border-line bg-panel-2 max-h-[230px] overflow-y-auto">
                  <p className="text-xs text-secondary leading-[1.8]">
                    I certify that to the best of my knowledge, the information I have given in this application is true and complete, and I understand that any false statement or omission may render this application void or lead to termination of employment without notice. I authorise the company to approach government agencies, former employers, current employees, educational establishments, criminal justice agencies and personal referees for verification purposes. I consent to the company's processing of personal data — including financial, credit reference, and (where relevant) medical information — for the purpose of establishing my fitness and eligibility for this role, in line with the Data Protection Act 2018 and BS 7858 screening and vetting standards. I confirm that any documents I provide as proof of identity or address are genuine and may be examined under UV or similar verification devices.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree1" checked={form.agree1} onChange={e => update('agree1', e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-amber-600" />
                  <label htmlFor="agree1" className="text-sm text-secondary cursor-pointer">I have read and understood the declaration above, and I agree to the company's processing of my data for screening purposes.</label>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree2" checked={form.agree2} onChange={e => update('agree2', e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-amber-600" />
                  <label htmlFor="agree2" className="text-sm text-secondary cursor-pointer">I confirm the information provided in this application is accurate and complete to the best of my knowledge.</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Print name <span style={{ color: '#AF7C28' }}>•</span></label>
                  <input type="text" required value={form.printName} onChange={e => update('printName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-line-strong bg-panel" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Signature <span style={{ color: '#AF7C28' }}>•</span></label>
                  <div
                    onClick={() => { if (!form.printName) return; update('signature', form.printName); }}
                    className={`w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-sm cursor-pointer transition-all ${form.signature ? 'border-amber-400 text-primary font-bold text-lg' : 'border-line text-faint hover:border-line-strong'}`}
                    style={form.signature ? { borderStyle: 'solid', fontFamily: "'Oswald', sans-serif" } : {}}
                  >
                    {form.signature || (form.printName ? 'Click to sign with your typed name' : 'Enter your printed name first')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Date</label>
                  <input type="text" value={form.sigDate || new Date().toLocaleDateString('en-GB')} disabled className="w-full px-4 py-2.5 rounded-lg border border-line text-sm bg-panel-2 text-faint" />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-line">
              <button onClick={back} disabled={current === 0} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-secondary border border-line hover:border-line-strong transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {current < steps.length - 1 ? (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ backgroundColor: '#AF7C28' }}>
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 max-w-sm text-right animate-pop-in">{submitError}</p>
                  )}
                  <button onClick={handleSubmit} disabled={!form.agree1 || !form.agree2 || !form.printName || submitting} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: '#AF7C28' }}>
                    {submitting ? 'Submitting…' : 'Submit application'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
