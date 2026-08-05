import React, { useState } from 'react';
import { RecruitmentProvider, useRecruitment } from './context/RecruitmentContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { JobsView } from './components/jobs/JobsView';
import { ApplicantsView } from './components/applicants/ApplicantsView';
import { ApplicantDrawer } from './components/applicants/ApplicantDrawer';
import { InterviewCalendarView } from './components/interviews/InterviewCalendarView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { CreateJobModal } from './components/jobs/CreateJobModal';
import { AddApplicantModal } from './components/jobs/AddApplicantModal';
import { LandingPage } from './components/public/LandingPage';
import { LoginPage } from './components/public/LoginPage';
import { HowItWorksPanel } from './components/common/HowItWorksPanel';

const MainLayout: React.FC = () => {
  const { activePage, isAuthenticated } = useRecruitment();
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isAddApplicantOpen, setIsAddApplicantOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Redirect to landing if trying to view admin panels while not logged in
  const isAdminView = !['landing', 'login'].includes(activePage);
  if (isAdminView && !isAuthenticated) {
    return <LandingPage />;
  }

  // Render full screen landing and login pages without sidebar or header
  if (activePage === 'landing') {
    return <LandingPage />;
  }

  if (activePage === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-page text-primary selection:bg-emerald-500 selection:text-zinc-950 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header 
          onOpenCreateJob={() => setIsCreateJobOpen(true)}
          onOpenAddApplicant={() => setIsAddApplicantOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && <DashboardView />}
          {activePage === 'jobs' && <JobsView onOpenCreateJob={() => setIsCreateJobOpen(true)} />}
          {activePage === 'applicants' && <ApplicantsView onOpenAddApplicant={() => setIsAddApplicantOpen(true)} />}
          {activePage === 'interviews' && <InterviewCalendarView />}
          {activePage === 'employees' && <EmployeesView />}
          {activePage === 'reports' && <ReportsView />}
          {activePage === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ApplicantDrawer />
      <CommandPalette />
      <ToastContainer />
      <CreateJobModal isOpen={isCreateJobOpen} onClose={() => setIsCreateJobOpen(false)} />
      <AddApplicantModal isOpen={isAddApplicantOpen} onClose={() => setIsAddApplicantOpen(false)} />
      <HowItWorksPanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <RecruitmentProvider>
      <MainLayout />
    </RecruitmentProvider>
  );
}

export default App;
