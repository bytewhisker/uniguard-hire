import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  UserCheck, 
  BarChart3, 
  Settings,
  Search,
  CheckCircle2,
  Globe
} from 'lucide-react';
import type { ActivePage } from '../../types/recruitment';

export const Sidebar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    applicants, 
    setIsCommandPaletteOpen 
  } = useRecruitment();

  const pendingChecksCount = applicants.filter(a => 
    a.currentStage === 'vetting_in_progress' || 
    a.vettingChecks.some(c => c.status === 'pending')
  ).length;

  const readyForContractCount = applicants.filter(a => 
    a.currentStage === 'ready_for_contract'
  ).length;

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'jobs', 
      label: 'Jobs', 
      icon: <Briefcase className="w-4 h-4" /> 
    },
    { 
      id: 'applicants', 
      label: 'Applicants', 
      icon: <Users className="w-4 h-4" />, 
      badge: readyForContractCount > 0 ? readyForContractCount : (pendingChecksCount > 0 ? pendingChecksCount : undefined),
      badgeColor: readyForContractCount > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    { 
      id: 'interviews', 
      label: 'Interview Calendar', 
      icon: <Calendar className="w-4 h-4" /> 
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      icon: <UserCheck className="w-4 h-4" /> 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-4 h-4" /> 
    },
    {
      id: 'landing',
      label: 'Careers Landing Page',
      icon: <Globe className="w-4 h-4 text-indigo-400" />
    }
  ];

  return (
    <aside className="w-64 bg-page border-r border-line flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Company Header */}
        <div className="p-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-semibold text-sm text-primary tracking-tight flex items-center gap-1.5">
                Uniguard Hire
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  UK MVP
                </span>
              </div>
              <div className="text-[11px] text-tertiary">Security Vetting Portal</div>
            </div>
          </div>
        </div>

        {/* Global Search Shortcut */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-panel border border-line text-secondary hover:text-primary hover:border-line-strong transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-tertiary" />
              <span>Search or jump...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-panel-2 border border-line-strong text-[10px] font-mono text-secondary">
              âŒ˜K
            </kbd>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
            Menu
          </div>
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-panel-2 text-white border border-line-strong shadow-sm' 
                    : 'text-secondary hover:text-primary hover:bg-panel-dim'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-tertiary'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Manual Vetting Info Box */}
      <div className="p-3 border-t border-line">
        <div className="p-3 rounded-xl bg-panel border border-line text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-[11px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Manual Vetting Tracker</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            Verify applicants on GOV & SIA portals manually, then update check status & notes.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-tertiary">
            <span>SIA ACS Standard</span>
            <span className="text-emerald-400">UK Compliant</span>
          </div>
        </div>

        {/* User Footer */}
        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-bold text-xs text-primary">
              SJ
            </div>
            <div>
              <div className="text-xs font-medium text-primary">Sarah Jenkins</div>
              <div className="text-[10px] text-tertiary">Recruitment Officer</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
