import React, { useMemo } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { BarChart3 } from 'lucide-react';

const CHECK_META: { key: string; name: string; portal: string }[] = [
  { key: 'right_to_work', name: 'Right to Work (UK Portal)', portal: 'gov.uk/prove-right-to-work' },
  { key: 'sia_licence', name: 'SIA Public Register Check', portal: 'services.sia.homeoffice.gov.uk' },
  { key: 'references', name: '5-Year Reference Audit', portal: 'Internal Protocol' },
  { key: 'credit_check', name: 'Credit Check (Experian)', portal: 'experian.co.uk' },
  { key: 'companies_house', name: 'Companies House Search', portal: 'company-information.service.gov.uk' },
];

export const ReportsView: React.FC = () => {
  const { applicants, employees } = useRecruitment();

  const totalApplicants = applicants.length;
  const readyOrHired = applicants.filter(a => a.currentStage === 'ready_for_contract' || a.currentStage === 'contract_sent' || a.currentStage === 'hired').length;
  const conversionRate = totalApplicants > 0 ? Math.round((readyOrHired / totalApplicants) * 100) : 0;

  const passRate = useMemo(() => {
    let approved = 0;
    let rejected = 0;
    applicants.forEach(a => a.vettingChecks.forEach(c => {
      if (c.status === 'approved') approved += 1;
      if (c.status === 'rejected') rejected += 1;
    }));
    const decided = approved + rejected;
    return decided > 0 ? Math.round((approved / decided) * 1000) / 10 : 0;
  }, [applicants]);

  const pendingChecks = useMemo(
    () => applicants.reduce((sum, a) => sum + a.vettingChecks.filter(c => c.status === 'pending').length, 0),
    [applicants]
  );

  const expiringLicences = useMemo(
    () => employees.filter(emp => {
      const expiry = new Date(emp.siaLicenceExpiry);
      if (isNaN(expiry.getTime())) return false;
      const days = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 30;
    }),
    [employees]
  );

  const breakdown = useMemo(
    () => CHECK_META.map(meta => {
      let approved = 0;
      let pending = 0;
      let rejected = 0;
      applicants.forEach(a => a.vettingChecks.forEach(c => {
        if (c.type !== meta.key) return;
        if (c.status === 'approved') approved += 1;
        else if (c.status === 'rejected') rejected += 1;
        else pending += 1;
      }));
      return { ...meta, approved, pending, rejected };
    }),
    [applicants]
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#AF7C28]" />
          <span>Vetting & Recruitment Analytics</span>
        </h2>
        <p className="text-xs text-secondary">
          UK manual vetting performance, audit stats, and licence risk reports
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Vetting Pass Rate</div>
          <div className="text-2xl font-bold text-[#AF7C28] font-mono">{passRate}%</div>
          <div className="text-[11px] text-tertiary">Approved vs rejected across all checks</div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Pending Security Checks</div>
          <div className="text-2xl font-bold text-primary font-mono">{pendingChecks}</div>
          <div className="text-[11px] text-tertiary">Outstanding across the active pipeline</div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">Recruitment Conversion</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{conversionRate}%</div>
          <div className="text-[11px] text-tertiary">Applied to Ready/Hired ratio</div>
        </div>

        <div className="linear-card p-5 rounded-2xl space-y-2">
          <div className="text-xs font-medium text-secondary">SIA Licence Expiry Risk</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{expiringLicences.length}</div>
          <div className="text-[11px] text-amber-400/80">
            {expiringLicences.length === 0
              ? 'No licences expiring in the next 30 days'
              : expiringLicences.length === 1
                ? 'Licence expiring in the next 30 days'
                : 'Licences expiring in the next 30 days'}
          </div>
        </div>
      </div>

      {/* Vetting Check Type Breakdown Table */}
      <div className="linear-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-primary">Verification Check Type Performance</h3>
        <div className="space-y-3 text-xs">
          {breakdown.map(row => (
            <div key={row.key} className="p-4 rounded-xl bg-panel border border-line flex items-center justify-between">
              <div>
                <div className="font-semibold text-primary">{row.name}</div>
                <div className="text-[11px] text-tertiary">{row.portal}</div>
              </div>
              <div className="flex items-center gap-6 font-mono">
                <div className="text-[#AF7C28]">✓ {row.approved} Approved</div>
                <div className="text-amber-400">⏳ {row.pending} Pending</div>
                <div className="text-rose-400">✕ {row.rejected} Rejected</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};