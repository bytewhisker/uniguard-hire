import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  UserCheck, 
  BarChart3, 
  Settings,
  Search,
  CheckCircle2,
  MessageSquare,
  X
} from 'lucide-react';
import type { ActivePage } from '../../types/recruitment';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activePage, 
    setActivePage, 
    applicants, 
    setIsCommandPaletteOpen,
    unreadAdminCount
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
      badgeColor: readyForContractCount > 0 ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' : 'bg-amber-500/20 text-amber-600 border-amber-500/40'
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
      id: 'chat', 
      label: 'Candidate Chat', 
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadAdminCount > 0 ? unreadAdminCount : undefined,
      badgeColor: 'bg-[#AF7C28] text-white border-[#AF7C28]'
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
    }
  ];

  const asideContent = (
    <>
      <div>
        <div className="p-4 border-b border-line flex items-center justify-between">
          <button onClick={() => { setActivePage('landing'); onCloseMobile(); }} className="flex flex-col items-start cursor-pointer">
            <img src="/uniguardlogo.png" alt="Uniguard Security" className="h-8 w-auto object-contain" />
            <span className="text-[9px] font-bold text-secondary tracking-widest uppercase mt-0.5">Security Recruitment</span>
          </button>
          <span className="font-semibold text-[10px] text-[#AF7C28] px-2 py-0.5 rounded bg-[#AF7C28]/10 border border-[#AF7C28]/20 uppercase tracking-wider shrink-0">Admin</span>
          <button onClick={onCloseMobile} className="lg:hidden p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-panel-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
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
              ⌘K
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
                onClick={() => { setActivePage(item.id); onCloseMobile(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-panel-2 text-primary border border-line-strong shadow-sm' 
                    : 'text-secondary hover:text-primary hover:bg-panel-dim'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#AF7C28]' : 'text-tertiary'}>
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
          <div className="flex items-center gap-2 text-[#AF7C28] font-medium text-[11px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Manual Vetting Tracker</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            Verify applicants on GOV & SIA portals manually, then update check status & notes.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-tertiary">
            <span>SIA ACS Standard</span>
            <span className="text-[#AF7C28]">UK Compliant</span>
          </div>
        </div>

        {/* User Footer */}
        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-bold text-xs text-primary">
              UG
            </div>
            <div>
              <div className="text-xs font-medium text-primary">Uniguard</div>
              <div className="text-[10px] text-tertiary">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-page border-r border-line flex-col justify-between shrink-0 h-screen sticky top-0">
        {asideContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-page border-r border-line flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            {asideContent}
          </aside>
        </div>
      )}
    </>
  );
};
