import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { supabase } from '../../lib/supabase';
import type { ApplicantDocument, VettingCheckType, CheckStatus, ApplicationStage } from '../../types/recruitment';
import { Avatar } from '../common/Avatar';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  User, 
  Calendar, 
  Send, 
  UserCheck, 
  Download, 
  Star, 
  Undo2, 
  Ban,
  RotateCcw
} from 'lucide-react';

export const ApplicantDrawer: React.FC = () => {
  const { 
    selectedApplicant, 
    setSelectedApplicant, 
    applicants,
    updateCheckStatus, 
    sendContract, 
    convertToEmployee,
    fireEmployee,
    updateApplicantStage,
    scheduleInterviewLive,
    showToast
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'vetting' | 'personal' | 'interview'>('vetting');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('10:00');
  const [draftDuration] = useState(45);
  const [draftLocation, setDraftLocation] = useState('Video Call (link to follow)');
  const [draftNotes] = useState('');

  if (!selectedApplicant) return null;

  const applicant = applicants.find(a => a.id === selectedApplicant.id) || selectedApplicant;

  const handleScheduleConfirm = () => {
    if (!draftDate) {
      showToast('Date Required', 'Pick an interview date first.', 'error');
      return;
    }
    const scheduledAt = new Date(`${draftDate}T${draftTime || '10:00'}`).toISOString();
    scheduleInterviewLive(applicant.id, scheduledAt, draftDuration, draftLocation, draftNotes || undefined);
    setShowScheduleModal(false);
  };

  const handleDownload = async (doc: ApplicantDocument) => {
    try {
      if (!supabase) return showToast('Error', 'Backend not configured', 'error');
      if (doc.fileUrl.startsWith('http')) return window.open(doc.fileUrl, '_blank');
      const { data, error } = await supabase.storage.from('evidence').createSignedUrl(doc.fileUrl, 300, { download: true });
      if (error || !data) throw error;
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.click();
    } catch {
      showToast('Download Failed', 'Could not fetch file download link.', 'error');
    }
  };

  const handleSaveCheck = (checkType: VettingCheckType, status: CheckStatus) => {
    const currentCheck = applicant.vettingChecks.find(c => c.type === checkType);
    const noteValue = editingNotes[checkType] !== undefined ? editingNotes[checkType] : (currentCheck?.notes || '');
    updateCheckStatus(applicant.id, checkType, status, noteValue);
  };

  const approvedCount = applicant.vettingChecks.filter(c => c.status === 'approved').length;
  const totalCount = applicant.vettingChecks.length;
  const requiredChecks = applicant.vettingChecks.filter(c => c.isRequired);
  const allRequiredApproved = requiredChecks.length > 0 && requiredChecks.every(c => c.status === 'approved');

  const stageLabels: Record<ApplicationStage, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: 'bg-panel-2', text: 'text-primary' },
    under_review: { label: 'Under Review', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-500' },
    interview_scheduled: { label: 'Interview Scheduled', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-500' },
    interview_completed: { label: 'Interview Completed', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-500' },
    vetting_in_progress: { label: 'Vetting in Progress', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-500' },
    ready_for_contract: { label: 'Ready for Contract', bg: 'bg-emerald-500/20 border-emerald-500/50', text: 'text-emerald-600' },
    contract_sent: { label: 'Contract Sent', bg: 'bg-teal-500/20 border-teal-500/40', text: 'text-teal-600' },
    hired: { label: 'Hired Employee', bg: 'bg-emerald-500 text-white font-bold', text: 'text-white' },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-500' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedApplicant(null)}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-page border border-line-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-line bg-panel-dim space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Avatar name={applicant.fullName} url={applicant.avatarUrl} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  {applicant.fullName}
                  {applicant.employeeId && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#AF7C28]/20 text-[#AF7C28] border border-[#AF7C28]/40">
                      Roster ID: {applicant.employeeId}
                    </span>
                  )}
                </h2>
                <div className="text-xs text-secondary flex items-center gap-2 mt-0.5">
                  <span>{applicant.appliedJobTitle}</span>
                  <span>•</span>
                  <span className="font-mono text-tertiary">SIA: {applicant.siaLicenceNo || 'N/A'}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedApplicant(null)} className="text-secondary hover:text-primary p-2 rounded-xl bg-panel border border-line transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row & Stage Status */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Pipeline Stage:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stageLabels[applicant.currentStage]?.bg} ${stageLabels[applicant.currentStage]?.text}`}>
                {stageLabels[applicant.currentStage]?.label || applicant.currentStage}
              </span>
            </div>

            {/* Lifecycle Buttons */}
            <div className="flex items-center gap-2">
              {applicant.currentStage === 'ready_for_contract' && (
                <button onClick={() => sendContract(applicant.id)} className="px-4 py-2 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
                  <Send className="w-3.5 h-3.5" /> Send Contract
                </button>
              )}

              {applicant.currentStage === 'contract_sent' && (
                <button onClick={() => convertToEmployee(applicant.id)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                  <UserCheck className="w-3.5 h-3.5" /> Mark Signed & Add to Roster
                </button>
              )}

              {applicant.currentStage === 'hired' && (
                <button onClick={() => fireEmployee(applicant.id)} className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-500 font-semibold text-xs flex items-center gap-1.5 transition-all">
                  <Undo2 className="w-3.5 h-3.5" /> Revert Hire
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-line">
            <button
              onClick={() => setActiveTab('vetting')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'vetting' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <ShieldCheck className="w-4 h-4 text-[#AF7C28]" />
              Vetting Protocol ({approvedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'personal' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <User className="w-4 h-4 text-indigo-500" />
              Personal Details & Docs ({applicant.documents.length})
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'interview' ? 'bg-panel-2 text-primary border border-line-strong' : 'text-secondary hover:text-primary'}`}
            >
              <Calendar className="w-4 h-4 text-purple-500" />
              Interview Info
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: VETTING CHECKLIST */}
          {activeTab === 'vetting' && (
            <div className="space-y-4">
              {allRequiredApproved && applicant.currentStage !== 'hired' && applicant.currentStage !== 'contract_sent' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-600 text-sm">All Mandatory Vetting Checks Passed!</div>
                      <div className="text-secondary text-[11px]">Candidate is cleared for contract issuance.</div>
                    </div>
                  </div>
                  {applicant.currentStage !== 'ready_for_contract' && (
                    <button onClick={() => updateApplicantStage(applicant.id, 'ready_for_contract')} className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500">
                      Set Ready for Contract
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {applicant.vettingChecks.map(check => {
                  const noteValue = editingNotes[check.type] !== undefined ? editingNotes[check.type] : (check.notes || '');
                  const isApproved = check.status === 'approved';
                  const isRejected = check.status === 'rejected';
                  const isPending = check.status === 'pending';

                  return (
                    <div 
                      key={check.id} 
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isApproved ? 'bg-emerald-500/5 border-emerald-500/30' : isRejected ? 'bg-rose-500/5 border-rose-500/30' : 'bg-panel border-line'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-primary flex items-center gap-2">
                            <span>{check.title}</span>
                            {check.isRequired ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30 font-semibold">Mandatory Check</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-panel-2 text-tertiary">Optional Check</span>
                            )}
                          </div>
                          <p className="text-xs text-secondary mt-1">{check.description}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' : isRejected ? 'bg-rose-500/20 text-rose-600 border-rose-500/40' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}>
                          {check.status}
                        </span>
                      </div>

                      {check.externalUrl && check.externalUrl !== '#' && (
                        <a href={check.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#AF7C28] hover:underline font-semibold">
                          Verify on Official UK SIA Public Register <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-secondary block">Verification Notes & Findings:</label>
                        <textarea
                          rows={2}
                          placeholder="Enter admin verification findings or license details..."
                          value={noteValue}
                          onChange={e => setEditingNotes(prev => ({ ...prev, [check.type]: e.target.value }))}
                          className="w-full linear-input rounded-xl p-2.5 text-xs"
                        />
                      </div>

                      {/* Approval Action Buttons with Distinct States */}
                      <div className="flex items-center justify-between pt-2 border-t border-line">
                        <span className="text-[11px] text-tertiary">
                          {check.verifiedBy ? `Verified by ${check.verifiedBy} on ${check.verifiedAt}` : 'Not yet verified'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveCheck(check.type, 'approved')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isApproved 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isApproved ? 'Approved ✓' : 'Approve'}
                          </button>

                          <button
                            onClick={() => handleSaveCheck(check.type, 'rejected')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isRejected 
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500' 
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isRejected ? 'Rejected ✗' : 'Reject'}
                          </button>

                          {!isPending && (
                            <button 
                              onClick={() => handleSaveCheck(check.type, 'pending')} 
                              className="px-3 py-1.5 rounded-xl bg-panel-2 hover:bg-panel-3 text-secondary text-xs flex items-center gap-1"
                              title="Reset check to pending"
                            >
                              <RotateCcw className="w-3 h-3" /> Reset
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

          {/* TAB 2: PERSONAL & DOCS */}
          {activeTab === 'personal' && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-panel border border-line">
                <div><span className="text-tertiary block">Full Name:</span> <span className="text-primary font-bold text-sm">{applicant.fullName}</span></div>
                <div><span className="text-tertiary block">Email Address:</span> <span className="text-primary font-medium">{applicant.email}</span></div>
                <div><span className="text-tertiary block">Phone Number:</span> <span className="text-primary">{applicant.phone || 'N/A'}</span></div>
                <div><span className="text-tertiary block">National Insurance No:</span> <span className="font-mono text-emerald-600 font-bold">{applicant.nationalInsuranceNo || 'N/A'}</span></div>
                <div><span className="text-tertiary block">SIA Licence No:</span> <span className="font-mono text-amber-600 font-bold">{applicant.siaLicenceNo || 'N/A'} ({applicant.siaLicenceSector})</span></div>
                <div><span className="text-tertiary block">UK Address:</span> <span className="text-primary">{applicant.address}, {applicant.postcode}</span></div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-primary text-sm">Uploaded Documents ({applicant.documents.length})</h4>
                {applicant.documents.map(doc => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-panel border border-line flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-primary font-semibold">{doc.name}</div>
                        <div className="text-[11px] text-tertiary">Uploaded {doc.uploadedAt} • {doc.size}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(doc)} className="px-3 py-1.5 rounded-lg bg-panel-2 hover:bg-panel-3 text-primary text-xs flex items-center gap-1.5 font-semibold">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW INFO */}
          {activeTab === 'interview' && (
            <div className="space-y-5 text-xs">
              {applicant.interview ? (
                <div className="p-5 rounded-2xl bg-panel border border-line space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-line">
                    <span className="font-bold text-primary text-sm">Scheduled Interview Details</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${applicant.interview.completed ? 'bg-emerald-500/20 text-emerald-600' : 'bg-purple-500/20 text-purple-600'}`}>
                      {applicant.interview.completed ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-secondary">
                    <div><span className="text-tertiary block">Date & Time:</span> <span className="text-primary font-bold">{applicant.interview.scheduledDate} at {applicant.interview.scheduledTime}</span></div>
                    <div><span className="text-tertiary block">Location / Link:</span> <span className="text-primary font-medium">{applicant.interview.locationOrLink}</span></div>
                  </div>
                  {applicant.interview.rating && (
                    <div className="flex items-center gap-1 text-amber-500 pt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (applicant.interview?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-faint'}`} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-line rounded-2xl space-y-3">
                  <Calendar className="w-8 h-8 text-faint mx-auto" />
                  <p className="text-secondary font-medium">No interview currently scheduled.</p>
                  <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">
                    Schedule Interview Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-line bg-panel-dim flex items-center justify-between">
          {applicant.currentStage !== 'rejected' ? (
            <button onClick={() => { updateApplicantStage(applicant.id, 'rejected'); setSelectedApplicant(null); }} className="px-4 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-rose-600 font-bold text-xs flex items-center gap-2">
              <Ban className="w-4 h-4" /> Reject Applicant
            </button>
          ) : (
            <button onClick={() => updateApplicantStage(applicant.id, 'under_review')} className="px-4 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary text-xs font-semibold">
              Re-open Application Review
            </button>
          )}

          <button onClick={() => setSelectedApplicant(null)} className="px-5 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary font-bold text-xs">
            Close Window
          </button>
        </div>

      </div>

      {/* Schedule Interview Sub-Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-page border border-line-strong rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-primary text-base">Schedule Interview — {applicant.fullName}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Interview Date</label>
                <input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
              <div>
                <label className="text-secondary font-semibold block mb-1">Time</label>
                <input type="time" value={draftTime} onChange={e => setDraftTime(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
              <div>
                <label className="text-secondary font-semibold block mb-1">Location or Video Call Link</label>
                <input type="text" value={draftLocation} onChange={e => setDraftLocation(e.target.value)} className="w-full linear-input rounded-xl p-2.5 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded-xl bg-panel-2 hover:bg-panel-3 text-primary text-xs font-semibold">Cancel</button>
              <button onClick={handleScheduleConfirm} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
