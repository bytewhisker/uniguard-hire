import type { Applicant, Job, Employee, ActivityLog } from '../types/recruitment';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'SIA Door Supervisor — West End Venues',
    department: 'Event & Venue Security',
    location: 'Central London (WC1)',
    payRate: 16.50,
    employmentType: 'Shift-Based',
    siaRequirement: 'Door Supervision',
    status: 'active',
    createdDate: '2026-08-01',
    description: 'Seeking experienced SIA Door Supervisors for high-profile hospitality and nightlife venues in London’s West End. Dynamic crowd management, guest relations, and access verification.',
    applicantsCount: 14,
  },
  {
    id: 'job-2',
    title: 'Corporate Security Officer — Canary Wharf',
    department: 'Corporate Guarding',
    location: 'Canary Wharf, London',
    payRate: 15.00,
    employmentType: 'Full-Time',
    siaRequirement: 'Security Guarding',
    status: 'active',
    createdDate: '2026-07-28',
    description: 'Front-of-house security representation at premier financial institution headquarters. Duty includes access control, CCTV monitoring, visitor logs, and building patrols.',
    applicantsCount: 9,
  },
  {
    id: 'job-3',
    title: 'CCTV Control Room Specialist',
    department: 'Control Room Operations',
    location: 'Manchester City Centre',
    payRate: 14.80,
    employmentType: 'Full-Time',
    siaRequirement: 'CCTV (PSS)',
    status: 'active',
    createdDate: '2026-08-02',
    description: 'Monitoring multi-site PSS CCTV systems for retail and commercial premises. High attention to detail, incident logging, and radio communications with ground staff.',
    applicantsCount: 6,
  },
  {
    id: 'job-4',
    title: 'Close Protection Guard — Executive Escort',
    department: 'VIP Protection',
    location: 'Mayfair, London',
    payRate: 28.00,
    employmentType: 'Part-Time',
    siaRequirement: 'Close Protection',
    status: 'active',
    createdDate: '2026-07-25',
    description: 'High-level protective security detail for corporate executives and visiting dignitaries. Advanced tactical awareness, conflict management, and discretion required.',
    applicantsCount: 4,
  },
  {
    id: 'job-5',
    title: 'Retail Loss Prevention Guard',
    department: 'Retail Guarding',
    location: 'Birmingham Bullring',
    payRate: 13.90,
    employmentType: 'Full-Time',
    siaRequirement: 'Security Guarding',
    status: 'closed',
    createdDate: '2026-07-15',
    description: 'Visible deterrent and loss prevention guard for flagship retail brand.',
    applicantsCount: 18,
  }
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-101',
    fullName: 'Marcus Vance',
    email: 'm.vance@example.co.uk',
    phone: '+44 7700 900123',
    address: '42 Baker Street, Marylebone',
    postcode: 'NW1 6XE',
    nationalInsuranceNo: 'QQ 12 34 56 A',
    siaLicenceNo: '0102-4982-1102-9481',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2027-11-14',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-08-02',
    currentStage: 'ready_for_contract',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Candidate passed interview with flying colors. 6 years experience in Soho venues. All 5 vetting checks completed and verified on GOV/SIA portals.',
    documents: [
      { id: 'doc-1', name: 'Marcus_Vance_CV_2026.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-08-02', size: '1.2 MB' },
      { id: 'doc-2', name: 'UK_Passport_Scan.pdf', type: 'passport', fileUrl: '#', uploadedAt: '2026-08-02', size: '2.4 MB' },
      { id: 'doc-3', name: 'SIA_Badge_Front_Back.jpg', type: 'sia_badge', fileUrl: '#', uploadedAt: '2026-08-02', size: '980 KB' },
      { id: 'doc-4', name: 'Utility_Bill_ProofAddress.pdf', type: 'proof_address', fileUrl: '#', uploadedAt: '2026-08-02', size: '1.1 MB' }
    ],
    interview: {
      id: 'int-1',
      scheduledDate: '2026-08-04',
      scheduledTime: '11:00',
      interviewerName: 'Sarah Jenkins (Recruitment Lead)',
      locationOrLink: 'Uniguard HQ - Soho Office',
      interviewType: 'in_person',
      completed: true,
      notes: 'Exceptional communication, calm demeanor, deep understanding of UK licensing law and conflict de-escalation.',
      rating: 5
    },
    vettingChecks: [
      {
        id: 'chk-1',
        type: 'right_to_work',
        title: 'Right to Work (UK)',
        description: 'Verify UK Passport or Home Office Share Code on GOV.UK portal',
        isRequired: true,
        status: 'approved',
        notes: 'British Citizen Passport checked on GOV.UK online check tool. Valid indefinitely.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-04 14:20',
        externalUrl: 'https://www.gov.uk/prove-right-to-work'
      },
      {
        id: 'chk-2',
        type: 'sia_licence',
        title: 'SIA Licence Verification',
        description: 'Check active status on Home Office SIA Public Register',
        isRequired: true,
        status: 'approved',
        notes: 'Licence 0102-4982-1102-9481 active and clean. Sector: Door Supervision. Expiry: 14 Nov 2027.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-04 14:22',
        externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker'
      },
      {
        id: 'chk-3',
        type: 'references',
        title: '5-Year Reference Check',
        description: 'Contact previous security employers & personal references',
        isRequired: true,
        status: 'approved',
        notes: 'Confirmed 3 years at SecuriGuard UK & 2 years at Apex Protection. Positive feedback from Manager John D.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 09:15',
        externalUrl: '#'
      },
      {
        id: 'chk-4',
        type: 'credit_check',
        title: 'Credit Check (Optional)',
        description: 'Perform optional financial background audit for security roles',
        isRequired: false,
        status: 'approved',
        notes: 'Experian check clean. No outstanding CCJs or bankruptcy filings.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 10:00',
        externalUrl: 'https://www.experian.co.uk'
      },
      {
        id: 'chk-5',
        type: 'companies_house',
        title: 'Companies House Check',
        description: 'Verify director/sole trader status on Companies House register',
        isRequired: false,
        status: 'approved',
        notes: 'No active directorship conflict found on Companies House search.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-05 10:05',
        externalUrl: 'https://find-and-update.company-information.service.gov.uk'
      }
    ]
  },
  {
    id: 'app-102',
    fullName: 'Sarah Jenkins',
    email: 's.jenkins@example.co.uk',
    phone: '+44 7700 911222',
    address: '15 High Street, Croydon',
    postcode: 'CR0 1QQ',
    nationalInsuranceNo: 'SR 98 76 54 B',
    siaLicenceNo: '0204-8831-7712-4091',
    siaLicenceSector: 'Security Guarding',
    siaLicenceExpiry: '2026-10-30',
    appliedJobId: 'job-2',
    appliedJobTitle: 'Corporate Security Officer — Canary Wharf',
    appliedDate: '2026-08-03',
    currentStage: 'vetting_in_progress',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Scheduled interview completed yesterday. Right to Work approved. Awaiting SIA portal verification and employer reference response.',
    documents: [
      { id: 'doc-10', name: 'Sarah_Jenkins_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-08-03', size: '890 KB' },
      { id: 'doc-11', name: 'ShareCode_RTW_GOV.pdf', type: 'passport', fileUrl: '#', uploadedAt: '2026-08-03', size: '1.5 MB' }
    ],
    interview: {
      id: 'int-2',
      scheduledDate: '2026-08-04',
      scheduledTime: '15:30',
      interviewerName: 'Dave Miller (Operations Mgr)',
      locationOrLink: 'Video Call (Google Meet)',
      interviewType: 'video',
      completed: true,
      notes: 'Punctual, professional corporate background. Recommended for Canary Wharf site.',
      rating: 4
    },
    vettingChecks: [
      {
        id: 'chk-10',
        type: 'right_to_work',
        title: 'Right to Work (UK)',
        description: 'Verify UK Passport or Home Office Share Code on GOV.UK portal',
        isRequired: true,
        status: 'approved',
        notes: 'Share Code W9X-84N-21Z verified on GOV.UK. Indefinite Leave to Remain.',
        verifiedBy: 'Admin User',
        verifiedAt: '2026-08-04 16:00',
        externalUrl: 'https://www.gov.uk/prove-right-to-work'
      },
      {
        id: 'chk-11',
        type: 'sia_licence',
        title: 'SIA Licence Verification',
        description: 'Check active status on Home Office SIA Public Register',
        isRequired: true,
        status: 'pending',
        notes: 'Need to visit SIA checker portal to confirm renewal date status.',
        externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker'
      },
      {
        id: 'chk-12',
        type: 'references',
        title: '5-Year Reference Check',
        description: 'Contact previous security employers & personal references',
        isRequired: true,
        status: 'pending',
        notes: 'Reference request email dispatched to Mitie Security HR on 4 Aug.',
        externalUrl: '#'
      },
      {
        id: 'chk-13',
        type: 'credit_check',
        title: 'Credit Check (Optional)',
        description: 'Perform optional financial background audit for security roles',
        isRequired: false,
        status: 'pending',
        notes: 'Pending final review.',
        externalUrl: 'https://www.experian.co.uk'
      },
      {
        id: 'chk-14',
        type: 'companies_house',
        title: 'Companies House Check',
        description: 'Verify director/sole trader status on Companies House register',
        isRequired: false,
        status: 'pending',
        notes: 'Optional check.',
        externalUrl: 'https://find-and-update.company-information.service.gov.uk'
      }
    ]
  },
  {
    id: 'app-103',
    fullName: 'David O\'Connor',
    email: 'doconnor@example.co.uk',
    phone: '+44 7700 922333',
    address: '88 Deansgate, City Centre',
    postcode: 'M3 2BW',
    nationalInsuranceNo: 'DO 33 44 55 C',
    siaLicenceNo: '0308-1122-9933-4411',
    siaLicenceSector: 'CCTV (PSS)',
    siaLicenceExpiry: '2028-03-19',
    appliedJobId: 'job-3',
    appliedJobTitle: 'CCTV Control Room Specialist',
    appliedDate: '2026-08-04',
    currentStage: 'interview_scheduled',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Strong resume with 4 years local authority CCTV control room experience. Interview set for today.',
    documents: [
      { id: 'doc-20', name: 'David_OConnor_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-08-04', size: '1.1 MB' }
    ],
    interview: {
      id: 'int-3',
      scheduledDate: '2026-08-05',
      scheduledTime: '14:30',
      interviewerName: 'Sarah Jenkins (Recruitment Lead)',
      locationOrLink: 'Manchester Regional Office - Suite 4B',
      interviewType: 'in_person',
      completed: false,
      notes: 'Focus questions on incident handling and emergency protocol response.'
    },
    vettingChecks: [
      {
        id: 'chk-20',
        type: 'right_to_work',
        title: 'Right to Work (UK)',
        description: 'Verify UK Passport or Home Office Share Code on GOV.UK portal',
        isRequired: true,
        status: 'pending',
        notes: 'Awaiting passport upload.',
        externalUrl: 'https://www.gov.uk/prove-right-to-work'
      },
      {
        id: 'chk-21',
        type: 'sia_licence',
        title: 'SIA Licence Verification',
        description: 'Check active status on Home Office SIA Public Register',
        isRequired: true,
        status: 'pending',
        notes: 'Licence number provided: 0308-1122-9933-4411.',
        externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker'
      },
      {
        id: 'chk-22',
        type: 'references',
        title: '5-Year Reference Check',
        description: 'Contact previous security employers & personal references',
        isRequired: true,
        status: 'pending',
        notes: 'Pending interview completion.',
        externalUrl: '#'
      },
      {
        id: 'chk-23',
        type: 'credit_check',
        title: 'Credit Check (Optional)',
        description: 'Perform optional financial background audit for security roles',
        isRequired: false,
        status: 'pending',
        notes: '',
        externalUrl: 'https://www.experian.co.uk'
      },
      {
        id: 'chk-24',
        type: 'companies_house',
        title: 'Companies House Check',
        description: 'Verify director/sole trader status on Companies House register',
        isRequired: false,
        status: 'pending',
        notes: '',
        externalUrl: 'https://find-and-update.company-information.service.gov.uk'
      }
    ]
  },
  {
    id: 'app-104',
    fullName: 'Amina Patel',
    email: 'a.patel@example.co.uk',
    phone: '+44 7700 933444',
    address: '12 Victoria Road, Kensington',
    postcode: 'W8 5RH',
    nationalInsuranceNo: 'AP 55 66 77 D',
    siaLicenceNo: '0409-5511-2233-8877',
    siaLicenceSector: 'Close Protection',
    siaLicenceExpiry: '2027-06-30',
    appliedJobId: 'job-4',
    appliedJobTitle: 'Close Protection Guard — Executive Escort',
    appliedDate: '2026-08-04',
    currentStage: 'under_review',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Former military police officer with active CP licence. Initial CV screening passed.',
    documents: [
      { id: 'doc-30', name: 'Amina_Patel_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-08-04', size: '1.6 MB' }
    ],
    vettingChecks: [
      { id: 'chk-30', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
      { id: 'chk-31', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
      { id: 'chk-32', type: 'references', title: '5-Year Reference Check', description: 'Contact military discharge & private security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
      { id: 'chk-33', type: 'credit_check', title: 'Credit Check (Optional)', description: 'Financial audit for VIP roles', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-34', type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://find-and-update.company-information.service.gov.uk' }
    ]
  },
  {
    id: 'app-105',
    fullName: 'James Harrison',
    email: 'j.harrison@example.co.uk',
    phone: '+44 7700 944555',
    address: '74 Park Lane, Leeds',
    postcode: 'LS1 2HE',
    nationalInsuranceNo: 'JH 77 88 99 E',
    siaLicenceNo: '0105-7722-4411-9922',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2028-01-12',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-07-30',
    currentStage: 'contract_sent',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Contract sent via e-signature on 04 Aug 2026. Awaiting candidate signature.',
    documents: [
      { id: 'doc-40', name: 'Harrison_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-07-30', size: '920 KB' },
      { id: 'doc-41', name: 'Draft_Employment_Contract.pdf', type: 'contract', fileUrl: '#', uploadedAt: '2026-08-04', size: '3.1 MB' }
    ],
    interview: {
      id: 'int-4',
      scheduledDate: '2026-08-01',
      scheduledTime: '10:00',
      interviewerName: 'Sarah Jenkins',
      locationOrLink: 'Video Call',
      interviewType: 'video',
      completed: true,
      rating: 5,
      notes: 'Passed interview easily.'
    },
    vettingChecks: [
      { id: 'chk-40', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verified Passport', isRequired: true, status: 'approved', notes: 'Checked UK passport.', verifiedBy: 'Admin User', verifiedAt: '2026-08-02', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
      { id: 'chk-41', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Checked SIA Portal', isRequired: true, status: 'approved', notes: 'Valid Door Supervision badge.', verifiedBy: 'Admin User', verifiedAt: '2026-08-02', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
      { id: 'chk-42', type: 'references', title: '5-Year Reference Check', description: 'References verified', isRequired: true, status: 'approved', notes: '2 references checked.', verifiedBy: 'Admin User', verifiedAt: '2026-08-03', externalUrl: '#' },
      { id: 'chk-43', type: 'credit_check', title: 'Credit Check (Optional)', description: 'Credit audit', isRequired: false, status: 'approved', notes: 'Clean.', verifiedBy: 'Admin User', verifiedAt: '2026-08-03', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-44', type: 'companies_house', title: 'Companies House Check', description: 'Companies House check', isRequired: false, status: 'approved', notes: 'Clean.', verifiedBy: 'Admin User', verifiedAt: '2026-08-03', externalUrl: 'https://find-and-update.company-information.service.gov.uk' }
    ]
  },
  {
    id: 'app-106',
    fullName: 'Elena Rostova',
    email: 'elena.r@example.co.uk',
    phone: '+44 7700 955666',
    address: '109 Commercial Road, Tower Hamlets',
    postcode: 'E1 1RD',
    nationalInsuranceNo: 'ER 11 22 33 F',
    siaLicenceNo: '0209-9944-1188-3344',
    siaLicenceSector: 'Security Guarding',
    siaLicenceExpiry: '2027-09-01',
    appliedJobId: 'job-2',
    appliedJobTitle: 'Corporate Security Officer — Canary Wharf',
    appliedDate: '2026-07-20',
    currentStage: 'hired',
    employeeId: 'UG-4019',
    hiredDate: '2026-08-01',
    hourlyRate: 15.00,
    assignedSite: 'Canary Wharf Tower 1',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Hired and deployed to Canary Wharf site. Contract signed.',
    documents: [
      { id: 'doc-50', name: 'Signed_Contract_Elena.pdf', type: 'contract', fileUrl: '#', uploadedAt: '2026-08-01', size: '2.9 MB' }
    ],
    vettingChecks: [
      { id: 'chk-50', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verified', isRequired: true, status: 'approved', notes: 'Indefinite leave to remain', verifiedBy: 'Admin', verifiedAt: '2026-07-22', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
      { id: 'chk-51', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Verified', isRequired: true, status: 'approved', notes: 'Valid till 2027', verifiedBy: 'Admin', verifiedAt: '2026-07-22', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
      { id: 'chk-52', type: 'references', title: '5-Year Reference Check', description: 'Verified', isRequired: true, status: 'approved', notes: '5-year audit complete', verifiedBy: 'Admin', verifiedAt: '2026-07-25', externalUrl: '#' },
      { id: 'chk-53', type: 'credit_check', title: 'Credit Check (Optional)', description: 'Verified', isRequired: false, status: 'approved', notes: 'Passed', verifiedBy: 'Admin', verifiedAt: '2026-07-25', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-54', type: 'companies_house', title: 'Companies House Check', description: 'Verified', isRequired: false, status: 'approved', notes: 'Passed', verifiedBy: 'Admin', verifiedAt: '2026-07-25', externalUrl: 'https://find-and-update.company-information.service.gov.uk' }
    ]
  },
  {
    id: 'app-107',
    fullName: 'Tariq Mahmood',
    email: 't.mahmood@example.co.uk',
    phone: '+44 7700 966777',
    address: '55 Corporation St, Birmingham',
    postcode: 'B4 6AF',
    nationalInsuranceNo: 'TM 44 55 66 G',
    siaLicenceNo: '0101-3344-5566-7788',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2026-12-01',
    appliedJobId: 'job-1',
    appliedJobTitle: 'SIA Door Supervisor — West End Venues',
    appliedDate: '2026-08-05',
    currentStage: 'applied',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    adminNotes: 'Newly submitted application. Awaiting initial admin triage.',
    documents: [
      { id: 'doc-60', name: 'Tariq_Mahmood_CV.pdf', type: 'cv', fileUrl: '#', uploadedAt: '2026-08-05', size: '1.4 MB' }
    ],
    vettingChecks: [
      { id: 'chk-60', type: 'right_to_work', title: 'Right to Work (UK)', description: 'Verify UK Passport or Home Office Share Code', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://www.gov.uk/prove-right-to-work' },
      { id: 'chk-61', type: 'sia_licence', title: 'SIA Licence Verification', description: 'Check Home Office SIA Public Register', isRequired: true, status: 'pending', notes: '', externalUrl: 'https://services.sia.homeoffice.gov.uk/licence-checker' },
      { id: 'chk-62', type: 'references', title: '5-Year Reference Check', description: 'Contact previous security employers', isRequired: true, status: 'pending', notes: '', externalUrl: '#' },
      { id: 'chk-63', type: 'credit_check', title: 'Credit Check (Optional)', description: 'Optional financial audit', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://www.experian.co.uk' },
      { id: 'chk-64', type: 'companies_house', title: 'Companies House Check', description: 'Check director listings', isRequired: false, status: 'pending', notes: '', externalUrl: 'https://find-and-update.company-information.service.gov.uk' }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    applicantId: 'app-106',
    employeeId: 'UG-4019',
    fullName: 'Elena Rostova',
    email: 'elena.r@example.co.uk',
    phone: '+44 7700 955666',
    roleTitle: 'Corporate Security Officer',
    siaLicenceNo: '0209-9944-1188-3344',
    siaLicenceSector: 'Security Guarding',
    siaLicenceExpiry: '2027-09-01',
    hiredDate: '2026-08-01',
    assignedSite: 'Canary Wharf Tower 1',
    hourlyRate: 15.00,
    status: 'active'
  },
  {
    id: 'emp-2',
    applicantId: 'app-099',
    employeeId: 'UG-4018',
    fullName: 'Liam Thorne',
    email: 'l.thorne@example.co.uk',
    phone: '+44 7700 988777',
    roleTitle: 'Head Door Supervisor',
    siaLicenceNo: '0109-1234-5678-9012',
    siaLicenceSector: 'Door Supervision',
    siaLicenceExpiry: '2026-09-15', // Expiring soon alert test!
    hiredDate: '2026-05-10',
    assignedSite: 'Soho House & Venues',
    hourlyRate: 18.00,
    status: 'on_assignment'
  },
  {
    id: 'emp-3',
    applicantId: 'app-098',
    employeeId: 'UG-4017',
    fullName: 'Chloe Bennett',
    email: 'c.bennett@example.co.uk',
    phone: '+44 7700 912345',
    roleTitle: 'Control Room Operator',
    siaLicenceNo: '0301-8877-6655-4433',
    siaLicenceSector: 'CCTV (PSS)',
    siaLicenceExpiry: '2028-04-10',
    hiredDate: '2026-06-01',
    assignedSite: 'Manchester Central Control',
    hourlyRate: 15.50,
    status: 'active'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    applicantId: 'app-101',
    applicantName: 'Marcus Vance',
    action: 'Approved Reference Check (5-Year Audit)',
    timestamp: 'Today at 09:15',
    user: 'Sarah Jenkins (Admin)'
  },
  {
    id: 'act-2',
    applicantId: 'app-101',
    applicantName: 'Marcus Vance',
    action: 'Moved to Ready for Contract (All checks passed)',
    timestamp: 'Today at 10:05',
    user: 'System'
  },
  {
    id: 'act-3',
    applicantId: 'app-102',
    applicantName: 'Sarah Jenkins',
    action: 'Approved Right to Work (UK Share Code Verified)',
    timestamp: 'Yesterday at 16:00',
    user: 'Dave Miller (Admin)'
  },
  {
    id: 'act-4',
    applicantId: 'app-105',
    applicantName: 'James Harrison',
    action: 'E-Contract sent via Uniguard Portal',
    timestamp: 'Yesterday at 14:10',
    user: 'Sarah Jenkins (Admin)'
  }
];
