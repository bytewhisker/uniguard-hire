import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { 
  Applicant, 
  Job, 
  Employee, 
  ActivityLog, 
  ActivePage, 
  CheckStatus, 
  VettingCheckType,
  VettingCheckItem,
  ApplicationStage,
  InterviewInfo,
  ChatMessage,
  ScheduledInterview,
  ApplicantDocument
} from '../types/recruitment';
import { 
  INITIAL_APPLICANTS, 
  INITIAL_JOBS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/mockData';
import { supabase, isOAuthRedirect } from '../lib/supabase';
import { STAGE_LABEL } from '../components/common/recruitmentStages';

const VALID_STAGES: ApplicationStage[] = ['applied', 'under_review', 'interview_scheduled', 'interview_completed', 'vetting_in_progress', 'ready_for_contract', 'contract_sent', 'hired', 'rejected'];

const defaultChecks = (id: string): VettingCheckItem[] => [
  { id: `chk-1-${id}`, type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
  { id: `chk-2-${id}`, type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
  { id: `chk-3-${id}`, type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
  { id: `chk-4-${id}`, type: 'credit_check', title: 'Credit Check (Optional)', description: 'Optional financial audit', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
  { id: `chk-5-${id}`, type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://find-and-update.company-information.service.gov.uk' },
];

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message?: string;
}

interface RecruitmentContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  
  pendingJobId: string | null;
  setPendingJobId: (id: string | null) => void;
  
  jobs: Job[];
  applicants: Applicant[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  interviews: ScheduledInterview[];
  messages: ChatMessage[];
  unreadAdminCount: number;
  
  selectedApplicant: Applicant | null;
  setSelectedApplicant: (applicant: Applicant | null) => void;
  
  // Quick filters & search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStageFilter: string;
  setSelectedStageFilter: (stage: string) => void;
  
  // Actions
  updateCheckStatus: (applicantId: string, checkType: VettingCheckType, status: CheckStatus, notes?: string) => void;
  updateApplicantStage: (applicantId: string, stage: ApplicationStage) => void;
  scheduleInterview: (applicantId: string, interview: Omit<InterviewInfo, 'id'>) => void;
  completeInterview: (applicantId: string, notes: string, rating: number, passed: boolean) => void;
  sendContract: (applicantId: string) => void;
  convertToEmployee: (applicantId: string) => void;
  createJob: (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => Promise<void>;
  updateJob: (id: string, jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  addApplicant: (applicantData: Partial<Applicant>) => void;

  // Chat
  sendMessage: (applicationId: string, body: string, sender: 'admin' | 'user') => void;
  editMessage: (messageId: string, body: string) => void;
  deleteMessage: (messageId: string) => void;
  markConversationRead: (applicationId: string, asAdmin: boolean) => void;
  messagesByApplication: (applicationId: string) => ChatMessage[];
  reloadMessages: () => Promise<void>;

  // Interviews (live, persisted)
  scheduleInterviewLive: (applicantId: string, scheduledAt: string, durationMinutes: number, location: string, notes?: string) => void;
  completeInterviewLive: (interviewId: string) => void;
  interviewsByApplication: (applicationId: string) => ScheduledInterview[];
  
  // Toast notifications
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

// Authentication
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Public user auth
  publicUser: { name: string; email: string } | null;
  publicLogin: (email: string, password: string) => Promise<boolean>;
  publicSignup: (name: string, email: string, password: string) => Promise<{ ok: boolean; needsConfirm: boolean }>;
  googleLogin: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  publicLogout: () => void;

  }

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const PAGE_PATHS: Record<string, string> = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  'user-dashboard': '/dashboard',
  apply: '/apply',
  confirm: '/confirm',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  dashboard: '/admin',
  jobs: '/admin/jobs',
  applicants: '/admin/applicants',
  interviews: '/admin/interviews',
  employees: '/admin/employees',
  chat: '/admin/chat',
  reports: '/admin/reports',
  settings: '/admin/settings',
};

const PATH_PAGES: Record<string, string> = {
  '/': 'landing',
  '/login': 'login',
  '/signup': 'signup',
  '/dashboard': 'user-dashboard',
  '/apply': 'apply',
  '/confirm': 'confirm',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
  '/admin': 'dashboard',
  '/admin/jobs': 'jobs',
  '/admin/applicants': 'applicants',
  '/admin/interviews': 'interviews',
  '/admin/employees': 'employees',
  '/admin/chat': 'chat',
  '/admin/reports': 'reports',
  '/admin/settings': 'settings',
};

const pageFromPath = (path: string): ActivePage => (PATH_PAGES[path] || 'landing') as ActivePage;

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePageState] = useState<ActivePage>(() => pageFromPath(window.location.pathname));
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  const setActivePage = (page: ActivePage) => {
    setActivePageState(page);
    const path = PAGE_PATHS[page] || '/admin';
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, '', path);
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setActivePageState(pageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [publicUser, setPublicUser] = useState<{ name: string; email: string } | null>(null);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load applications from Supabase into the admin pipeline
  const supabaseIdsRef = React.useRef<Set<string>>(new Set());
  const jobIdsRef = React.useRef<Set<string>>(new Set());

  const supabaseRowToJob = (row: any): Job => {
    jobIdsRef.current.add(row.id);
    const types: Job['employmentType'][] = ['Full-Time', 'Part-Time', 'Zero-Hours', 'Shift-Based'];
    const statuses: Job['status'][] = ['active', 'draft', 'closed'];
    return {
      id: row.id,
      title: row.title || 'Untitled Role',
      location: row.location || '',
      payRate: Number(row.pay_rate ?? 0),
      employmentType: types.includes(row.employment_type) ? row.employment_type : 'Full-Time',
      siaRequired: !!row.sia_required,
      status: statuses.includes(row.status) ? row.status : 'active',
      createdDate: row.created_date || (row.created_at || '').slice(0, 10),
      description: row.description || '',
      applicantsCount: Number(row.applicants_count ?? 0),
    } as Job;
  };

  const mergeJobs = (incoming: Job[]) => {
    setJobs(prev => {
      const incomingIds = new Set(incoming.map(j => j.id));
      const kept = prev.filter(j => j.id.startsWith('job-') && !incomingIds.has(j.id));
      const byId = new Map(kept.map(j => [j.id, j]));
      incoming.forEach(j => byId.set(j.id, j));
      return [...byId.values()];
    });
  };

  const supabaseRowToApplicant = (row: any): Applicant => {
    const fd = row.form_data || {};
    supabaseIdsRef.current.add(row.id);
    const docs = ((fd.activities || []) as any[])
      .filter((a: any) => a.evidence || a.evidencePath)
      .map((a: any, i: number): ApplicantDocument => ({
        id: `ev-${row.id}-${i}`,
        name: a.evidence ? String(a.evidence).split('/').pop() || 'Evidence document' : 'Evidence document',
        type: 'proof_address',
        fileUrl: a.evidencePath || a.evidence,
        uploadedAt: '',
        size: 'Evidence',
      }));
    return {
      id: row.id,
      fullName: row.full_name || 'New Applicant',
      email: row.applicant_email || '',
      phone: fd.mobile || fd.telephone || '',
      address: fd.address || 'London, UK',
      postcode: fd.postcode || '',
      nationalInsuranceNo: fd.niNumber || '',
      siaLicenceNo: fd.siaLicence || '',
      siaLicenceSector: 'Door Supervision',
      siaLicenceExpiry: '',
      appliedJobId: '',
      appliedJobTitle: row.applied_job || '',
      appliedDate: (row.created_at || '').slice(0, 10),
      currentStage: VALID_STAGES.includes(row.status) ? row.status : 'applied',
      documents: docs,
      vettingChecks: defaultChecks(row.id),
    } as Applicant;
  };

  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const prevStageRef = React.useRef<Record<string, string>>({});
  const publicUserRef = React.useRef(publicUser);
  useEffect(() => { publicUserRef.current = publicUser; }, [publicUser]);

  const supabaseRowToMessage = (m: any): ChatMessage => ({
    id: m.id,
    applicationId: m.application_id,
    sender: m.sender === 'admin' ? 'admin' : 'user',
    body: m.body || '',
    editedAt: m.edited_at || undefined,
    createdAt: m.created_at || new Date().toISOString(),
    readByAdmin: !!m.read_by_admin,
    readByUser: !!m.read_by_user,
  });

  const supabaseRowToInterview = (row: any): ScheduledInterview => ({
    id: row.id,
    applicationId: row.application_id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes ?? 45,
    location: row.location || 'Video Call (link to follow)',
    notes: row.notes || undefined,
    status: row.status || 'scheduled',
    completed: !!row.completed,
  });

  // Reconcile: server rows win for their own ids; db rows missing from the
  // server are dropped; local-only rows (optimistic/mock) are preserved.
  const mergeMessages = (incoming: ChatMessage[]) => {
    setMessages(prev => {
      const incomingIds = new Set(incoming.map(m => m.id));
      const kept = prev.filter(m => m.id.startsWith('local-') || incomingIds.has(m.id));
      const byId = new Map(kept.map(m => [m.id, m]));
      incoming.forEach(m => byId.set(m.id, m));
      return [...byId.values()];
    });
  };

  const reconcileApplicants = (incoming: Applicant[]) => {
    setApplicants(prev => {
      const incomingIds = new Set(incoming.map(a => a.id));
      const incomingEmails = new Set(incoming.map(a => a.email.toLowerCase()));
      const kept = prev.filter(a => {
        if (incomingIds.has(a.id)) return false;
        if (incomingEmails.has(a.email.toLowerCase())) return false;
        if (supabaseIdsRef.current.has(a.id)) return false;
        return true;
      });
      const byId = new Map(kept.map(a => [a.id, a]));
      incoming.forEach(a => byId.set(a.id, a));
      return [...byId.values()];
    });
  };

  // Full refetch of every table — recovery for missed realtime events and
  // the authoritative load whenever the auth session changes.
  const syncAll = React.useCallback(async () => {
    if (!supabase) return;
    try {
      const [apps, msgs, ivs, jobRows] = await Promise.all([
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('interviews').select('*'),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      ]);
      if (apps.data) reconcileApplicants(apps.data.map(supabaseRowToApplicant));
      if (jobRows.data) mergeJobs(jobRows.data.map(supabaseRowToJob));
      if (msgs.data) mergeMessages(msgs.data.map(supabaseRowToMessage));
      if (ivs.data) {
        const incoming = ivs.data.map(supabaseRowToInterview);
        setInterviews(prev => {
          const incomingIds = new Set(incoming.map(i => i.id));
          const kept = prev.filter(i => i.id.startsWith('local-') || incomingIds.has(i.id));
          const byId = new Map(kept.map(i => [i.id, i]));
          incoming.forEach(i => byId.set(i.id, i));
          return [...byId.values()];
        });
        
        // Ensure applicants have their interview attached
        setApplicants(prevApps => prevApps.map(app => {
          const matchingIv = incoming.find(i => i.applicationId === app.id);
          if (matchingIv) {
            const d = new Date(matchingIv.scheduledAt);
            return {
              ...app,
              interview: {
                id: matchingIv.id,
                scheduledDate: d.toISOString().slice(0, 10),
                scheduledTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                interviewerName: 'Uniguard Recruitment',
                locationOrLink: matchingIv.location,
                interviewType: matchingIv.location.toLowerCase().includes('video') ? 'video' : 'in_person',
                completed: matchingIv.completed,
                notes: matchingIv.notes,
                rating: 0
              }
            };
          }
          return app;
        }));
      }
    } catch {
      // offline — keep local state
    }
  }, []);

  // Auth-aware live sync: channels + refetch are (re)created every time the
  // session changes, so RLS-filtered rows actually arrive after login.
  const authKey = `${publicUser?.email ?? ''}|${isAuthenticated}`;
  useEffect(() => {
    let disposed = false;
    const client = supabase;
    if (!client) return;
    const fetchAll = () => { if (!disposed) syncAll(); };

    fetchAll();

    // Live: new applications appear instantly without refreshing
    const channels = [
      client
        .channel('applications-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, (payload) => {
          const app = supabaseRowToApplicant(payload.new as any);
          setApplicants(prev => prev.some(a => a.id === app.id) ? prev : [app, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, (payload) => {
          const row = payload.new as any;
          if (!supabaseIdsRef.current.has(row.id)) return;
          setApplicants(prev => prev.map(a => a.id === row.id && VALID_STAGES.includes(row.status)
            ? { ...a, currentStage: row.status, fullName: row.full_name || a.fullName, appliedJobTitle: row.applied_job || a.appliedJobTitle }
            : a));
          // Notify the candidate in real time when their status changes
          if (publicUserRef.current && row.applicant_email === publicUserRef.current.email && VALID_STAGES.includes(row.status)) {
            const prevStatus = prevStageRef.current[row.id];
            if (prevStatus !== row.status) {
              const label = STAGE_LABEL[row.status] || row.status;
              const type = row.status === 'hired' ? 'success' : row.status === 'rejected' ? 'error' : 'info';
              showToast('Application Update', `Your application status is now: ${label}`, type as any);
            }
          }
          prevStageRef.current[row.id] = row.status;
        })
        .subscribe(),

      // Live: chat messages
      client
        .channel('messages-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.new as any;
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, supabaseRowToMessage(m)]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.new as any;
          setMessages(prev => prev.map(x => x.id === m.id ? supabaseRowToMessage(m) : x));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.old as any;
          setMessages(prev => prev.filter(x => x.id !== m.id));
        })
        .subscribe(),

      // Live: interviews
      client
        .channel('interviews-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interviews' }, (payload) => {
          const row = payload.new as any;
          const iv = supabaseRowToInterview(row);
          setInterviews(prev => prev.some(x => x.id === iv.id) ? prev : [...prev, iv]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'interviews' }, (payload) => {
          const iv = supabaseRowToInterview(payload.new as any);
          setInterviews(prev => prev.map(x => x.id === iv.id ? iv : x));
        })
        .subscribe(),

      // Live: job listings (new/edited jobs appear on candidates' dashboards instantly)
      client
        .channel('jobs-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
          const job = supabaseRowToJob(payload.new as any);
          setJobs(prev => prev.some(j => j.id === job.id) ? prev : [job, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' }, (payload) => {
          const job = supabaseRowToJob(payload.new as any);
          setJobs(prev => prev.map(j => j.id === job.id ? job : j));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'jobs' }, (payload) => {
          const old = payload.old as any;
          setJobs(prev => prev.filter(j => j.id !== old.id));
        })
        .subscribe(),
    ];

    // Recovery for missed realtime events: periodic refetch, and refetch when
    // the tab regains focus or the network comes back.
    const interval = window.setInterval(fetchAll, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchAll(); };
    const onOnline = () => fetchAll();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      disposed = true;
      channels.forEach(c => client.removeChannel(c));
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authKey]);

  const reloadMessages = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) mergeMessages(data.map(supabaseRowToMessage));
    } catch {
      // offline — keep local
    }
  };

  // ---- Chat actions ----

  const messagesByApplication = (applicationId: string) =>
    messages.filter(m => m.applicationId === applicationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const sendMessage = (applicationId: string, body: string, sender: 'admin' | 'user') => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const isDbRow = supabaseIdsRef.current.has(applicationId);
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const local: ChatMessage = {
      id: localId,
      applicationId,
      sender,
      body: trimmed,
      createdAt: new Date().toISOString(),
      readByAdmin: sender === 'admin',
      readByUser: sender === 'user',
    };
    setMessages(prev => [...prev, local]);
    if (isDbRow && supabase) {
      supabase.from('messages').insert({
        application_id: applicationId,
        sender,
        body: trimmed,
        read_by_admin: sender === 'admin',
        read_by_user: sender === 'user',
      }).select().then(({ data, error }) => {
        if (error) {
          // Keep the local copy so the sender still sees it, but surface the problem
          console.error('Message insert failed:', error.message);
          showToast('Message Not Delivered', 'Sync error — run supabase/schema.sql in Supabase SQL editor (sections 6-7), then resend.', 'error');
          return;
        }
        // Replace the optimistic copy with the real DB row (prevents realtime duplicates)
        if (data && data[0]) {
          const row = supabaseRowToMessage(data[0]);
          setMessages(prev => prev.map(m => m.id === localId ? row : m));
        }
      });
    }
  };

  const editMessage = (messageId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, body: trimmed, editedAt: now } : m));
    if (!messageId.startsWith('local-') && supabase) {
      supabase.from('messages').update({ body: trimmed, edited_at: now }).eq('id', messageId).then(({ error }) => {
        if (error) console.error('Message edit failed:', error.message);
      });
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (!messageId.startsWith('local-') && supabase) {
      supabase.from('messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('Message delete failed:', error.message);
      });
    }
  };

  const markConversationRead = (applicationId: string, asAdmin: boolean) => {
    const updated = messages.filter(m => m.applicationId === applicationId && m.sender !== (asAdmin ? 'admin' : 'user') && !(asAdmin ? m.readByAdmin : m.readByUser));
    if (updated.length === 0) return;
    const ids = updated.map(m => m.id).filter(id => !id.startsWith('local-'));
    setMessages(prev => prev.map(m => asAdmin
      ? (m.applicationId === applicationId && m.sender === 'user' ? { ...m, readByAdmin: true } : m)
      : (m.applicationId === applicationId && m.sender === 'admin' ? { ...m, readByUser: true } : m)));
    if (ids.length > 0 && supabase) {
      supabase.from('messages').update(asAdmin ? { read_by_admin: true } : { read_by_user: true }).in('id', ids).then(({ error }) => {
        if (error) console.error('Mark read failed:', error.message);
      });
    }
  };

  const unreadAdminCount = messages.filter(m => m.sender === 'user' && !m.readByAdmin).length;

  // ---- Interview actions (live, persisted) ----

  const interviewsByApplication = (applicationId: string) =>
    interviews.filter(i => i.applicationId === applicationId).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const scheduleInterviewLive = (applicantId: string, scheduledAt: string, durationMinutes: number, location: string, notes?: string) => {
    const isDbRow = supabaseIdsRef.current.has(applicantId);
    const upsert = (iv: ScheduledInterview) => {
      setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), iv]);
    };
    if (isDbRow && supabase) {
      supabase.from('interviews').insert({
        application_id: applicantId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        location,
        notes,
      }).select().then(({ data }) => {
        if (data && data[0]) upsert(supabaseRowToInterview(data[0]));
      });
    } else {
      upsert({
        id: `local-int-${Date.now()}`,
        applicationId: applicantId,
        scheduledAt,
        durationMinutes,
        location,
        notes,
        status: 'scheduled',
        completed: false,
      });
    }
    // Update the applicant card + stage
    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const interview: InterviewInfo = {
        id: `int-${Date.now()}`,
        scheduledDate: scheduledAt.slice(0, 10),
        scheduledTime: `${String(new Date(scheduledAt).getHours()).padStart(2, '0')}:${String(new Date(scheduledAt).getMinutes()).padStart(2, '0')}`,
        interviewerName: 'Uniguard Recruitment Team',
        locationOrLink: location,
        interviewType: location.toLowerCase().includes('video') || location.toLowerCase().includes('call') ? 'video' : 'in_person',
        completed: false,
      };
      logActivity(a.id, a.fullName, `Scheduled live interview on ${interview.scheduledDate} at ${interview.scheduledTime}`);
      return { ...a, currentStage: 'interview_scheduled', interview };
    }));
    showToast('Interview Scheduled', `Confirmed for ${new Date(scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`, 'success');
  };

  const completeInterviewLive = (interviewId: string) => {
    setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, completed: true, status: 'completed' } : i));
    if (!interviewId.startsWith('local-') && supabase) {
      supabase.from('interviews').update({ completed: true, status: 'completed' }).eq('id', interviewId).then(() => {});
    }
  };

  // Keep Supabase status in sync with admin pipeline stage changes
  useEffect(() => {
    if (supabaseIdsRef.current.size === 0 || !supabase) return;
    const client = supabase;
    applicants.forEach(a => {
      if (supabaseIdsRef.current.has(a.id)) {
        client.from('applications').update({ status: a.currentStage }).eq('id', a.id).then(() => {});
      }
    });
  }, [applicants]);

  // Restore Supabase session → candidate (publicUser) and admin state
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const applySessionUser = async (supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!supabaseUser) {
        setPublicUser(null);
        setIsAuthenticated(false);
        return false;
      }
      setPublicUser({
        name: (supabaseUser.user_metadata?.full_name as string) || supabaseUser.email || '',
        email: supabaseUser.email || '',
      });
      const { data: profile } = await client.from('profiles').select('is_admin').eq('id', supabaseUser.id).maybeSingle();
      const isAdmin = !!profile?.is_admin;
      setIsAuthenticated(isAdmin);
      return isAdmin;
    };

    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await applySessionUser(session.user);
        // Just returned from Google/email OAuth (tokens in the URL)?
        // supabase-js's SIGNED_IN event can fire before this effect subscribes,
        // so navigate explicitly instead of relying on it.
        const path = window.location.pathname;
        if (isOAuthRedirect && path !== '/confirm' && path !== '/reset-password') {
          setActivePage(isAdmin ? 'dashboard' : 'user-dashboard');
        }
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      const isAdmin = await applySessionUser(session?.user ?? null);
      // Fresh sign-in → dashboard, unless we're mid-email-confirmation or
      // mid-password-reset, where the session is only the OTP session.
      if (event === 'SIGNED_IN' && session?.user) {
        const path = window.location.pathname;
        if (path !== '/confirm' && path !== '/reset-password') {
          setActivePage(isAdmin ? 'dashboard' : 'user-dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Public user auth (Supabase Auth)
  const publicLogin = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      showToast('Login Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast('Login Failed', 'Invalid email or password.', 'error');
      return false;
    }
    showToast('Welcome back', `Logged in as ${email}`, 'success');
    return true;
  };

  const publicSignup = async (name: string, email: string, password: string): Promise<{ ok: boolean; needsConfirm: boolean }> => {
    if (!supabase) {
      showToast('Signup Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return { ok: false, needsConfirm: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // Confirmation links must return to this app (not Supabase's Site URL),
        // so they work on both the live site and localhost.
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      const msg = error.message || 'Signup failed.';
      showToast('Signup Failed', msg, 'error');
      return { ok: false, needsConfirm: false };
    }
    if (!data.session) {
      showToast('Confirm your email', 'We emailed you a confirmation link — click it, then sign in.', 'info');
      return { ok: true, needsConfirm: true };
    }
    if (data.session.user) {
      setPublicUser({ name, email });
      setIsAuthenticated(false);
    }
    showToast('Account Created', `Welcome to Uniguard, ${name}!`, 'success');
    return { ok: true, needsConfirm: false };
  };

  // Google OAuth sign-in (provider configured in Supabase → Authentication → Sign In Providers)
  const googleLogin = async (): Promise<boolean> => {
    if (!supabase) {
      showToast('Google Sign-In Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      showToast('Google Sign-In Failed', error.message, 'error');
      return false;
    }
    return true;
  };

  // Forgot password: sends a recovery email with a link to /reset-password
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    if (!supabase) {
      showToast('Reset Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      showToast('Reset Failed', error.message, 'error');
      return false;
    }
    return true;
  };

  const publicLogout = () => {
    supabase?.auth.signOut();
    setPublicUser(null);
    setActivePage('landing');
    showToast('Logged Out', 'You have been logged out.', 'info');
  };

  // Admin auth: a signed-in Supabase user flagged is_admin = true in public.profiles
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      showToast('Login Failed', 'Backend is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return false;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      showToast('Login Failed', 'Invalid email or password.', 'error');
      return false;
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
    if (!profile?.is_admin) {
      showToast('Access Denied', 'This account does not have admin access.', 'error');
      await supabase.auth.signOut();
      return false;
    }
    setIsAuthenticated(true);
    setActivePage('dashboard');
    showToast('Admin Logged In', 'Welcome to the admin dashboard.', 'success');
    return true;
  };

  const logout = () => {
    supabase?.auth.signOut();
    setIsAuthenticated(false);
    setActivePage('dashboard');
    showToast('Logged Out', 'You have logged out of the recruitment admin portal.', 'info');
  };

  // Sync selectedApplicant if applicants list updates
  useEffect(() => {
    if (selectedApplicant) {
      const updated = applicants.find(a => a.id === selectedApplicant.id);
      if (updated) {
        setSelectedApplicant(updated);
      }
    }
  }, [applicants]);

  const showToast = (title: string, message?: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (applicantId: string, applicantName: string, action: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      applicantId,
      applicantName,
      action,
      timestamp: 'Just now',
      user: 'Admin User'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // 1. Update Check Status & Notes
  const updateCheckStatus = (
    applicantId: string, 
    checkType: VettingCheckType, 
    status: CheckStatus, 
    notes?: string
  ) => {
    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

      const updatedChecks = applicant.vettingChecks.map(check => {
        if (check.type !== checkType) return check;
        return {
          ...check,
          status,
          notes: notes !== undefined ? notes : check.notes,
          verifiedBy: status !== 'pending' ? 'Admin User' : undefined,
          verifiedAt: status !== 'pending' ? formattedDate : undefined,
        };
      });

      // Check if all REQUIRED checks are approved (Right to Work, SIA Licence, References)
      const requiredChecks = updatedChecks.filter(c => c.isRequired);
      const allRequiredApproved = requiredChecks.length > 0 && requiredChecks.every(c => c.status === 'approved');

      let newStage = applicant.currentStage;
      if (allRequiredApproved && (applicant.currentStage === 'vetting_in_progress' || applicant.currentStage === 'interview_completed' || applicant.currentStage === 'under_review')) {
        newStage = 'ready_for_contract';
        logActivity(applicant.id, applicant.fullName, 'All required vetting checks approved. Candidate is Ready for Contract!');
        showToast('Ready for Contract ðŸŽ‰', `${applicant.fullName} has passed all required UK security checks!`, 'success');
      }

      const checkNameMap: Record<VettingCheckType, string> = {
        right_to_work: 'Right to Work',
        sia_licence: 'SIA Licence',
        references: 'References',
        credit_check: 'Credit Check',
        companies_house: 'Companies House'
      };

      logActivity(applicant.id, applicant.fullName, `Updated ${checkNameMap[checkType]} to ${status.toUpperCase()}`);

      return {
        ...applicant,
        vettingChecks: updatedChecks,
        currentStage: newStage
      };
    }));

    showToast('Check Updated', `Status set to ${status.toUpperCase()}`, status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info');
  };

  // 2. Stage updates
  const updateApplicantStage = (applicantId: string, stage: ApplicationStage) => {
    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;
      logActivity(applicant.id, applicant.fullName, `Moved stage to ${stage.replace('_', ' ').toUpperCase()}`);
      return { ...applicant, currentStage: stage };
    }));
  };

  // 3. Schedule Interview (persisted — local-only rows never survive a refresh)
  const scheduleInterview = (applicantId: string, interviewData: Omit<InterviewInfo, 'id'>) => {
    const scheduledAt = new Date(`${interviewData.scheduledDate}T${interviewData.scheduledTime}:00`).toISOString();
    const isDbRow = supabaseIdsRef.current.has(applicantId);

    if (isDbRow && supabase) {
      supabase.from('interviews').insert({
        application_id: applicantId,
        scheduled_at: scheduledAt,
        duration_minutes: 45,
        location: interviewData.locationOrLink,
        notes: interviewData.notes,
      }).select().then(({ data }) => {
        if (data && data[0]) {
          const iv = supabaseRowToInterview(data[0]);
          setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), iv]);
        }
      });
    } else {
      setInterviews(prev => [...prev.filter(x => x.applicationId !== applicantId), {
        id: `local-int-${Date.now()}`,
        applicationId: applicantId,
        scheduledAt,
        durationMinutes: 45,
        location: interviewData.locationOrLink,
        notes: interviewData.notes,
        status: 'scheduled',
        completed: false,
      }]);
    }

    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      const newInterview: InterviewInfo = {
        id: `int-${Date.now()}`,
        ...interviewData,
        completed: false
      };

      logActivity(applicant.id, applicant.fullName, `Scheduled interview for ${interviewData.scheduledDate} at ${interviewData.scheduledTime}`);

      return {
        ...applicant,
        currentStage: 'interview_scheduled',
        interview: newInterview
      };
    }));

    showToast('Interview Scheduled', `Confirmed for ${interviewData.scheduledDate} at ${interviewData.scheduledTime}`, 'success');
  };

  // 4. Complete Interview
  const completeInterview = (applicantId: string, notes: string, rating: number, passed: boolean) => {
    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      if (!applicant.interview) return applicant;

      const updatedInterview: InterviewInfo = {
        ...applicant.interview,
        completed: true,
        notes,
        rating
      };

      const nextStage: ApplicationStage = passed ? 'vetting_in_progress' : 'rejected';

      logActivity(applicant.id, applicant.fullName, passed ? `Passed Interview (Rating: ${rating}/5). Moved to Vetting.` : 'Interview Failed. Candidate Rejected.');

      return {
        ...applicant,
        currentStage: nextStage,
        interview: updatedInterview
      };
    }));

    showToast(passed ? 'Interview Passed' : 'Candidate Rejected', passed ? 'Moved candidate to Vetting Verification queue' : 'Application marked as rejected', passed ? 'success' : 'error');
  };

  // 5. Send Contract
  const sendContract = (applicantId: string) => {
    setApplicants(prev => prev.map(applicant => {
      if (applicant.id !== applicantId) return applicant;

      const contractDoc = {
        id: `doc-contract-${Date.now()}`,
        name: `Employment_Contract_${applicant.fullName.replace(' ', '_')}.pdf`,
        type: 'contract' as const,
        fileUrl: '#',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '2.8 MB'
      };

      logActivity(applicant.id, applicant.fullName, 'Generated & emailed UK Security Employment Contract');

      return {
        ...applicant,
        currentStage: 'contract_sent',
        documents: [contractDoc, ...applicant.documents]
      };
    }));

    showToast('Contract Dispatched ðŸ“„', 'Employment contract sent to applicant via e-signature link.', 'success');
  };

  // 6. Convert to Employee (Hire!)
  const convertToEmployee = (applicantId: string) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    const newEmpId = `UG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      applicantId: applicant.id,
      employeeId: newEmpId,
      fullName: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      roleTitle: applicant.appliedJobTitle,
      siaLicenceNo: applicant.siaLicenceNo,
      siaLicenceSector: applicant.siaLicenceSector,
      siaLicenceExpiry: applicant.siaLicenceExpiry,
      hiredDate: new Date().toISOString().split('T')[0],
      assignedSite: 'Uniguard Fleet / Assigned Venue',
      hourlyRate: 15.50,
      status: 'active'
    };

    setEmployees(prev => [newEmployee, ...prev]);

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      return {
        ...a,
        currentStage: 'hired',
        employeeId: newEmpId,
        hiredDate: newEmployee.hiredDate
      };
    }));

    logActivity(applicant.id, applicant.fullName, `Official Employee created (ID: ${newEmpId})! ðŸŽ‰`);

    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('Candidate Hired! ðŸŽ‰', `${applicant.fullName} is now an active Employee (${newEmpId}).`, 'success');
  };

// 7. Create Job (persisted to Supabase so candidates on any device see it)
  const createJob = async (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0,
      ...jobData
    };

    setJobs(prev => [newJob, ...prev]);
    showToast('Job Created', `"${jobData.title}" is now active and accepting applicants.`, 'success');

    if (!supabase) return;
    const { data, error } = await supabase.from('jobs').insert({
      title: jobData.title,
      location: jobData.location,
      pay_rate: jobData.payRate,
      employment_type: jobData.employmentType,
      sia_required: jobData.siaRequired,
      status: jobData.status,
      created_date: newJob.createdDate,
      description: jobData.description,
      applicants_count: 0,
    }).select();
    if (error) {
      console.error('Job insert failed:', error.message);
      showToast('Job Created Locally', 'Could not sync to the server — candidates may not see it yet.', 'warning');
      return;
    }
    if (data && data[0]) {
      const row = supabaseRowToJob(data[0]);
      setJobs(prev => prev.map(j => j.id === newJob.id ? row : j));
    }
  };

  // 7a. Update Job (persisted to Supabase so candidates on any device see changes)
  const updateJob = async (id: string, jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => {
    const existing = jobs.find(j => j.id === id);
    if (!existing) return;

    const updatedJob: Job = {
      ...existing,
      ...jobData,
    };

    setJobs(prev => prev.map(j => j.id === id ? updatedJob : j));
    showToast('Job Updated', `"${jobData.title}" changes are now live.`, 'success');

    if (!supabase) return;
    if (id.startsWith('job-')) return; // local-only mock job, no DB row

    const { data, error } = await supabase.from('jobs').update({
      title: jobData.title,
      location: jobData.location,
      pay_rate: jobData.payRate,
      employment_type: jobData.employmentType,
      sia_required: jobData.siaRequired,
      status: jobData.status,
      description: jobData.description,
    }).eq('id', id).select();
    if (error) {
      console.error('Job update failed:', error.message);
      showToast('Update Failed', 'Could not sync changes to the server.', 'error');
      return;
    }
    if (data && data[0]) {
      const row = supabaseRowToJob(data[0]);
      setJobs(prev => prev.map(j => j.id === id ? row : j));
    }
  };

  // 7b. Delete Job (removes it from Supabase — every dashboard updates live)
  const deleteJob = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    if (!job) return;

    if (id.startsWith('job-') || !supabase) {
      showToast('Job Deleted', `"${job.title}" removed.`, 'success');
      return;
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) {
      console.error('Job delete failed:', error.message);
      setJobs(prev => prev.some(j => j.id === id) ? prev : [job, ...prev]);
      showToast('Delete Failed', 'Could not remove the job from the server.', 'error');
      return;
    }
    showToast('Job Deleted', `"${job.title}" removed from all dashboards.`, 'success');
  };

  // 8. Add Applicant
  const addApplicant = (applicantData: Partial<Applicant>) => {
    const newId = `app-${Date.now()}`;
    const fullApplicant: Applicant = {
      id: newId,
      fullName: applicantData.fullName || 'New Applicant',
      email: applicantData.email || '',
      phone: applicantData.phone || '',
      address: applicantData.address || 'London, UK',
      postcode: applicantData.postcode || 'EC1A 1BB',
      nationalInsuranceNo: applicantData.nationalInsuranceNo || 'QQ 00 00 00 A',
      siaLicenceNo: applicantData.siaLicenceNo || '0000-0000-0000-0000',
      siaLicenceSector: applicantData.siaLicenceSector || 'Door Supervision',
      siaLicenceExpiry: applicantData.siaLicenceExpiry || '2027-12-31',
      appliedJobId: applicantData.appliedJobId || jobs[0]?.id || 'job-1',
      appliedJobTitle: applicantData.appliedJobTitle || jobs[0]?.title || 'Security Guard',
      appliedDate: new Date().toISOString().split('T')[0],
      currentStage: 'applied',
      documents: [
        { id: `doc-${Date.now()}`, name: 'Applicant_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: new Date().toISOString().split('T')[0], size: '1.0 MB' }
      ],
      vettingChecks: [
        { id: `chk-1-${newId}`, type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
        { id: `chk-2-${newId}`, type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
        { id: `chk-3-${newId}`, type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
        { id: `chk-4-${newId}`, type: 'credit_check', title: 'Credit Check (Optional)', description: 'Optional financial audit', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
        { id: `chk-5-${newId}`, type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://find-and-update.company-information.service.gov.uk' }
      ]
    };

    setApplicants(prev => [fullApplicant, ...prev]);

    // Increment job applicant count
    setJobs(prev => prev.map(j => j.id === fullApplicant.appliedJobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j));

    logActivity(newId, fullApplicant.fullName, 'Submitted application');
    showToast('Applicant Added', `${fullApplicant.fullName} added to pipeline.`, 'success');
  };

  return (
    <RecruitmentContext.Provider value={{
      activePage,
      setActivePage,
      pendingJobId,
      setPendingJobId,
      jobs,
      applicants,
      employees,
      activityLogs,
      interviews,
      messages,
      unreadAdminCount,
      selectedApplicant,
      setSelectedApplicant,
      searchQuery,
      setSearchQuery,
      selectedStageFilter,
      setSelectedStageFilter,
      updateCheckStatus,
      updateApplicantStage,
      scheduleInterview,
      completeInterview,
      sendContract,
      convertToEmployee,
      createJob,
      updateJob,
      deleteJob,
      addApplicant,
      sendMessage,
      editMessage,
      deleteMessage,
      markConversationRead,
      messagesByApplication,
      reloadMessages,
      scheduleInterviewLive,
      completeInterviewLive,
      interviewsByApplication,
      toasts,
      showToast,
      removeToast,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isAuthenticated,
      login,
      logout,
      publicUser,
      publicLogin,
      publicSignup,
      googleLogin,
      requestPasswordReset,
      publicLogout
    }}>
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) throw new Error('useRecruitment must be used within a RecruitmentProvider');
  return context;
};

