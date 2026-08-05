import React, { useMemo, useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  Inbox, 
  Clock,
  ChevronRight,
  Globe,
  LogOut,
  Info,
  Activity,
  BadgeCheck,
  CalendarDays,
  FileText,
  Ban,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  STAGE_RANK, 
  STAGE_BADGE, 
  STAGE_DOT, 
  STAGE_LABEL, 
  requiredPending, 
  requiredApproved, 
  requiredRejected, 
  requiredTotal 
} from '../common/recruitmentStages';
import { Avatar } from '../common/Avatar';

interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon, iconBg, valueColor, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl bg-panel border border-line text-left transition-all ${
      onClick ? 'hover:border-emerald-500/30 hover:bg-panel cursor-pointer' : 'cursor-default'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</span>
    </div>
    <div className={`text-2xl font-extrabold mt-3 ${valueColor}`}>{value}</div>
    <div className="text-[11px] font-semibold text-primary mt-0.5">{label}</div>
    <div className="text-[10px] text-tertiary mt-0.5 truncate">{hint}</div>
  </button>
);

export const DashboardView: React.FC = () => {
  const { 
    applicants, 
    employees,
    activityLogs,
    setSelectedApplicant, 
    setActivePage,
    logout
  } = useRecruitment();

  const [helpVisible, setHelpVisible] = useState(true);

  const totalApplied = applicants.filter(a => a.currentStage === 'applied').length;
  const totalReview = applicants.filter(a => a.currentStage === 'under_review').length;
  const totalInterview = applicants.filter(a => a.currentStage === 'interview_scheduled' || a.currentStage === 'interview_completed').length;
  const totalVetting = applicants.filter(a => a.currentStage === 'vetting_in_progress').length;
  const totalContract = applicants.filter(a => a.currentStage === 'ready_for_contract' || a.currentStage === 'contract_sent').length;
  const totalHired = applicants.filter(a => a.currentStage === 'hired').length;

  const pendingCheckCount = useMemo(
    () => applicants.reduce((sum, a) => sum + requiredPending(a), 0),
    [applicants]
  );

  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((a, b) => {
      const aPending = requiredPending(a);
      const bPending = requiredPending(b);
      if ((aPending > 0) !== (bPending > 0)) return aPending > 0 ? -1 : 1;
      return (STAGE_RANK[a.currentStage] ?? 99) - (STAGE_RANK[b.currentStage] ?? 99);
    });
  }, [applicants]);

  const attentionQueue = useMemo(() => {
    return applicants
      .filter(a => requiredPending(a) > 0 && a.currentStage !== 'hired' && a.currentStage !== 'rejected' && a.currentStage !== 'contract_sent')
      .sort((a, b) => requiredPending(b) - requiredPending(a) || (STAGE_RANK[a.currentStage] ?? 99) - (STAGE_RANK[b.currentStage] ?? 99))
      .slice(0, 4);
  }, [applicants]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const activityIcon = (action: string) => {
    const t = action.toLowerCase();
    if (t.includes('approved') || t.includes('passed')) return { icon: <BadgeCheck className="w-3.5 h-3.5" />, cls: 'bg-emerald-500/15 text-emerald-400' };
    if (t.includes('reject') || t.includes('failed')) return { icon: <Ban className="w-3.5 h-3.5" />, cls: 'bg-rose-500/15 text-rose-400' };
    if (t.includes('interview')) return { icon: <CalendarDays className="w-3.5 h-3.5" />, cls: 'bg-purple-500/15 text-purple-400' };
    if (t.includes('contract')) return { icon: <FileText className="w-3.5 h-3.5" />, cls: 'bg-sky-500/15 text-sky-400' };
    if (t.includes('hired') || t.includes('employee')) return { icon: <Sparkles className="w-3.5 h-3.5" />, cls: 'bg-indigo-500/15 text-indigo-400' };
    return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-zinc-500/15 text-secondary' };
  };

  const pipeline = [
    { label: 'New', count: totalApplied + totalReview, dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-300' },
    { label: 'Interview', count: totalInterview, dot: 'bg-purple-400', text: 'text-purple-600 dark:text-purple-400' },
    { label: 'Vetting', count: totalVetting, dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Contract', count: totalContract, dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Hired', count: totalHired, dot: 'bg-indigo-400', text: 'text-indigo-600 dark:text-indigo-300' }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">

      {/* ===== Welcome header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-tertiary uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{today}</span>
          </div>
          <h2 className="text-xl font-extrabold text-primary mt-1">Good day, Sarah</h2>
          <p className="text-xs text-secondary mt-0.5">
            Here's where your security candidates stand today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-zinc-950 text-xs font-bold transition-all shadow-md"
          >
            <Globe className="w-4 h-4" />
            <span>Open Careers Page</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-panel hover:bg-panel-2 text-secondary hover:text-rose-400 border border-line text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ===== Pipeline overview ===== */}
      <div className="rounded-2xl bg-panel-dim border border-line p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-primary">Recruitment funnel</div>
          <span className="text-[10px] text-tertiary">Live counts across {applicants.length} applicants</span>
        </div>
        <div className="flex flex-wrap items-center gap-y-3">
          {pipeline.map((step, i) => (
            <React.Fragment key={step.label}>
              <button
                onClick={() => step.label !== 'Hired' ? setActivePage('applicants') : setActivePage('employees')}
                className="flex items-center gap-2 pr-3 mr-1 group"
              >
                <span className={`w-2 h-2 rounded-full ${step.dot} group-hover:scale-125 transition-transform`}></span>
                <span className="text-[11px] text-tertiary group-hover:text-primary transition-colors">{step.label}</span>
                <span className={`text-sm font-bold ${step.text}`}>{step.count}</span>
              </button>
              {i < pipeline.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-faint mr-1" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== Key stats ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New applicants"
          value={totalApplied}
          hint="Fresh web-form submissions"
          icon={<Inbox className="w-4 h-4 text-sky-400" />}
          iconBg="bg-sky-500/15"
          valueColor="text-primary"
          onClick={() => setActivePage('applicants')}
        />
        <StatCard
          label="Vetting queue"
          value={totalVetting}
          hint={`${pendingCheckCount} required checks pending`}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          iconBg="bg-amber-500/15"
          valueColor="text-amber-400"
          onClick={() => setActivePage('applicants')}
        />
        <StatCard
          label="Ready for contract"
          value={totalContract}
          hint="Booked & contract-sent stages"
          icon={<FileText className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-500/15"
          valueColor="text-emerald-400"
          onClick={() => setActivePage('applicants')}
        />
        <StatCard
          label="Hired staff"
          value={totalHired}
          hint={`${employees.length} active on roster`}
          icon={<UserCheck className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-500/15"
          valueColor="text-indigo-300"
          onClick={() => setActivePage('employees')}
        />
      </div>

      {/* ===== Main two-column layout ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: Candidate pipeline list */}
        <div className="xl:col-span-2 rounded-2xl bg-panel-dim border border-line overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Candidate pipeline
              </h3>
              <p className="text-xs text-tertiary mt-0.5">Click any candidate to manage checks, interviews, and contracts.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-2 text-secondary border border-line-strong">
              {applicants.length} profiles
            </span>
          </div>

          {applicants.length === 0 ? (
            <div className="p-12 text-center text-tertiary text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-faint" />
              <p>No candidates found in local storage database.</p>
              <p className="text-[11px] text-faint">Go to the Careers Page to submit an application form!</p>
            </div>
          ) : (
            <div className="divide-y divide-line/70">
              {sortedApplicants.map(applicant => {
                const pending = requiredPending(applicant);
                const ok = requiredApproved(applicant);
                const total = requiredTotal(applicant);
                const pct = total === 0 ? 0 : Math.round((ok / total) * 100);
                const barColor = requiredRejected(applicant) > 0 ? 'bg-rose-500' : pending > 0 ? 'bg-amber-400' : 'bg-emerald-500';
                const stage = applicant.currentStage;

                return (
                  <div
                    key={applicant.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplicant(applicant)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedApplicant(applicant); }}
                    className="w-full p-4 flex items-start md:items-center gap-4 hover:bg-panel-2-dim transition-colors text-left group cursor-pointer"
                  >
                    <Avatar name={applicant.fullName} url={applicant.avatarUrl} />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-primary group-hover:text-emerald-400 transition-colors truncate">
                          {applicant.fullName}
                        </span>
                        {applicant.currentStage === 'applied' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                            NEW
                          </span>
                        )}
                        {requiredRejected(applicant) > 0 && (
                          <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded font-mono">
                            FLAGGED
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-tertiary truncate">
                        {applicant.appliedJobTitle}
                      </div>

                      <div className="text-[11px] text-secondary flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-mono">{applicant.siaLicenceNo}</span>
                        <span className="text-faint">Â·</span>
                        <span>exp {applicant.siaLicenceExpiry}</span>
                      </div>

                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[10px] text-tertiary">
                          <span>{pending > 0 ? `${pending} required check${pending > 1 ? 's' : ''} left` : ok === total ? 'All required checks passed' : `${ok}/${total} passed`}</span>
                          <span className="font-mono">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-panel-2 overflow-hidden">
                          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${STAGE_BADGE[stage] || 'bg-panel-2'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[stage] || 'bg-zinc-500'}`}></span>
                        {STAGE_LABEL[stage] || stage}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedApplicant(applicant); }}
                        className="px-3 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary border border-line-strong font-bold transition-all text-[11px] flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Needs attention */}
          <div className="rounded-2xl bg-panel-dim border border-line overflow-hidden">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Needs attention
              </h3>
              {attentionQueue.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {pendingCheckCount} check{pendingCheckCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="divide-y divide-line/70">
              {attentionQueue.length === 0 ? (
                <div className="p-6 text-center space-y-1.5">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                  <p className="text-xs text-primary font-semibold">All clear!</p>
                  <p className="text-[11px] text-tertiary">No required vetting checks are awaiting review.</p>
                </div>
              ) : (
                attentionQueue.map(applicant => (
                  <button
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className="w-full p-3.5 flex items-center gap-3 hover:bg-panel-2-dim transition-colors text-left"
                  >
                    <Avatar name={applicant.fullName} url={applicant.avatarUrl} size="w-8 h-8" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">{applicant.fullName}</div>
                      <div className="text-[10px] text-amber-400/90 mt-0.5">
                        {requiredPending(applicant)} required check{requiredPending(applicant) > 1 ? 's' : ''} pending
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-faint" />
                  </button>
                ))
              )}
              {attentionQueue.length > 0 && (
                <button
                  onClick={() => setActivePage('applicants')}
                  className="w-full p-3 text-center text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-panel-2-dim transition-colors font-semibold"
                >
                  View all applicants â†’
                </button>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl bg-panel-dim border border-line overflow-hidden">
            <div className="p-4 border-b border-line">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Recent activity
              </h3>
            </div>
            <div className="divide-y divide-line/70">
              {activityLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-tertiary">
                  No activity recorded yet.
                </div>
              ) : (
                activityLogs.slice(0, 5).map(log => {
                  const meta = activityIcon(log.action);
                  return (
                    <div key={log.id} className="p-3.5 flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.cls}`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-[11px] text-primary leading-snug">{log.action}</p>
                        <p className="text-[10px] text-tertiary">{log.applicantName} Â· {log.timestamp}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Help banner ===== */}
      {helpVisible && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-secondary flex-1">
            <div className="font-semibold text-primary">Manual checks, done right</div>
            <p className="leading-relaxed">
              Verify each candidate's SIA licence and Right to Work on the official GOV.UK / SIA portals, then
              click <strong className="text-primary">Approve</strong> or <strong className="text-primary">Reject</strong> inside their card to log compliance.
            </p>
          </div>
          <button
            onClick={() => setHelpVisible(false)}
            className="text-tertiary hover:text-primary transition-colors shrink-0"
            aria-label="Dismiss"
          >
            âœ•
          </button>
        </div>
      )}
    </div>
  );
};