import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { approvalApi } from '../services/apiService';

function ApprovalRequestDialog({ 
  open, 
  onClose, 
  project, 
  requestType = 'ProjectCreation',
  onSuccess 
}) {
  const [requestComment, setRequestComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!project || !requestComment.trim()) {
      setError('申請理由を入力してください。');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await approvalApi.createApprovalRequest({
        projectId: project.id,
        requestType: requestType,
        requestComment: requestComment.trim()
      });

      setRequestComment('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('承認申請作成エラー:', error);
      setError(error.response?.data?.message || '承認申請の作成に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRequestComment('');
      setError('');
      onClose();
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'ProjectCreation': return 'プロジェクト作成承認';
      case 'ProjectCompletion': return 'プロジェクト完了承認';
      default: return type;
    }
  };

  const getRequestTypeDescription = (type) => {
    switch (type) {
      case 'ProjectCreation': 
        return 'このプロジェクトの作成について上長の承認を申請します。承認後、プロジェクトが開始されます。';
      case 'ProjectCompletion': 
        return 'このプロジェクトの完了について上長の承認を申請します。承認後、プロジェクトが確定されます。';
      default: 
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {getRequestTypeLabel(requestType)}申請
      </DialogTitle>
      <DialogContent>
        {project && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              プロジェクト情報
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              部品番号: {project.partNo}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ロット番号: {project.lotNo}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              公差: {project.tolLower} ～ {project.tolUpper}
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
              {getRequestTypeDescription(requestType)}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="申請理由"
              value={requestComment}
              onChange={(e) => setRequestComment(e.target.value)}
              placeholder="承認を申請する理由を詳しく入力してください"
              required
              error={!requestComment.trim() && error}
              helperText={!requestComment.trim() && error ? '申請理由は必須です' : ''}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={submitting || !requestComment.trim()}
        >
          {submitting ? '申請中...' : '申請する'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApprovalRequestDialog;
