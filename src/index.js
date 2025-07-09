import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { msalConfig } from './auth/authConfig';
import { UserRoleProvider } from './context/UserRoleContext';

// MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <UserRoleProvider>
            <App />
          </UserRoleProvider>
        </ThemeProvider>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);
