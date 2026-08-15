import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import {
  MapPin, ArrowRight, LogOut, FileText, Clock, CheckCircle, MessageSquare, Send,
  CheckCheck, Check, Calendar, PartyPopper, Inbox, XCircle, Video, Building2, ShieldCheck
} from 'lucide-react';
import { STAGE_BADGE, STAGE_LABEL } from '../common/recruitmentStages';
import type { Applicant } from '../../types/recruitment';

const FLOW_STEPS = [
  { stage: 'applied', label: 'Application Sent', icon: CheckCircle },
  { stage: 'under_review', label: 'Under Review', icon: FileText },
  { stage: 'interview', label: 'Interview', icon: Calendar },
  { stage: 'vetting', label: 'Vetting & Checks', icon: ShieldIcon },
  { stage: 'contract', label: 'Contract', icon: Inbox },
  { stage: 'hired', label: 'Hired', icon: PartyPopper },
];

function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

const flowIndex = (app: Applicant): number => {
  const s = app.currentStage;
  if (s === 'applied') return 0;
  if (s === 'under_review') return 1;
  if (s === 'interview_scheduled' || s === 'interview_completed') return 2;
  if (s === 'vetting_in_progress') return 3;
  if (s === 'ready_for_contract' || s === 'contract_sent') return 4;
  if (s === 'hired') return 5;
  return 0;
};

const StageFlow: React.FC<{ app: Applicant }> = ({ app }) => {
  const idx = flowIndex(app);
  const rejected = app.currentStage === 'rejected';
  const progress = rejected ? 100 : ((idx + 1) / FLOW_STEPS.length) * 100;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Your Progress</span>
        {rejected ? (
          <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Application closed</span>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-600">{Math.round(progress)}% complete</span>
        )}
      </div>
      <div className="flex items-center">
        {FLOW_STEPS.map((step, i) => {
          const done = !rejected && i < idx;
          const current = !rejected && i === idx;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.stage}>
              {i > 0 && (
                <div className={`flex-1 h-0.5 mx-1.5 -mt-5 ${rejected ? 'bg-rose-300' : done ? 'bg-emerald-400' : current ? 'bg-amber-300' : 'bg-line'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    rejected
                      ? 'bg-rose-50 border-rose-300 text-rose-500'
                      : done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : current
                      ? 'bg-amber-400 border-amber-400 text-zinc-900 shadow-lg shadow-amber-400/30 animate-pulse'
                      : 'bg-white border-line text-faint'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight w-16 ${
                  rejected ? 'text-rose-400' : done ? 'text-emerald-600' : current ? 'text-amber-600 font-bold' : 'text-tertiary'
                }`}>
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const InterviewCard: React.FC<{ app: Applicant }> = ({ app }) => {
  const { interviewsByApplication } = useRecruitment();
  const upcoming = interviewsByApplication(app.id).filter(i => !i.completed)[0];

  if (!upcoming) return null;
  const date = new Date(upcoming.scheduledAt);
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  const isVideo = /video|call|zoom|teams|meet/i.test(upcoming.location);

  return (
    <div className="mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50/60">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-purple-700 flex items-center gap-2">
          {isVideo ? <Video className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          Interview Scheduled
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          days < 0 ? 'bg-emerald-100 text-emerald-700' : days === 0 ? 'bg-rose-100 text-rose-600' : days <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {days < 0 ? 'Done ✓' : days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-1">
        <Calendar className="w-4 h-4 text-purple-500" />
        {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        <span className="font-mono">• {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-purple-800/80 mb-1">
        <MapPin className="w-3.5 h-3.5" />
        {upcoming.location} • {upcoming.durationMinutes} min
      </div>
      {upcoming.notes && (
        <p className="text-[11px] text-purple-800/70 bg-white/70 rounded-lg p-2.5 border border-purple-100 leading-relaxed">
          {upcoming.notes}
        </p>
      )}
    </div>
  );
};

const CongratsBanner: React.FC<{ app: Applicant }> = ({ app }) => {
  if (app.currentStage === 'hired') {
    return (
      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 flex items-center gap-4">
        <PartyPopper className="w-8 h-8 shrink-0" />
        <div>
          <div className="font-bold text-base">Congratulations! You're hired! 🎉</div>
          <div className="text-xs text-white/90 mt-0.5">
            {app.employeeId ? `Welcome to the Uniguard team! Your employee ID is ${app.employeeId}.` : 'Welcome to the Uniguard team!'}
            {app.hiredDate && ` Hired on ${app.hiredDate}.`}
          </div>
        </div>
      </div>
    );
  }
  if (app.currentStage === 'contract_sent' || app.currentStage === 'ready_for_contract') {
    return (
      <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
        <Inbox className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <div className="text-sm font-bold text-emerald-800">Contract {app.currentStage === 'contract_sent' ? 'sent to you' : 'on its way'}</div>
          <div className="text-xs text-emerald-700/80">
            {app.currentStage === 'contract_sent'
              ? "Check your email for your employment contract. Once signed, you're officially hired!"
              : 'Your vetting checks passed — our team is preparing your employment contract.'}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const UserChat: React.FC<{ app: Applicant; apps: Applicant[] }> = ({ app, apps }) => {
  const { messagesByApplication, sendMessage, markConversationRead, reloadMessages } = useRecruitment();
  const [draft, setDraft] = useState('');
  const [activeAppId, setActiveAppId] = useState(app.id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeApp = apps.find(a => a.id === activeAppId) || app;
  const msgs = messagesByApplication(activeApp.id);

  useEffect(() => {
    reloadMessages();
  }, []);

  useEffect(() => {
    markConversationRead(activeApp.id, false);
  }, [activeApp.id, msgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(activeApp.id, draft, 'user');
    setDraft('');
  };

  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Split messages into day groups
  const dayGroups: { label: string; items: typeof msgs }[] = [];
  let lastDate = '';
  for (const m of msgs) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDate) {
      lastDate = day;
      dayGroups.push({ label: dayLabel(m.createdAt), items: [] });
    }
    dayGroups[dayGroups.length - 1].items.push(m);
  }

  // First unread admin message index (for a divider)
  const firstUnreadIdx = msgs.findIndex(m => m.sender === 'admin' && !m.readByUser);

  const quickReplies = [
    'Hi! I have a question about my application.',
    'Can I get an update on my application status?',
    'I have a question about my interview.',
    "I'd like to know more about the vetting process.",
  ];

  return (
    <div className="flex flex-col h-[65vh] min-h-[440px] bg-white border border-line rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/60">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#7a5a22] to-[#AF7C28] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            Uniguard Recruitment Team
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-400/90 text-emerald-950 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-white/75 text-[11px] truncate">
            Replies within 1 working day — chat about {activeApp.appliedJobTitle || 'your application'}
          </div>
        </div>
        {apps.length > 1 && (
          <select
            value={activeAppId}
            onChange={e => setActiveAppId(e.target.value)}
            className="bg-white/90 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#7a5a22] outline-none max-w-32"
            title="Switch application"
          >
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.appliedJobTitle || 'Application'}</option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#faf7f1]">
        {msgs.length === 0 && (
          <div className="text-center pt-8 pb-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#AF7C28]/10 border border-[#AF7C28]/20 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#AF7C28]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Start a conversation with our team</p>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                Ask anything about your application, interview, vetting or contract. Pick a suggestion below or type your own message.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {quickReplies.map(q => (
                <button
                  key={q}
                  onClick={() => { setDraft(q); }}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#AF7C28]/30 text-[11px] font-medium text-[#8f6420] hover:bg-[#AF7C28]/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {dayGroups.map(group => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[10px] font-semibold text-tertiary uppercase tracking-wider">{group.label}</span>
              <div className="flex-1 h-px bg-line" />
            </div>
            {group.items.map(m => {
              const mine = m.sender === 'user';
              const isUnreadDivider = !mine && m.id === msgs[firstUnreadIdx]?.id && firstUnreadIdx !== -1;
              return (
                <div key={m.id} className="space-y-1">
                  {isUnreadDivider && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-amber-400/50" />
                      <span className="text-[10px] font-bold text-amber-600">Unread</span>
                      <div className="flex-1 h-px bg-amber-400/50" />
                    </div>
                  )}
                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${mine ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                        mine
                          ? 'bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-primary border border-line rounded-2xl rounded-bl-md'
                      }`}>
                        {m.body}
                        {m.editedAt && <span className={`ml-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-tertiary'}`}>(edited)</span>}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-tertiary ${mine ? 'justify-end' : 'justify-start'}`}>
                        <span>{timeLabel(m.createdAt)}</span>
                        {mine && (m.readByAdmin ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Check className="w-3.5 h-3.5 text-tertiary" />)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-line bg-white flex items-end gap-2.5">
        <textarea
          rows={1}
          placeholder="Type your message... (Enter to send)"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-2xl border border-line bg-[#faf7f1] px-4 py-3 text-[13px] text-primary outline-none focus:border-[#AF7C28]/60 focus:ring-2 focus:ring-[#AF7C28]/15 transition-all resize-none max-h-28 placeholder:text-tertiary"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white text-[13px] font-bold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC = () => {
  const { jobs, publicUser, publicLogout, setActivePage, applicants, messages } = useRecruitment();
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [tab, setTab] = useState<'overview' | 'chat'>('overview');

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const myApplications = applicants.filter(a => a.email === publicUser?.email);
  const myAppIds = useMemo(() => new Set(myApplications.map(a => a.id)), [myApplications]);
  const unreadForMe = messages.filter(m => myAppIds.has(m.applicationId) && m.sender === 'admin' && !m.readByUser).length;

  const sortedApps = useMemo(
    () => [...myApplications].sort((a, b) => b.appliedDate.localeCompare(a.appliedDate)),
    [myApplications]
  );

  const handleApply = () => {
    if (!selectedJob) return;
    setActivePage('apply');
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Top Bar */}
      <header className="border-b border-line bg-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setActivePage('landing')} className="flex items-center gap-3 cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard" className="h-9 w-auto object-contain" />
            <div className="text-left">
              <h1 className="font-bold text-base text-primary leading-none">Uniguard Careers</h1>
              <p className="text-[10px] text-secondary tracking-wider uppercase mt-0.5">Candidate Portal</p>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-primary">{publicUser?.name}</p>
              <p className="text-xs text-secondary">{publicUser?.email}</p>
            </div>
            <button
              onClick={publicLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-secondary border border-line hover:border-line-strong hover:text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-line bg-panel/60 sticky top-[69px] z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              tab === 'overview' ? 'border-[#AF7C28] text-[#8f6420]' : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Application Progress
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              tab === 'chat' ? 'border-[#AF7C28] text-[#8f6420]' : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Message Recruitment Team
            {unreadForMe > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#AF7C28] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadForMe}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {tab === 'chat' ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-primary mb-1">Chat with our recruitment team</h2>
            <p className="text-sm text-secondary mb-6">
              Ask about your application, interview, vetting or contract. Messages are delivered instantly.
            </p>
            {sortedApps.length > 0 ? (
              <UserChat app={sortedApps[0]} apps={sortedApps} />
            ) : (
              <div className="text-center border border-dashed border-line rounded-2xl py-16 space-y-3">
                <MessageSquare className="w-10 h-10 text-faint mx-auto" />
                <p className="text-secondary font-medium">No applications yet</p>
                <p className="text-xs text-tertiary">Submit an application first and you'll be able to message the team here.</p>
                <button
                  onClick={() => setTab('overview')}
                  className="mx-auto mt-2 px-4 py-2 rounded-xl bg-[#AF7C28] text-white text-xs font-bold"
                >
                  Browse Vacancies
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Welcome, {publicUser?.name}</h2>
              <p className="text-secondary -mt-3 mb-2">Track your applications live — status updates and messages appear instantly.</p>

              {sortedApps.length > 0 ? (
                sortedApps.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-line p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h4 className="font-bold text-primary text-base">{app.appliedJobTitle || 'Application'}</h4>
                        <p className="text-xs text-secondary">Submitted {app.appliedDate}</p>
                      </div>
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STAGE_BADGE[app.currentStage] || 'bg-slate-500/15 text-slate-600 border-slate-500/25'}`}>
                        {STAGE_LABEL[app.currentStage] || 'Application Received'}
                      </span>
                    </div>

                    <StageFlow app={app} />
                    <InterviewCard app={app} />
                    <CongratsBanner app={app} />

                    <button
                      onClick={() => setTab('chat')}
                      className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#8f6420] hover:text-[#AF7C28] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message the team about this application
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center border border-dashed border-line rounded-2xl py-14 space-y-3">
                  <FileText className="w-10 h-10 text-faint mx-auto" />
                  <p className="text-secondary font-medium">You haven't submitted any applications yet.</p>
                  <p className="text-xs text-tertiary">Pick a vacancy below and start your application.</p>
                </div>
              )}

              {/* Jobs */}
              <h3 className="text-lg font-bold text-primary flex items-center gap-2 pt-2">
                <FileText className="w-5 h-5" style={{ color: '#AF7C28' }} />
                Active Vacancies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.filter(j => j.status === 'active').map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedJobId === job.id
                        ? 'border-amber-400 bg-amber-50/50'
                        : 'border-line hover:border-line-strong bg-panel'
                    }`}
                  >
                    <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded mb-3" style={{ backgroundColor: 'rgba(175,124,40,0.1)', color: '#8f6420' }}>
                      {job.employmentType}
                    </span>
                    <h4 className="font-bold text-primary mb-2">{job.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                      <MapPin className="w-3.5 h-3.5 text-faint" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                      <span className="text-xs text-secondary">SIA: <span className="font-medium text-primary">{job.siaRequired ? 'Required' : 'Not Required'}</span></span>
                      <span className="text-sm font-bold font-mono" style={{ color: '#AF7C28' }}>£{job.payRate.toFixed(2)}/hr</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl active:scale-[0.98]"
                style={{ backgroundColor: '#AF7C28' }}
              >
                <span>Start Application for {selectedJob?.title}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-panel-2 rounded-xl border border-line p-6">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-faint" />
                  My Applications
                </h3>
                {sortedApps.length === 0 ? (
                  <p className="text-sm text-secondary">You haven't submitted any applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedApps.map(app => (
                      <div key={app.id} className="flex items-start gap-3 p-3 bg-panel rounded-lg border border-line">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          app.currentStage === 'rejected' ? 'text-rose-500' :
                          app.currentStage === 'hired' || app.currentStage === 'contract_sent' || app.currentStage === 'ready_for_contract' ? 'text-emerald-600' : 'text-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-primary">{app.appliedJobTitle || 'Application'}</p>
                          <p className="text-xs text-secondary">Submitted {app.appliedDate}</p>
                          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${STAGE_BADGE[app.currentStage] || 'bg-slate-500/15 text-slate-600 border-slate-500/25'}`}>
                            {STAGE_LABEL[app.currentStage] || 'Application Received'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Help Card */}
              <div className="rounded-xl border p-6" style={{ borderColor: 'rgba(175,124,40,0.2)', backgroundColor: 'rgba(175,124,40,0.04)' }}>
                <h3 className="font-bold text-primary mb-2">Need Help?</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Message us anytime from the chat tab, or email{' '}
                  <span className="font-medium" style={{ color: '#AF7C28' }}>recruitment@uniguard.co.uk</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
