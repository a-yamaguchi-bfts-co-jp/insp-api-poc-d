import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocalShipping as SupplierIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import InternalLogin from './InternalLogin';
import SupplierLogin from './SupplierLogin';

function LoginSelection() {
  const [selectedUserType, setSelectedUserType] = useState(null);

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
  };

  const handleBack = () => {
    setSelectedUserType(null);
  };

  // ユーザータイプが選択されている場合、対応するログイン画面を表示
  if (selectedUserType === 'internal') {
    return <InternalLogin onBack={handleBack} />;
  }

  if (selectedUserType === 'supplier') {
    return <SupplierLogin onBack={handleBack} />;
  }

  // ユーザータイプ選択画面
  return (
    <Container component="main" maxWidth="md">
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

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                システム概要
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 検査プロジェクトの管理
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • 測定データの登録・確認
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • CSVファイルの一括取込
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 社内・社外ユーザーの権限分離
              </Typography>
            </CardContent>
          </Card>

          <Divider sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              ログインするユーザータイプを選択してください
            </Typography>
          </Divider>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handleUserTypeSelect('internal')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <BusinessIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: 'primary.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h5" gutterBottom>
                    内部ユーザー
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    社内の検査担当者・管理者
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      主な機能：
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • プロジェクト作成・承認
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 全プロジェクトの閲覧
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 検査結果の確認・管理
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserTypeSelect('internal');
                    }}
                  >
                    内部ユーザーとしてログイン
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handleUserTypeSelect('supplier')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SupplierIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: 'secondary.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h5" gutterBottom>
                    サプライヤー
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    外部の部品供給業者
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      主な機能：
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 関与プロジェクトの閲覧
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 測定データのアップロード
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 検査結果の確認
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserTypeSelect('supplier');
                    }}
                  >
                    サプライヤーとしてログイン
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ログインには Microsoft アカウントが必要です
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginSelection;
