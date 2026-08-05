import React, { useState, useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Search, User, Briefcase, CheckSquare, ShieldCheck, X } from 'lucide-react';
import type { ActivePage } from '../../types/recruitment';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    applicants, 
    jobs, 
    setSelectedApplicant, 
    setActivePage 
  } = useRecruitment();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredApplicants = query ? applicants.filter(a => 
    a.fullName.toLowerCase().includes(query.toLowerCase()) ||
    a.email.toLowerCase().includes(query.toLowerCase()) ||
    a.siaLicenceNo.includes(query) ||
    a.appliedJobTitle.toLowerCase().includes(query.toLowerCase())
  ) : applicants.slice(0, 4);

  const filteredJobs = query ? jobs.filter(j => 
    j.title.toLowerCase().includes(query.toLowerCase()) ||
    j.location.toLowerCase().includes(query.toLowerCase())
  ) : jobs.slice(0, 3);

  const navigateToPage = (page: ActivePage) => {
    setActivePage(page);
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-panel border border-line-strong rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-line gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a candidate name, SIA licence #, job title, or command..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-primary placeholder-zinc-500 focus:outline-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)} 
            className="text-tertiary hover:text-primary p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Pages */}
          {!query && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-tertiary uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => navigateToPage('dashboard')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2-dim text-primary text-left transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Dashboard Overview</span>
                </button>
                <button
                  onClick={() => navigateToPage('applicants')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2-dim text-primary text-left transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Applicants & Vetting</span>
                </button>
                <button
                  onClick={() => navigateToPage('jobs')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2-dim text-primary text-left transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Jobs Directory</span>
                </button>
                <button
                  onClick={() => navigateToPage('employees')}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-panel-2-dim text-primary text-left transition-colors"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Hired Employees</span>
                </button>
              </div>
            </div>
          )}

          {/* Applicants */}
          {filteredApplicants.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-tertiary uppercase tracking-wider">
                Applicants ({filteredApplicants.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredApplicants.map(applicant => (
                  <button
                    key={applicant.id}
                    onClick={() => {
                      setSelectedApplicant(applicant);
                      setActivePage('applicants');
                      setIsCommandPaletteOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-panel-2 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-medium text-xs text-primary">
                        {applicant.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-primary group-hover:text-primary">
                          {applicant.fullName}
                        </div>
                        <div className="text-[11px] text-tertiary">
                          {applicant.appliedJobTitle} • SIA: {applicant.siaLicenceNo}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-panel-2 text-secondary border border-line-strong capitalize">
                      {applicant.currentStage.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-tertiary uppercase tracking-wider">
                Jobs ({filteredJobs.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredJobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setActivePage('jobs');
                      setIsCommandPaletteOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-panel-2 text-left transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-primary group-hover:text-primary">
                        {job.title}
                      </div>
                      <div className="text-[11px] text-tertiary">
                        {job.location} • £{job.payRate.toFixed(2)}/hr
                      </div>
                    </div>
                    <span className="text-xs text-secondary font-mono">
                      {job.applicantsCount} applicants
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-line bg-page-dim flex items-center justify-between text-[11px] text-tertiary">
          <span>Press <kbd className="px-1.5 py-0.5 bg-panel-2 rounded text-primary font-mono">ESC</kbd> to close</span>
          <span>Uniguard Vetting Engine MVP</span>
        </div>
      </div>
    </div>
  );
};
