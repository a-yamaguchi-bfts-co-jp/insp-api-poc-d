import React from 'react';
import { useMsal } from '@azure/msal-react';
import { supplierLoginRequest } from '../auth/authConfig';
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
  LocalShipping as SupplierIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

function SupplierLogin({ onBack }) {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(supplierLoginRequest).catch((e) => {
      console.error('Supplier login error:', e);
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
              icon={<SupplierIcon />} 
              label="サプライヤー" 
              color="secondary" 
              variant="outlined"
            />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SupplierIcon 
              sx={{ 
                fontSize: 80, 
                color: 'secondary.main', 
                mb: 2 
              }} 
            />
            <Typography component="h1" variant="h4" gutterBottom>
              サプライヤーログイン
            </Typography>
            <Typography variant="h6" color="text.secondary">
              部品供給業者様専用
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>サプライヤー様専用</strong><br />
              部品供給業者の皆様はこちらからログインしてください。
            </Typography>
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">
                  利用可能な機能
                </Typography>
              </Box>
              <Box sx={{ pl: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <ViewIcon sx={{ mr: 1, fontSize: 16 }} />
                  関与するプロジェクトの閲覧
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <UploadIcon sx={{ mr: 1, fontSize: 16 }} />
                  測定データ（CSV）のアップロード
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <ViewIcon sx={{ mr: 1, fontSize: 16 }} />
                  検査結果の確認
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1, fontSize: 16 }} />
                  プロジェクトステータスの確認
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                📋 ご利用の流れ
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  1. Microsoft アカウントでログイン
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  2. 担当プロジェクトの確認
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  3. 測定データ（CSV）のアップロード
                </Typography>
                <Typography variant="body2">
                  4. 検査結果の確認
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, bgcolor: 'grey.100' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                💡 CSVファイル形式について
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                測定データは以下の形式でアップロードしてください：
              </Typography>
              <Box sx={{ 
                bgcolor: 'grey.200', 
                p: 1, 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                SupplierId,Value,Remarks<br />
                SUPPLIER001,10.5,正常<br />
                SUPPLIER001,10.3,正常
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
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
              ログインに問題がある場合は、担当者までお問い合わせください
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default SupplierLogin;
