import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { useUserRole } from '../context/UserRoleContext';

const DevRoleSwitcher = () => {
  const { role, setDevRole, isDevelopment } = useUserRole();

  if (!isDevelopment) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        p: 2,
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: 1,
        zIndex: 9999,
      }}
    >
      <Typography variant="caption" display="block" gutterBottom>
        Dev Role Switcher
      </Typography>
      <ButtonGroup variant="contained" size="small">
        <Button
          onClick={() => setDevRole('Internal')}
          disabled={role === 'Internal'}
        >
          Internal
        </Button>
        <Button
          onClick={() => setDevRole('Supplier')}
          disabled={role === 'Supplier'}
        >
          Supplier
        </Button>
      </ButtonGroup>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Current Role: {role}
      </Typography>
    </Box>
  );
};

export default DevRoleSwitcher;
