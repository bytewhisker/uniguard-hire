import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Briefcase, MapPin, PoundSterling, Users, ShieldCheck, Plus } from 'lucide-react';

interface JobsViewProps {
  onOpenCreateJob: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onOpenCreateJob }) => {
  const { jobs, applicants, setActivePage, setSelectedStageFilter } = useRecruitment();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>Security Job Listings ({jobs.length})</span>
          </h2>
          <p className="text-xs text-secondary">
            Active guard vacancies, required SIA licence types, and applicant tallies
          </p>
        </div>

        <button
          onClick={onOpenCreateJob}
          className="px-4 py-2 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/25"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => {
          const jobApplicants = applicants.filter(a => a.appliedJobId === job.id);
          const readyCount = jobApplicants.filter(a => a.currentStage === 'ready_for_contract').length;

          return (
            <div key={job.id} className="linear-card p-6 rounded-2xl space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {job.department}
                    </span>
                    <h3 className="text-base font-bold text-primary group-hover:text-[#AF7C28] transition-colors mt-1.5">
                      {job.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                    job.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-panel-2 text-secondary border-line-strong'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                {/* Details Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <MapPin className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#AF7C28] font-mono font-bold">
                    <PoundSterling className="w-3.5 h-3.5 text-[#AF7C28] shrink-0" />
                    <span>Â£{job.payRate.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{job.siaRequirement}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{job.employmentType}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Applicant Tally Footer */}
              <div className="pt-4 border-t border-line flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-secondary">
                  <span className="font-mono font-semibold text-primary">{jobApplicants.length} Applicants</span>
                  {readyCount > 0 && (
                    <span className="text-emerald-400 text-[11px] font-semibold">{readyCount} Ready</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedStageFilter('all');
                    setActivePage('applicants');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary text-xs transition-colors"
                >
                  View Applicants
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
