import React from 'react';
import { useMsal } from '@azure/msal-react';
import { internalLoginRequest } from '../auth/authConfig';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
} from '@mui/material';
import {
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

function InternalLogin({ onBack }) {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(internalLoginRequest).catch((e) => {
      console.error('Internal login error:', e);
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ mr: 2 }}
            >
              戻る
            </Button>
            <Chip 
              icon={<BusinessIcon />} 
              label="内部ユーザー" 
              color="primary" 
              variant="outlined"
            />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon 
              sx={{ 
                fontSize: 80, 
                color: 'primary.main', 
                mb: 2 
              }} 
            />
            <Typography component="h1" variant="h4" gutterBottom>
              内部ユーザーログイン
            </Typography>
            <Typography variant="h6" color="text.secondary">
              検査システム管理者・担当者用
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>内部ユーザー専用</strong><br />
              社内の検査担当者および管理者の方はこちらからログインしてください。
            </Typography>
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AdminIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  利用可能な機能
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ✓ 検査プロジェクトの作成・編集
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ✓ プロジェクトの承認・却下
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ✓ 全プロジェクトの閲覧・管理
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ✓ 検査結果の確認・分析
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ✓ サプライヤー管理
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ システム設定・ユーザー管理
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  セキュリティ要件
                </Typography>
              </Box>
              <Typography variant="body2">
                内部ユーザーとしてログインするには、組織のMicrosoft アカウントが必要です。
                適切な権限が付与されたアカウントでログインしてください。
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{ 
                minWidth: 250,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Microsoft アカウントでログイン
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ログインに問題がある場合は、システム管理者にお問い合わせください
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default InternalLogin;
