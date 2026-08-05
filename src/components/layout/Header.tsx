import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Plus, Bell, ChevronRight, UserPlus, Briefcase, Lightbulb, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenCreateJob: () => void;
  onOpenAddApplicant: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateJob, onOpenAddApplicant, onOpenGuide }) => {
  const { activePage, applicants, theme, toggleTheme } = useRecruitment();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const pageTitleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of UK security recruitment & manual vetting pipeline' },
    jobs: { title: 'Security Job Listings', subtitle: 'Active guard vacancies & application tracking' },
    applicants: { title: 'Applicants & Vetting Queue', subtitle: 'Review applications, schedule interviews, and perform manual checks' },
    interviews: { title: 'Interview Calendar', subtitle: 'Scheduled interview slots with security guard candidates' },
    employees: { title: 'Hired Security Staff', subtitle: 'Active employees, badge numbers, and SIA licence expiry tracking' },
    reports: { title: 'Vetting & Recruitment Reports', subtitle: 'Audit statistics, pass rates, and compliance analytics' },
    settings: { title: 'System Settings', subtitle: 'UK security company settings & vetting checklist configuration' },
    landing: { title: 'Careers Portal', subtitle: 'Public security guard job application form' }
  };

  const currentMeta = pageTitleMap[activePage] || { title: activePage, subtitle: '' };

  const pendingChecksCount = applicants.filter(a => 
    a.currentStage === 'vetting_in_progress' || 
    a.vettingChecks.some(c => c.status === 'pending')
  ).length;

  return (
    <header className="h-16 border-b border-line bg-page-dim backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-tertiary">
          <span>Uniguard Hire</span>
          <ChevronRight className="w-3.5 h-3.5 text-faint" />
          <span className="text-primary font-medium capitalize">{activePage}</span>
        </div>
        <h1 className="text-base font-semibold text-primary flex items-center gap-2">
          {currentMeta.title}
        </h1>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        {/* Pending Check Indicator */}
        {pendingChecksCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>{pendingChecksCount} Pending Vetting Check{pendingChecksCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* How it works */}
        <button
          onClick={onOpenGuide}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-panel border border-line text-secondary hover:text-emerald-500 hover:border-emerald-500/40 transition-colors"
          title="How this dashboard works"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-xs font-semibold">How it works</span>
        </button>

        {/* Notification Bell */}
        <button 
          className="relative p-2 rounded-lg bg-panel border border-line text-secondary hover:text-primary transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-panel border border-line text-secondary hover:text-primary transition-colors"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Action</span>
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-panel border border-line rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenCreateJob();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2 text-primary text-left transition-colors"
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Post New Job</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenAddApplicant();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2 text-primary text-left transition-colors"
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Add Applicant</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
