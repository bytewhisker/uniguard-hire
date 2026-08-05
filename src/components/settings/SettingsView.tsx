import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Settings as SettingsIcon, ShieldCheck, Building } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast } = useRecruitment();

  const [companyName, setCompanyName] = useState('Uniguard Security Services UK Ltd');
  const [siaAcsApproved, setSiaAcsApproved] = useState(true);
  const [companyNumber, setCompanyNumber] = useState('09823412');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'UK security company profile & vetting rules updated.', 'success');
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-secondary" />
          <span>System & Vetting Configuration</span>
        </h2>
        <p className="text-xs text-secondary">
          UK security recruitment compliance rules, company accreditation, and verification checklist options
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Company Info */}
        <div className="linear-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>UK Security Firm Profile</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-secondary mb-1">Company Registered Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-secondary mb-1">Companies House Reg No.</label>
              <input
                type="text"
                value={companyNumber}
                onChange={e => setCompanyNumber(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-panel border border-line">
            <div>
              <div className="font-semibold text-primary">SIA Approved Contractor Scheme (ACS)</div>
              <div className="text-[11px] text-tertiary">Show SIA ACS accreditation badge on recruitment emails</div>
            </div>
            <button
              type="button"
              onClick={() => setSiaAcsApproved(!siaAcsApproved)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${siaAcsApproved ? 'bg-emerald-500' : 'bg-panel-2'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-page transition-transform ${siaAcsApproved ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Manual Vetting Rules Config */}
        <div className="linear-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Vetting Checklist Mandatory Rules</span>
          </h3>
          <p className="text-secondary">
            Define which verification checks are strictly required before an applicant automatically transitions to "Ready for Contract".
          </p>

          <div className="space-y-3">
            {[
              { id: 'rightToWork', label: 'Right to Work (UK Passport / GOV Share Code)', desc: 'Mandatory by Home Office regulations', req: true },
              { id: 'siaLicence', label: 'SIA Public Licence Verification', desc: 'Mandatory by Security Industry Authority', req: true },
              { id: 'references', label: '5-Year Employment & Character References', desc: 'BS7858 Standard compliance', req: true },
              { id: 'creditCheck', label: 'Credit Check (Experian / Equifax)', desc: 'Optional for standard guarding roles', req: false },
              { id: 'companiesHouse', label: 'Companies House Search', desc: 'Optional for self-employed contractors', req: false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-panel border border-line">
                <div>
                  <div className="font-medium text-primary">{item.label}</div>
                  <div className="text-[11px] text-tertiary">{item.desc}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold ${
                  item.req ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-panel-2 text-secondary'
                }`}>
                  {item.req ? 'REQUIRED' : 'OPTIONAL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-lg shadow-emerald-950/40"
          >
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};
