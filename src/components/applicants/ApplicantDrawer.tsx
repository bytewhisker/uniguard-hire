import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  User, 
  Calendar, 
  Send, 
  UserCheck, 
  Download,
  Star
} from 'lucide-react';
import type { VettingCheckType, CheckStatus, ApplicationStage } from '../../types/recruitment';

export const ApplicantDrawer: React.FC = () => {
  const { 
    selectedApplicant, 
    setSelectedApplicant, 
    updateCheckStatus, 
    sendContract, 
    convertToEmployee,
    updateApplicantStage,
    showToast
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'vetting' | 'personal' | 'interview' | 'audit'>('vetting');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  if (!selectedApplicant) return null;

  const applicant = selectedApplicant;

  const handleNoteChange = (checkType: VettingCheckType, notes: string) => {
    setEditingNotes(prev => ({ ...prev, [checkType]: notes }));
  };

  const handleSaveCheck = (checkType: VettingCheckType, status: CheckStatus) => {
    const currentCheck = applicant.vettingChecks.find(c => c.type === checkType);
    const noteValue = editingNotes[checkType] !== undefined ? editingNotes[checkType] : (currentCheck?.notes || '');
    updateCheckStatus(applicant.id, checkType, status, noteValue);
  };

  // Check stats
  const approvedChecksCount = applicant.vettingChecks.filter(c => c.status === 'approved').length;
  const totalChecks = applicant.vettingChecks.length;
  const requiredChecks = applicant.vettingChecks.filter(c => c.isRequired);
  const requiredApprovedCount = requiredChecks.filter(c => c.status === 'approved').length;
  const allRequiredApproved = requiredApprovedCount === requiredChecks.length;

  const stageLabels: Record<ApplicationStage, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: 'bg-panel-2', text: 'text-primary' },
    under_review: { label: 'Under Review', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
    interview_scheduled: { label: 'Interview Scheduled', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400' },
    interview_completed: { label: 'Interview Completed', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' },
    vetting_in_progress: { label: 'Vetting in Progress', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
    ready_for_contract: { label: 'Ready for Contract', bg: 'bg-emerald-500/20 border-emerald-500/50', text: 'text-emerald-400' },
    contract_sent: { label: 'Contract Sent', bg: 'bg-teal-500/20 border-teal-500/40', text: 'text-teal-300' },
    hired: { label: 'Hired Employee', bg: 'bg-emerald-500 text-zinc-950 font-bold', text: 'text-zinc-950' },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-page border-l border-line h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Bar / Header */}
        <div className="p-6 border-b border-line bg-panel-dim space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {applicant.avatarUrl ? (
                <img 
                  src={applicant.avatarUrl} 
                  alt={applicant.fullName} 
                  className="w-12 h-12 rounded-full object-cover border border-line-strong shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-panel-2 border border-line-strong flex items-center justify-center font-bold text-lg text-primary">
                  {applicant.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  {applicant.fullName}
                  {applicant.employeeId && (
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ID: {applicant.employeeId}
                    </span>
                  )}
                </h2>
                <div className="text-xs text-secondary flex items-center gap-2">
                  <span>{applicant.appliedJobTitle}</span>
                  <span>•</span>
                  <span className="font-mono text-primary">SIA: {applicant.siaLicenceNo} ({applicant.siaLicenceSector})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedApplicant(null)}
              className="text-secondary hover:text-primary p-2 rounded-xl bg-panel border border-line transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Stage Indicator & Pipeline Progress */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stageLabels[applicant.currentStage].bg} ${stageLabels[applicant.currentStage].text}`}>
                {stageLabels[applicant.currentStage].label}
              </span>
            </div>

            {/* Ready for Contract Action Button */}
            {applicant.currentStage === 'ready_for_contract' && (
              <button
                onClick={() => sendContract(applicant.id)}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 animate-bounce"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Employment Contract</span>
              </button>
            )}

            {applicant.currentStage === 'contract_sent' && (
              <button
                onClick={() => convertToEmployee(applicant.id)}
                className="px-4 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mark Contract Signed (Convert to Employee)</span>
              </button>
            )}
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-line">
            <button
              onClick={() => setActiveTab('vetting')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'vetting'
                  ? 'bg-panel-2 text-primary border border-line-strong'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verification Checklist ({approvedChecksCount}/{totalChecks})</span>
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'personal'
                  ? 'bg-panel-2 text-primary border border-line-strong'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Details & Docs ({applicant.documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'interview'
                  ? 'bg-panel-2 text-primary border border-line-strong'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Interview Info</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: VERIFICATION CHECKLIST (THE CORE USER REQUIREMENT) */}
          {activeTab === 'vetting' && (
            <div className="space-y-6">
              
              {/* Ready for Contract Banner */}
              {allRequiredApproved && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs glow-emerald">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                      —
                    </div>
                    <div>
                      <div className="font-bold text-emerald-300 text-sm">All Required Vetting Checks Approved!</div>
                      <div className="text-primary text-[11px]">
                        Right to Work, SIA Licence, and 5-Year References are verified. Candidate is cleared for contract.
                      </div>
                    </div>
                  </div>

                  {applicant.currentStage !== 'contract_sent' && applicant.currentStage !== 'hired' && (
                    <button
                      onClick={() => sendContract(applicant.id)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shrink-0"
                    >
                      Send Contract
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-secondary">
                <span>Manual Admin Vetting Protocol (5 Items)</span>
                <span className="font-mono text-primary">
                  {approvedChecksCount} of {totalChecks} Checks Passed
                </span>
              </div>

              {/* The 5 Verification Checks List */}
              <div className="space-y-4">
                {applicant.vettingChecks.map((check) => {
                  const noteValue = editingNotes[check.type] !== undefined 
                    ? editingNotes[check.type] 
                    : (check.notes || '');

                  const isApproved = check.status === 'approved';
                  const isRejected = check.status === 'rejected';
                  const isPending = check.status === 'pending';

                  return (
                    <div
                      key={check.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        isApproved
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : isRejected
                          ? 'bg-rose-950/15 border-rose-500/30'
                          : 'bg-panel border-line'
                      }`}
                    >
                      {/* Check Item Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isApproved && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            {isRejected && <XCircle className="w-5 h-5 text-rose-400" />}
                            {isPending && <Clock className="w-5 h-5 text-amber-400" />}
                          </div>

                          <div>
                            <div className="font-semibold text-sm text-primary flex items-center gap-2">
                              <span>{check.title}</span>
                              {check.isRequired ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-panel-2 text-secondary border border-line-strong">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-panel-2-dim text-tertiary">
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-secondary mt-0.5">{check.description}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : isRejected
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                      </div>

                      {/* External Portal Quick Link */}
                      {check.externalUrl && check.externalUrl !== '#' && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-tertiary">Admin Portal Check Link:</span>
                          <a
                            href={check.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-medium text-[11px]"
                          >
                            <span>Open UK Verification Site</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Admin Notes Field */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-secondary">
                          Admin Notes & Findings:
                        </label>
                        <textarea
                          rows={2}
                          placeholder={`Enter notes regarding ${check.title} verification results...`}
                          value={noteValue}
                          onChange={e => handleNoteChange(check.type, e.target.value)}
                          className="w-full linear-input rounded-xl p-3 text-xs leading-relaxed"
                        />
                      </div>

                      {/* Verification Status Action Buttons (Approve & Reject) */}
                      <div className="flex items-center justify-between pt-2 border-t border-line">
                        <div className="text-[11px] text-tertiary">
                          {check.verifiedBy ? (
                            <span>Verified by {check.verifiedBy} on {check.verifiedAt}</span>
                          ) : (
                            <span>Not yet verified</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleSaveCheck(check.type, 'approved')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isApproved
                                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-950/40'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleSaveCheck(check.type, 'rejected')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isRejected
                                ? 'bg-rose-500 text-white font-bold'
                                : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          {/* Reset to Pending */}
                          {!isPending && (
                            <button
                              onClick={() => handleSaveCheck(check.type, 'pending')}
                              className="px-2.5 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-secondary text-[11px]"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS & DOCUMENTS */}
          {activeTab === 'personal' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-panel border border-line">
                <div>
                  <span className="text-tertiary block">Full Name:</span>
                  <span className="font-semibold text-primary text-sm">{applicant.fullName}</span>
                </div>
                <div>
                  <span className="text-tertiary block">Email Address:</span>
                  <span className="text-primary">{applicant.email}</span>
                </div>
                <div>
                  <span className="text-tertiary block">Phone Number:</span>
                  <span className="text-primary">{applicant.phone}</span>
                </div>
                <div>
                  <span className="text-tertiary block">National Insurance No:</span>
                  <span className="font-mono text-emerald-400">{applicant.nationalInsuranceNo}</span>
                </div>
                <div>
                  <span className="text-tertiary block">SIA Licence No:</span>
                  <span className="font-mono text-amber-400">{applicant.siaLicenceNo} ({applicant.siaLicenceSector})</span>
                </div>
                <div>
                  <span className="text-tertiary block">SIA Licence Expiry:</span>
                  <span className="text-primary font-mono">{applicant.siaLicenceExpiry}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-tertiary block">UK Address:</span>
                  <span className="text-primary">{applicant.address}, {applicant.postcode}</span>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-primary text-sm flex items-center justify-between">
                  <span>Uploaded Applicant Documents ({applicant.documents.length})</span>
                </h3>

                <div className="space-y-2">
                  {applicant.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-panel border border-line flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <div>
                          <div className="font-medium text-primary">{doc.name}</div>
                          <div className="text-[11px] text-tertiary">
                            Uploaded {doc.uploadedAt} • {doc.size}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => showToast('Downloading Document', `Downloading ${doc.name}`, 'info')}
                        className="p-2 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW INFORMATION */}
          {activeTab === 'interview' && (
            <div className="space-y-6 text-xs">
              {applicant.interview ? (
                <div className="p-5 rounded-2xl bg-panel border border-line space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <h3 className="font-bold text-primary text-sm">Interview Status</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      applicant.interview.completed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {applicant.interview.completed ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-tertiary block">Date & Time:</span>
                      <span className="font-semibold text-primary">{applicant.interview.scheduledDate} at {applicant.interview.scheduledTime}</span>
                    </div>
                    <div>
                      <span className="text-tertiary block">Interviewer:</span>
                      <span className="text-primary">{applicant.interview.interviewerName}</span>
                    </div>
                    <div>
                      <span className="text-tertiary block">Location / Meeting Link:</span>
                      <span className="text-primary">{applicant.interview.locationOrLink}</span>
                    </div>
                    <div>
                      <span className="text-tertiary block">Type:</span>
                      <span className="text-primary capitalize">{applicant.interview.interviewType.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {applicant.interview.rating && (
                    <div>
                      <span className="text-tertiary block mb-1">Interview Assessment Rating:</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (applicant.interview?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-faint'}`}
                          />
                        ))}
                        <span className="ml-2 font-mono text-primary">({applicant.interview.rating}/5)</span>
                      </div>
                    </div>
                  )}

                  {applicant.interview.notes && (
                    <div className="space-y-1 pt-2 border-t border-line">
                      <span className="text-tertiary block">Interviewer Notes:</span>
                      <p className="text-primary leading-relaxed bg-page p-3 rounded-xl border border-line">
                        {applicant.interview.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-line rounded-2xl space-y-3">
                  <Calendar className="w-8 h-8 text-faint mx-auto" />
                  <div className="text-secondary font-medium">No Interview Scheduled</div>
                  <button
                    onClick={() => {
                      updateApplicantStage(applicant.id, 'interview_scheduled');
                      showToast('Interview Prompt', 'Use the calendar or schedule button to set interview details.', 'info');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs transition-colors"
                  >
                    Schedule Interview Now
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-line bg-panel-dim flex items-center justify-between">
          <button
            onClick={() => {
              updateApplicantStage(applicant.id, 'rejected');
              setSelectedApplicant(null);
            }}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors"
          >
            Reject Applicant
          </button>

          <button
            onClick={() => setSelectedApplicant(null)}
            className="px-4 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary font-semibold text-xs transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
