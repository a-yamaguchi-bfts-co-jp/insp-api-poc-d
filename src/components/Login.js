import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

function Login() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              検査システム
            </Typography>
            <Typography variant="h6" color="text.secondary">
              POC版
            </Typography>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                システム概要
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 検査プロジェクトの管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 測定データの登録・確認
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • CSVファイルの一括取込
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 社内・社外ユーザーの権限分離
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{ minWidth: 200 }}
            >
              Microsoft アカウントでログイン
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ログインには Microsoft アカウントが必要です
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
