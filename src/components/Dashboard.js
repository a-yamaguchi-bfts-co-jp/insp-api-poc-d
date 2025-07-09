import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useUserRole } from '../context/UserRoleContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Assessment,
  CloudUpload,
  TrendingUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { projectsApi } from '../services/apiService';

function Dashboard() {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const { role, isInternal } = useUserRole();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = accounts[0];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects();
      setProjects(response.data.slice(0, 5)); // 最新5件のみ表示
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Locked': return 'warning';
      case 'Fixed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Draft': return '下書き';
      case 'Locked': return 'ロック済';
      case 'Fixed': return '確定済';
      default: return status;
    }
  };

  const dashboardCards = [
    {
      title: 'プロジェクト管理',
      description: isInternal ? 'プロジェクトの作成・編集・承認' : '担当プロジェクトの確認',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: () => navigate('/projects'),
    },
    {
      title: '検査結果',
      description: '測定データの確認・分析',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      action: () => navigate('/inspections'),
    },
    {
      title: 'CSV取込',
      description: 'CSVファイルからデータを一括取込',
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      action: () => navigate('/import'),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        ようこそ、{currentUser?.name || '開発ユーザー'}さん ({role === 'Internal' ? '社内ユーザー' : 'サプライヤー'})
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { elevation: 4 }
              }}
              onClick={card.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              最近のプロジェクト
            </Typography>
            {loading ? (
              <Typography>読み込み中...</Typography>
            ) : projects.length > 0 ? (
              <List>
                {projects.map((project) => (
                  <ListItem key={project.id} divider>
                    <ListItemText
                      primary={`${project.partNo} - ${project.lotNo}`}
                      secondary={`作成日: ${new Date(project.createdUtc).toLocaleDateString('ja-JP')}`}
                    />
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                プロジェクトがありません
              </Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={() => navigate('/projects')}>
                すべて表示
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              クイックアクション
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {isInternal && (
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/projects/create')}
                  fullWidth
                >
                  新規プロジェクト作成
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => navigate('/import')}
                fullWidth
              >
                CSV取込
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/inspections')}
                fullWidth
              >
                検査結果確認
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              システム情報
            </Typography>
            <Typography variant="body2" color="text.secondary">
              バージョン: 1.0.0 (POC)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最終更新: 2025/06/24
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
