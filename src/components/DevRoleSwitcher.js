import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper
} from '@mui/material';
import { useUserRole } from '../context/UserRoleContext';

const DevRoleSwitcher = () => {
  const { userRole, setUserRole } = useUserRole();

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleRoleChange = (event) => {
    setUserRole(event.target.value);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed',
        top: 16,
        right: 16,
        p: 2,
        zIndex: 1000,
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        minWidth: 200
      }}
    >
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Development Mode
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="dev-role-label">User Role</InputLabel>
        <Select
          labelId="dev-role-label"
          id="dev-role-select"
          value={userRole || ''}
          label="User Role"
          onChange={handleRoleChange}
        >
          <MenuItem value="">
            <em>No Role</em>
          </MenuItem>
          <MenuItem value="Internal">Internal User</MenuItem>
          <MenuItem value="Supplier">Supplier User</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Current: {userRole || 'None'}
      </Typography>
    </Paper>
  );
};

export default DevRoleSwitcher;
