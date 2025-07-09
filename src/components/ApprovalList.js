import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { approvalApi } from '../services/apiService';

function ApprovalList() {
  const { accounts } = useMsal();
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);

  const currentUser = accounts[0];
  const userRole = currentUser?.idTokenClaims?.roles?.[0] || 'Internal';
  const isManager = userRole === 'Manager' || userRole === 'Internal';

  useEffect(() => {
    loadApprovalRequests();
  }, [statusFilter]);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getApprovalRequests(statusFilter);
      setApprovalRequests(response.data);
      setError('');
    } catch (error) {
      console.error('承認申請取得エラー:', error);
      setError('承認申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalProcess = async (isApproved) => {
    if (!selectedRequest) return;

    try {
      setProcessingApproval(true);
      await approvalApi.processApproval(
        selectedRequest.id,
        isApproved,
        approvalComment
      );
      
      setApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalComment('');
      await loadApprovalRequests();
    } catch (error) {
      console.error('承認処理エラー:', error);
      setError('承認処理に失敗しました');
    } finally {
      setProcessingApproval(false);
    }
  };

  const openApprovalDialog = (request) => {
    setSelectedRequest(request);
    setApprovalDialog(true);
    setApprovalComment('');
  };

  const closeApprovalDialog = () => {
    setApprovalDialog(false);
    setSelectedRequest(null);
    setApprovalComment('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return '承認待ち';
      case 'Approved': return '承認済み';
      case 'Rejected': return '却下';
      default: return status;
    }
  };

  const getRequestTypeLabel = (requestType) => {
    switch (requestType) {
      case 'ProjectCreation': return 'プロジェクト作成';
      case 'ProjectCompletion': return 'プロジェクト完了';
      default: return requestType;
    }
  };

  if (!isManager) {
    return (
      <Box>
        <Alert severity="warning">
          承認権限がありません。
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          承認申請一覧
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={statusFilter}
            label="ステータス"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">全て</MenuItem>
            <MenuItem value="Pending">承認待ち</MenuItem>
            <MenuItem value="Approved">承認済み</MenuItem>
            <MenuItem value="Rejected">却下</MenuItem>
          </Select>
        </FormControl>
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
              <TableCell>申請種類</TableCell>
              <TableCell>部品番号</TableCell>
              <TableCell>ロット番号</TableCell>
              <TableCell>申請者</TableCell>
              <TableCell>申請日</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>承認者</TableCell>
              <TableCell>承認日</TableCell>
              <TableCell>アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvalRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">
                    承認申請がありません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              approvalRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{getRequestTypeLabel(request.requestType)}</TableCell>
                  <TableCell>{request.partNo}</TableCell>
                  <TableCell>{request.lotNo}</TableCell>
                  <TableCell>{request.requestedByName}</TableCell>
                  <TableCell>
                    {new Date(request.requestedUtc).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(request.status)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.approvedByName || '-'}</TableCell>
                  <TableCell>
                    {request.approvedUtc 
                      ? new Date(request.approvedUtc).toLocaleDateString('ja-JP')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {request.status === 'Pending' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openApprovalDialog(request)}
                          title="承認処理"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => {/* 詳細表示の実装 */}}
                        title="詳細表示"
                      >
                        <Visibility />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 承認処理ダイアログ */}
      <Dialog open={approvalDialog} onClose={closeApprovalDialog} maxWidth="sm" fullWidth>
        <DialogTitle>承認処理</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {getRequestTypeLabel(selectedRequest.requestType)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                部品番号: {selectedRequest.partNo} / ロット番号: {selectedRequest.lotNo}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                申請者: {selectedRequest.requestedByName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                申請理由: {selectedRequest.requestComment}
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="承認コメント"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="承認または却下の理由を入力してください"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApprovalDialog}>
            キャンセル
          </Button>
          <Button
            onClick={() => handleApprovalProcess(false)}
            color="error"
            disabled={processingApproval}
            startIcon={<Cancel />}
          >
            却下
          </Button>
          <Button
            onClick={() => handleApprovalProcess(true)}
            color="primary"
            disabled={processingApproval}
            startIcon={<CheckCircle />}
          >
            承認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApprovalList;
