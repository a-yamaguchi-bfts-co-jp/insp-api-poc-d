import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import { Notifications, NotificationsActive, CheckCircle } from '@mui/icons-material';
import { projectsApi } from '../services/apiService';

function NotificationList() {
  const { accounts } = useMsal();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = accounts[0];
  const userRole = currentUser?.idTokenClaims?.roles?.[0] || 'Internal';

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getNotifications();
      setNotifications(response.data);
      setError('');
    } catch (error) {
      console.error('通知取得エラー:', error);
      setError('通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await projectsApi.markNotificationAsRead(notificationId);
      await loadNotifications(); // リロード
    } catch (error) {
      console.error('既読マークエラー:', error);
      setError('既読マークに失敗しました');
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'Info': return 'info';
      case 'Warning': return 'warning';
      case 'Error': return 'error';
      default: return 'default';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'Info': return '情報';
      case 'Warning': return '警告';
      case 'Error': return 'エラー';
      default: return type;
    }
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        通知
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {notifications.length > 0 ? (
        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {notification.isRead ? (
                      <Notifications color="disabled" />
                    ) : (
                      <NotificationsActive color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={getNotificationTypeLabel(notification.notificationType)}
                          color={getNotificationTypeColor(notification.notificationType)}
                          size="small"
                        />
                        {!notification.isRead && (
                          <Chip
                            label="未読"
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          送信者: {notification.createdBy} | 
                          送信日時: {new Date(notification.createdUtc).toLocaleString('ja-JP')}
                          {notification.supplierId && ` | 対象: ${notification.supplierId}`}
                        </Typography>
                        {notification.isRead && notification.readUtc && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            既読日時: {new Date(notification.readUtc).toLocaleString('ja-JP')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <IconButton
                      edge="end"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="既読にする"
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            通知はありません
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {userRole === 'Internal' 
            ? '全ての通知が表示されています'
            : 'あなた宛ての通知のみ表示されています'
          }
        </Typography>
      </Box>
    </Box>
  );
}

export default NotificationList;
