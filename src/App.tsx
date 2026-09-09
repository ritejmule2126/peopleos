import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SearchModal } from './components/common/SearchModal';
import { CopilotDrawer } from './components/common/CopilotDrawer';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { DashboardView } from './components/modules/Dashboard/DashboardView';
import { EmployeesView } from './components/modules/Employees/EmployeesView';
import { AttendanceView } from './components/modules/Attendance/AttendanceView';
import { LeavesView } from './components/modules/Leaves/LeavesView';
import { PerformanceView } from './components/modules/Performance/PerformanceView';
import { HelpdeskView } from './components/modules/Helpdesk/HelpdeskView';
import { OnboardingView } from './components/modules/Onboarding/OnboardingView';
import { AnalyticsView } from './components/modules/Analytics/AnalyticsView';
import { SettingsView } from './components/modules/Settings/SettingsView';
import { AuthPage } from './components/auth/AuthPage';

const MainLayout: React.FC = () => {
  const { activeModule, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Top Header with live punch clock and role switcher */}
        <Header />

        {/* View Router */}
        {activeModule === 'dashboard' && <DashboardView />}
        {activeModule === 'employees' && <EmployeesView />}
        {activeModule === 'attendance' && <AttendanceView />}
        {activeModule === 'leaves' && <LeavesView />}
        {activeModule === 'performance' && <PerformanceView />}
        {activeModule === 'helpdesk' && <HelpdeskView />}
        {activeModule === 'onboarding' && <OnboardingView />}
        {activeModule === 'analytics' && <AnalyticsView />}
        {activeModule === 'settings' && <SettingsView />}
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal />

      {/* PeopleOS AI Copilot / Oracle Drawer */}
      <CopilotDrawer />

      {/* Power User Keyboard Shortcuts Modal (?) */}
      <ShortcutsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
