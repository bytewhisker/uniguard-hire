import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { X, Calendar } from 'lucide-react';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApplicantId?: string;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ 
  isOpen, 
  onClose,
  defaultApplicantId 
}) => {
  const { applicants, scheduleInterview } = useRecruitment();

  const [applicantId, setApplicantId] = useState(defaultApplicantId || applicants[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [interviewerName, setInterviewerName] = useState('Sarah Jenkins (Recruitment Lead)');
  const [interviewType, setInterviewType] = useState<'in_person' | 'video' | 'phone'>('video');
  const [locationOrLink, setLocationOrLink] = useState('Google Meet Link: meet.google.com/ug-hire-check');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantId || !scheduledDate || !scheduledTime) return;

    scheduleInterview(applicantId, {
      scheduledDate,
      scheduledTime,
      interviewerName,
      interviewType,
      locationOrLink,
      completed: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-panel border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Schedule Candidate Interview</h2>
              <p className="text-xs text-secondary">Set interview slot for security guard screening</p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-primary font-medium mb-1">Select Candidate *</label>
            <select
              value={applicantId}
              onChange={e => setApplicantId(e.target.value)}
              className="w-full linear-input rounded-xl p-3"
            >
              {applicants.map(a => (
                <option key={a.id} value={a.id}>
                  {a.fullName} — {a.appliedJobTitle} (SIA: {a.siaLicenceNo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Interview Date *</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>
            <div>
              <label className="block text-primary font-medium mb-1">Interview Time *</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium mb-1">Interview Format</label>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value as any)}
                className="w-full linear-input rounded-xl p-3"
              >
                <option value="video">Video Call (Google Meet / Teams)</option>
                <option value="in_person">In-Person (Uniguard HQ)</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            <div>
              <label className="block text-primary font-medium mb-1">Interviewer Name</label>
              <input
                type="text"
                value={interviewerName}
                onChange={e => setInterviewerName(e.target.value)}
                className="w-full linear-input rounded-xl p-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-primary font-medium mb-1">Location or Meeting URL</label>
            <input
              type="text"
              value={locationOrLink}
              onChange={e => setLocationOrLink(e.target.value)}
              className="w-full linear-input rounded-xl p-3"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-panel-2 text-primary font-semibold hover:bg-panel-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold transition-all shadow-lg shadow-purple-950/40"
            >
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
