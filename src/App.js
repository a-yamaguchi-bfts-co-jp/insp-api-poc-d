import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { useUserRole } from './context/UserRoleContext';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DevRoleSwitcher from './components/DevRoleSwitcher';
import ProjectList from './components/ProjectList';
import ProjectCreate from './components/ProjectCreate';
import InspectionList from './components/InspectionList';
import CsvImport from './components/CsvImport';
import NotificationList from './components/NotificationList';
import ApprovalList from './components/ApprovalList';

function App() {
  const { role, isDevelopment } = useUserRole();
  const isAuthenticated = role !== 'Guest';

  if (!isDevelopment && !isAuthenticated) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <DevRoleSwitcher />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/create" element={<ProjectCreate />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/import" element={<CsvImport />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/approvals" element={<ApprovalList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
