import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Add, CheckCircle, Visibility, RequestPage } from '@mui/icons-material';
import { projectsApi } from '../services/apiService';
import ApprovalRequestDialog from './ApprovalRequestDialog';

function ProjectList() {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [requestType, setRequestType] = useState('ProjectCreation');

  const currentUser = accounts[0];
  const userRole = currentUser?.idTokenClaims?.roles?.[0] || 'Internal';
  const isInternal = userRole === 'Internal';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjects();
      setProjects(response.data);
      setError('');
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      setError('プロジェクトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      await projectsApi.approveProject(projectId);
      await loadProjects(); // リロード
    } catch (error) {
      console.error('承認エラー:', error);
      setError('プロジェクトの承認に失敗しました');
    }
  };

  const handleRequestApproval = (project, type) => {
    setSelectedProject(project);
    setRequestType(type);
    setApprovalDialog(true);
  };

  const handleApprovalSuccess = () => {
    loadProjects();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'PendingApproval': return 'info';
      case 'Active': return 'primary';
      case 'Locked': return 'warning';
      case 'Fixed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Draft': return '下書き';
      case 'PendingApproval': return '承認待ち';
      case 'Active': return '進行中';
      case 'Locked': return 'ロック済';
      case 'Fixed': return '確定済';
      default: return status;
    }
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          プロジェクト一覧
        </Typography>
        {isInternal && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/projects/create')}
          >
            新規作成
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>部品番号</TableCell>
              <TableCell>ロット番号</TableCell>
              <TableCell>公差上限</TableCell>
              <TableCell>公差下限</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>作成日</TableCell>
              <TableCell>承認日</TableCell>
              {isInternal && <TableCell>アクション</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isInternal ? 8 : 7} align="center">
                  <Typography color="text.secondary">
                    プロジェクトがありません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>{project.partNo}</TableCell>
                  <TableCell>{project.lotNo}</TableCell>
                  <TableCell>{project.tolUpper}</TableCell>
                  <TableCell>{project.tolLower}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(project.createdUtc).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    {project.approvedUtc 
                      ? new Date(project.approvedUtc).toLocaleDateString('ja-JP')
                      : '-'
                    }
                  </TableCell>
                  {isInternal && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {project.status === 'PendingApproval' && (
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleRequestApproval(project, 'ProjectCreation')}
                            title="作成承認申請"
                          >
                            <RequestPage />
                          </IconButton>
                        )}
                        {project.status === 'Locked' && (
                          <>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleRequestApproval(project, 'ProjectCompletion')}
                              title="完了承認申請"
                            >
                              <RequestPage />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleApprove(project.id)}
                              title="直接承認"
                            >
                              <CheckCircle />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/inspections?projectId=${project.id}`)}
                          title="詳細表示"
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {isInternal 
            ? '全てのプロジェクトが表示されています'
            : 'あなたが関連するプロジェクトのみ表示されています'
          }
        </Typography>
      </Box>

      {/* 承認申請ダイアログ */}
      <ApprovalRequestDialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        project={selectedProject}
        requestType={requestType}
        onSuccess={handleApprovalSuccess}
      />
    </Box>
  );
}

export default ProjectList;
