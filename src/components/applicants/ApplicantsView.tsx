import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  Search, 
  UserPlus, 
  ShieldCheck, 
  ChevronRight, 
  Inbox,
  CheckCircle2
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

interface ApplicantsViewProps {
  onOpenAddApplicant: () => void;
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'applied', label: 'New' },
  { id: 'under_review', label: 'Review' },
  { id: 'interview_scheduled', label: 'Interview' },
  { id: 'vetting_in_progress', label: 'Vetting' },
  { id: 'ready_for_contract', label: 'Contract' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' }
];

export const ApplicantsView: React.FC<ApplicantsViewProps> = ({ onOpenAddApplicant }) => {
  const { 
    applicants, 
    setSelectedApplicant, 
    searchQuery, 
    setSearchQuery, 
    selectedStageFilter, 
    setSelectedStageFilter 
  } = useRecruitment();

  const filteredApplicants = applicants
    .filter(app => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === '' ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.siaLicenceNo.toLowerCase().includes(q) ||
        app.appliedJobTitle.toLowerCase().includes(q);

      const matchesStage = selectedStageFilter === 'all' || app.currentStage === selectedStageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      const aPending = requiredPending(a);
      const bPending = requiredPending(b);
      if ((aPending > 0) !== (bPending > 0)) return aPending > 0 ? -1 : 1;
      return (STAGE_RANK[a.currentStage] ?? 99) - (STAGE_RANK[b.currentStage] ?? 99);
    });

  const filterCount = (id: string) =>
    id === 'all' ? applicants.length : applicants.filter(a => a.currentStage === id).length;

  const pendingTotal = applicants.reduce((sum, a) => sum + requiredPending(a), 0);

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">

      {/* Search + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, SIA licence or job..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full linear-input pl-9 pr-4 py-2.5 rounded-xl text-xs"
          />
        </div>

        <button
          onClick={onOpenAddApplicant}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-950/40 shrink-0"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Applicant</span>
        </button>
      </div>

      {/* Stage filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
        {FILTERS.map(f => {
          const active = selectedStageFilter === f.id;
          const count = filterCount(f.id);
          return (
            <button
              key={f.id}
              onClick={() => setSelectedStageFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap ${
                active
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                  : 'bg-panel text-secondary border-line hover:border-line-strong'
              }`}
            >
              {f.label}
              <span className={`font-mono text-[10px] ${active ? 'text-zinc-800' : 'text-faint'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">Applicants</h3>
        <div className="flex items-center gap-3 text-[11px] text-secondary">
          {pendingTotal > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {pendingTotal} required check{pendingTotal > 1 ? 's' : ''} awaiting review
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All required checks up to date
            </span>
          )}
          <span className="text-faint">{filteredApplicants.length} shown</span>
        </div>
      </div>

      {/* Simple list */}
      {filteredApplicants.length === 0 ? (
        <div className="p-14 text-center text-secondary text-xs space-y-2 rounded-2xl border border-dashed border-line-strong bg-panel">
          <Inbox className="w-8 h-8 mx-auto text-faint" />
          <p className="font-semibold text-primary">No applicants found</p>
          <p>Try a different search, or add a new applicant manually.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-panel border border-line overflow-hidden">
          <div className="divide-line divide-y">
            {filteredApplicants.map(applicant => {
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

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-primary group-hover:text-emerald-500 transition-colors">
                        {applicant.fullName}
                      </span>
                      {stage === 'applied' && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                          NEW
                        </span>
                      )}
                      {requiredRejected(applicant) > 0 && (
                        <span className="text-[9px] bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded font-mono">
                          FLAGGED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-secondary truncate">{applicant.appliedJobTitle}</div>
                    <div className="text-[11px] text-tertiary flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="font-mono">{applicant.siaLicenceNo}</span>
                      <span className="text-faint">·</span>
                      <span>exp {applicant.siaLicenceExpiry}</span>
                    </div>
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[10px] text-tertiary">
                        <span>
                          {pending > 0
                            ? `${pending} required check${pending > 1 ? 's' : ''} left`
                            : ok === total
                              ? 'All required checks passed'
                              : `${ok}/${total} passed`}
                        </span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-panel-2 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${STAGE_BADGE[stage] || 'bg-panel'}`}>
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
        </div>
      )}
    </div>
  );
};
