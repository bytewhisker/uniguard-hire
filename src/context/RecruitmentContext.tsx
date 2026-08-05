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
  ApplicationStage,
  InterviewInfo
} from '../types/recruitment';
import { 
  INITIAL_APPLICANTS, 
  INITIAL_JOBS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message?: string;
}

interface RecruitmentContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  
  jobs: Job[];
  applicants: Applicant[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  
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
  createJob: (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => void;
  addApplicant: (applicantData: Partial<Applicant>) => void;
  
  // Toast notifications
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;

  // Theme switcher
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('uniguard_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    const saved = localStorage.getItem('uniguard_applicants');
    return saved ? JSON.parse(saved) : INITIAL_APPLICANTS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('uniguard_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('uniguard_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('uniguard_auth') === 'true';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('uniguard_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('uniguard_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('uniguard_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('uniguard_applicants', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('uniguard_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('uniguard_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('uniguard_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  // Auth functions
  const login = (password: string): boolean => {
    if (password === 'admin') {
      setIsAuthenticated(true);
      setActivePage('dashboard');
      showToast('Admin Logged In', 'Welcome to the simplified security dashboard.', 'success');
      return true;
    }
    showToast('Login Failed', 'Invalid password. Hint: Use "admin"', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActivePage('landing');
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
        showToast('Ready for Contract 🎉', `${applicant.fullName} has passed all required UK security checks!`, 'success');
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

  // 3. Schedule Interview
  const scheduleInterview = (applicantId: string, interviewData: Omit<InterviewInfo, 'id'>) => {
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

    showToast('Contract Dispatched 📄', 'Employment contract sent to applicant via e-signature link.', 'success');
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

    logActivity(applicant.id, applicant.fullName, `Official Employee created (ID: ${newEmpId})! 🎉`);

    // Confetti celebration!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('Candidate Hired! 🎉', `${applicant.fullName} is now an active Employee (${newEmpId}).`, 'success');
  };

  // 7. Create Job
  const createJob = (jobData: Omit<Job, 'id' | 'createdDate' | 'applicantsCount'>) => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0,
      ...jobData
    };

    setJobs(prev => [newJob, ...prev]);
    showToast('Job Created', `"${jobData.title}" is now active and accepting applicants.`, 'success');
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
      jobs,
      applicants,
      employees,
      activityLogs,
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
      addApplicant,
      toasts,
      showToast,
      removeToast,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isAuthenticated,
      login,
      logout,
      theme,
      toggleTheme
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
