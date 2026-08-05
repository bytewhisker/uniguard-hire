import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { BarChart3, TrendingUp } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { applicants } = useRecruitment();

  const totalApplicants = applicants.length;
  const readyOrHired = applicants.filter(a => a.currentStage === 'ready_for_contract' || a.currentStage === 'contract_sent' || a.currentStage === 'hired').length;
  const conversionRate = totalApplicants > 0 ? Math.round((readyOrHired / totalApplicants) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span>Vetting & Recruitment Analytics</span>
        </h2>
        <p className="text-xs text-secondary">
          UK manual vetting performance, audit stats, and licence risk reports
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Avg Vetting Turnaround Time</div>
          <div className="text-2xl font-bold text-primary font-mono">2.8 Days</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>0.4 days faster than UK industry avg</span>
          </div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Vetting Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">92.4%</div>
          <div className="text-[11px] text-tertiary">Based on 5-item check protocol</div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Recruitment Conversion</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{conversionRate}%</div>
          <div className="text-[11px] text-tertiary">Applied to Ready/Hired ratio</div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">SIA Licence Expiry Risk</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">1 Guard</div>
          <div className="text-[11px] text-amber-400/80">Requires renewal check in 30 days</div>
        </div>
      </div>

      {/* Vetting Check Type Breakdown Table */}
      <div className="linear-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-primary">Verification Check Type Performance</h3>
        <div className="space-y-3 text-xs">
          {[
            { name: 'Right to Work (UK Portal)', approved: 14, pending: 2, rejected: 0, portal: 'gov.uk/prove-right-to-work' },
            { name: 'SIA Public Register Check', approved: 12, pending: 4, rejected: 1, portal: 'services.sia.homeoffice.gov.uk' },
            { name: '5-Year Reference Audit', approved: 10, pending: 5, rejected: 1, portal: 'Internal Protocol' },
            { name: 'Credit Check (Experian)', approved: 9, pending: 6, rejected: 0, portal: 'experian.co.uk' },
            { name: 'Companies House Search', approved: 11, pending: 4, rejected: 0, portal: 'company-information.service.gov.uk' },
          ].map(row => (
            <div key={row.name} className="p-4 rounded-xl bg-panel border border-line flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary">{row.name}</div>
                <div className="text-[11px] text-tertiary">{row.portal}</div>
              </div>
              <div className="flex items-center gap-6 font-mono">
                <div className="text-emerald-400">âœ“ {row.approved} Approved</div>
                <div className="text-amber-400">â³ {row.pending} Pending</div>
                <div className="text-rose-400">âœ— {row.rejected} Rejected</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
