import React, { useEffect } from 'react';
import {
  X,
  Lightbulb,
  Inbox,
  Eye,
  CalendarDays,
  ShieldCheck,
  FileText,
  UserCheck,
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Plus,
  Sun,
  Globe,
  ArrowRight,
  MousePointerClick,
  KeyRound,
  Zap
} from 'lucide-react';

interface HowItWorksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIPELINE_STEPS = [
  {
    icon: <Inbox className="w-4 h-4" />,
    title: 'New Application',
    action: 'Form submitted on the careers page',
    iconBg: 'bg-slate-500/15 text-slate-500 dark:text-slate-300 border-slate-500/25'
  },
  {
    icon: <Eye className="w-4 h-4" />,
    title: 'Review',
    action: 'You check the CV & SIA details',
    iconBg: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/25'
  },
  {
    icon: <CalendarDays className="w-4 h-4" />,
    title: 'Interview',
    action: 'You book & complete the interview',
    iconBg: 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/25'
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    title: 'Vetting',
    action: 'You approve checks on GOV/SIA portals',
    iconBg: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/25'
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: 'Contract',
    action: 'You send the employment contract',
    iconBg: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/25'
  },
  {
    icon: <UserCheck className="w-4 h-4" />,
    title: 'Hired',
    action: 'Candidate becomes an employee',
    iconBg: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/25'
  }
];

const SECTIONS = [
  { icon: <LayoutDashboard className="w-4 h-4" />, title: 'Dashboard', desc: 'Your home screen. See the funnel, spot candidates needing attention, and jump into work.' },
  { icon: <Briefcase className="w-4 h-4" />, title: 'Jobs', desc: 'Post and manage security vacancies. New jobs go live on the careers page.' },
  { icon: <Users className="w-4 h-4" />, title: 'Applicants', desc: 'Search, filter and manage every candidate. This is where vetting happens.' },
  { icon: <Calendar className="w-4 h-4" />, title: 'Interview Calendar', desc: 'See all booked interviews at a glance and schedule new ones.' },
  { icon: <UserCheck className="w-4 h-4" />, title: 'Employees', desc: 'Your hired roster — badge numbers, sites, SIA licence expiry dates.' },
  { icon: <BarChart3 className="w-4 h-4" />, title: 'Reports', desc: 'Pass rates and compliance analytics for audits.' },
  { icon: <Settings className="w-4 h-4" />, title: 'Settings', desc: 'Company details and vetting checklist configuration.' }
];

const QUICK_ACTIONS = [
  { icon: <Plus className="w-4 h-4" />, iconBg: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400', title: 'Quick Action button', desc: 'Top-right of the header — post a new job or add an applicant without leaving your page.' },
  { icon: <Search className="w-4 h-4" />, iconBg: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400', title: 'Search & jump (⌘K)', desc: 'Press Ctrl/⌘ + K anywhere to search candidates, jobs and pages instantly.' },
  { icon: <Sun className="w-4 h-4" />, iconBg: 'bg-amber-500/15 text-amber-500 dark:text-amber-400', title: 'Theme toggle', desc: 'Switch between light and dark mode any time — your choice is remembered.' },
  { icon: <MousePointerClick className="w-4 h-4" />, iconBg: 'bg-sky-500/15 text-sky-500 dark:text-sky-400', title: 'Click any candidate', desc: 'Every name in the lists opens a drawer with their checks, documents and interview info.' },
  { icon: <Globe className="w-4 h-4" />, iconBg: 'bg-purple-500/15 text-purple-500 dark:text-purple-400', title: 'Open Careers Page', desc: 'See the public job board exactly as applicants see it.' }
];

export const HowItWorksPanel: React.FC<HowItWorksPanelProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-panel border border-line-strong rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-line flex items-start justify-between gap-4 sticky top-0 bg-panel z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-primary">How this dashboard works</h2>
              <p className="text-xs text-secondary mt-0.5">
                Your hiring pipeline in 5 minutes — where to go, what each button does.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-panel-2 border border-line text-secondary hover:text-primary transition-colors shrink-0"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* 1. Pipeline graphic */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-primary">The hiring pipeline at a glance</h3>
            </div>
            <p className="text-[11px] text-secondary mb-4">
              Every candidate moves through these stages left to right. You do the action shown under each step.
            </p>
            <div className="flex flex-wrap items-stretch gap-2">
              {PIPELINE_STEPS.map((step, i) => (
                <React.Fragment key={step.title}>
                  <div className="flex-1 min-w-[120px] rounded-xl border border-line-strong bg-panel-2 p-3 text-center">
                    <div className={`w-9 h-9 mx-auto rounded-lg border flex items-center justify-center ${step.iconBg}`}>
                      {step.icon}
                    </div>
                    <div className="text-[11px] font-bold text-primary mt-2">{step.title}</div>
                    <div className="text-[10px] text-tertiary mt-0.5 leading-snug">{step.action}</div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-faint" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-600 dark:text-amber-400">
              <strong>Important:</strong> Uniguard is a manual system. During the Vetting step, verify each check on the
              official GOV.UK / SIA websites, then click Approve or Reject inside the candidate's card.
            </div>
          </section>

          {/* 2. Where to go for what */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-primary">Where to go for what</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SECTIONS.map(section => (
                <div key={section.title} className="p-4 rounded-xl border border-line bg-panel-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {section.icon}
                    </span>
                    <span className="text-xs font-bold text-primary">{section.title}</span>
                  </div>
                  <p className="text-[11px] text-tertiary mt-2 leading-relaxed">{section.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Quick actions explained */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MousePointerClick className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-primary">Handy buttons explained</h3>
            </div>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map(action => (
                <div key={action.title} className="flex items-start gap-3 p-3.5 rounded-xl border border-line bg-panel-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.iconBg}`}>
                    {action.icon}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-primary">{action.title}</div>
                    <div className="text-[11px] text-tertiary mt-0.5 leading-relaxed">{action.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-line flex items-center justify-between gap-3">
          <p className="text-[11px] text-tertiary">Tip: press <kbd className="px-1.5 py-0.5 rounded bg-panel-2 border border-line-strong font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-panel-2 border border-line-strong font-mono">K</kbd> to jump anywhere.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
