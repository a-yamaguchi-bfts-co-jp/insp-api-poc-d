import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useUserRole } from '../context/UserRoleContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Assignment,
  Assessment,
  CloudUpload,
  Notifications,
  Approval,
} from '@mui/icons-material';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts } = useMsal();
  const { role, isInternal } = useUserRole();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const currentUser = accounts[0];

  const menuItems = [
    { path: '/', label: 'ダッシュボード', icon: <Dashboard /> },
    { path: '/projects', label: 'プロジェクト', icon: <Assignment /> },
    { path: '/inspections', label: '検査結果', icon: <Assessment /> },
    { path: '/import', label: 'CSV取込', icon: <CloudUpload /> },
    { path: '/notifications', label: '通知', icon: <Notifications /> },
    ...(isInternal ? [{ path: '/approvals', label: '承認管理', icon: <Approval /> }] : []),
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          検査システム
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {currentUser?.name || '開発ユーザー'} ({role})
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
