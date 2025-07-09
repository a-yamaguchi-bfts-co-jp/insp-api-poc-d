import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Search, ExpandMore, Edit, Send } from '@mui/icons-material';
import { projectsApi } from '../services/apiService';

function InspectionList() {
  const [searchParams] = useSearchParams();
  const { accounts } = useMsal();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchForm, setSearchForm] = useState({
    partNo: searchParams.get('partNo') || '',
    lotNo: searchParams.get('lotNo') || '',
  });
  
  // 手動判定ダイアログの状態
  const [judgmentDialog, setJudgmentDialog] = useState({
    open: false,
    record: null,
    project: null,
    judgment: 'ok',
    comment: ''
  });
  
  // 通知ダイアログの状態
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    project: null,
    message: '',
    supplierId: ''
  });

  const currentUser = accounts[0];
  const userRole = currentUser?.idTokenClaims?.roles?.[0] || 'Internal';
  const isInternal = userRole === 'Internal';

  useEffect(() => {
    // 初期ロード時にプロジェクトIDが指定されている場合は検索実行
    const projectId = searchParams.get('projectId');
    if (projectId) {
      handleSearch();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (searchForm.partNo) params.partNo = searchForm.partNo;
      if (searchForm.lotNo) params.lotNo = searchForm.lotNo;
      
      const response = await projectsApi.getInspections(params);
      setInspections(response.data);
    } catch (error) {
      console.error('検査結果取得エラー:', error);
      setError('検査結果の取得に失敗しました');
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

  const isValueInRange = (value, tolLower, tolUpper) => {
    return value >= tolLower && value <= tolUpper;
  };

  // 手動判定ダイアログを開く
  const openJudgmentDialog = (record, project) => {
    setJudgmentDialog({
      open: true,
      record,
      project,
      judgment: record.manualJudgment !== null ? (record.manualJudgment ? 'ok' : 'ng') : 'ok',
      comment: record.judgmentComment || ''
    });
  };

  // 手動判定を保存
  const handleSaveJudgment = async () => {
    try {
      const isOk = judgmentDialog.judgment === 'ok';
      await projectsApi.setJudgment(judgmentDialog.record.id, isOk, judgmentDialog.comment);
      
      // データを再取得
      await handleSearch();
      
      // ダイアログを閉じる
      setJudgmentDialog({ open: false, record: null, project: null, judgment: 'ok', comment: '' });
    } catch (error) {
      console.error('判定保存エラー:', error);
      setError('判定の保存に失敗しました');
    }
  };

  // 通知ダイアログを開く
  const openNotificationDialog = (project) => {
    setNotificationDialog({
      open: true,
      project,
      message: `プロジェクト ${project.partNo} - ${project.lotNo} の検査結果をお知らせします。`,
      supplierId: ''
    });
  };

  // 通知を送信
  const handleSendNotification = async () => {
    try {
      await projectsApi.sendNotification({
        projectId: notificationDialog.project.id,
        supplierId: notificationDialog.supplierId || null,
        message: notificationDialog.message,
        notificationType: 'Info'
      });
      
      // ダイアログを閉じる
      setNotificationDialog({ open: false, project: null, message: '', supplierId: '' });
      
      // 成功メッセージを表示
      setError(''); // エラーをクリア
    } catch (error) {
      console.error('通知送信エラー:', error);
      setError('通知の送信に失敗しました');
    }
  };

  // 最終判定を取得（手動判定がある場合は手動判定、ない場合は自動判定）
  const getFinalJudgment = (record, project) => {
    if (record.manualJudgment !== null) {
      return {
        isOk: record.manualJudgment,
        isManual: true,
        comment: record.judgmentComment
      };
    }
    return {
      isOk: isValueInRange(record.value, project.tolLower, project.tolUpper),
      isManual: false,
      comment: null
    };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        検査結果
      </Typography>

      {/* 検索フォーム */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          検索条件
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="部品番号"
              name="partNo"
              value={searchForm.partNo}
              onChange={handleInputChange}
              placeholder="例: PART-001"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ロット番号"
              name="lotNo"
              value={searchForm.lotNo}
              onChange={handleInputChange}
              placeholder="例: LOT-2025001"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
              fullWidth
            >
              {loading ? '検索中...' : '検索'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 検査結果一覧 */}
      {inspections.length > 0 ? (
        <Box>
          {inspections.map((project) => (
            <Accordion key={project.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6">
                    {project.partNo} - {project.lotNo}
                  </Typography>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    測定データ: {project.records?.length || 0}件
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      公差上限
                    </Typography>
                    <Typography variant="body1">
                      {project.tolUpper}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      公差下限
                    </Typography>
                    <Typography variant="body1">
                      {project.tolLower}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      作成日
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.createdUtc).toLocaleDateString('ja-JP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      承認日
                    </Typography>
                    <Typography variant="body1">
                      {project.approvedUtc 
                        ? new Date(project.approvedUtc).toLocaleDateString('ja-JP')
                        : '-'
                      }
                    </Typography>
                  </Grid>
                </Grid>

                {project.records && project.records.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      {isInternal && (
                        <Button
                          variant="outlined"
                          startIcon={<Send />}
                          onClick={() => openNotificationDialog(project)}
                          size="small"
                        >
                          結果通知
                        </Button>
                      )}
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>測定No</TableCell>
                            <TableCell>サプライヤーID</TableCell>
                            <TableCell>測定値</TableCell>
                            <TableCell>判定</TableCell>
                            {isInternal && <TableCell>アクション</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.records.map((record) => {
                            const finalJudgment = getFinalJudgment(record, project);
                            return (
                              <TableRow key={record.id}>
                                <TableCell>{record.measureNo}</TableCell>
                                <TableCell>{record.supplierId}</TableCell>
                                <TableCell>
                                  <Typography
                                    color={finalJudgment.isOk ? 'text.primary' : 'error'}
                                    fontWeight={finalJudgment.isOk ? 'normal' : 'bold'}
                                  >
                                    {record.value}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={finalJudgment.isOk ? 'OK' : 'NG'}
                                      color={finalJudgment.isOk ? 'success' : 'error'}
                                      size="small"
                                    />
                                    {finalJudgment.isManual && (
                                      <Chip
                                        label="手動"
                                        color="info"
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                  {finalJudgment.comment && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      {finalJudgment.comment}
                                    </Typography>
                                  )}
                                </TableCell>
                                {isInternal && (
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      onClick={() => openJudgmentDialog(record, project)}
                                      title="手動判定"
                                    >
                                      <Edit />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    測定データがありません
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        !loading && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              検索条件を入力して検索してください
            </Typography>
          </Paper>
        )
      )}

      {/* 手動判定ダイアログ */}
      <Dialog open={judgmentDialog.open} onClose={() => setJudgmentDialog({ ...judgmentDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>手動判定</DialogTitle>
        <DialogContent>
          {judgmentDialog.record && judgmentDialog.project && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                測定No: {judgmentDialog.record.measureNo} | サプライヤー: {judgmentDialog.record.supplierId}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                測定値: {judgmentDialog.record.value} | 公差: {judgmentDialog.project.tolLower} ～ {judgmentDialog.project.tolUpper}
              </Typography>
              
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">判定結果</FormLabel>
                <RadioGroup
                  value={judgmentDialog.judgment}
                  onChange={(e) => setJudgmentDialog({ ...judgmentDialog, judgment: e.target.value })}
                  row
                >
                  <FormControlLabel value="ok" control={<Radio />} label="OK" />
                  <FormControlLabel value="ng" control={<Radio />} label="NG" />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="判定コメント"
                multiline
                rows={3}
                value={judgmentDialog.comment}
                onChange={(e) => setJudgmentDialog({ ...judgmentDialog, comment: e.target.value })}
                sx={{ mt: 2 }}
                placeholder="判定理由やコメントを入力してください"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJudgmentDialog({ ...judgmentDialog, open: false })}>
            キャンセル
          </Button>
          <Button onClick={handleSaveJudgment} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知ダイアログ */}
      <Dialog open={notificationDialog.open} onClose={() => setNotificationDialog({ ...notificationDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>結果通知</DialogTitle>
        <DialogContent>
          {notificationDialog.project && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                プロジェクト: {notificationDialog.project.partNo} - {notificationDialog.project.lotNo}
              </Typography>
              
              <TextField
                fullWidth
                label="通知対象サプライヤーID"
                value={notificationDialog.supplierId}
                onChange={(e) => setNotificationDialog({ ...notificationDialog, supplierId: e.target.value })}
                sx={{ mt: 2 }}
                placeholder="空欄の場合は全サプライヤーに通知"
                helperText="特定のサプライヤーのみに通知する場合はIDを入力"
              />

              <TextField
                fullWidth
                label="通知メッセージ"
                multiline
                rows={4}
                value={notificationDialog.message}
                onChange={(e) => setNotificationDialog({ ...notificationDialog, message: e.target.value })}
                sx={{ mt: 2 }}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog({ ...notificationDialog, open: false })}>
            キャンセル
          </Button>
          <Button onClick={handleSendNotification} variant="contained" disabled={!notificationDialog.message.trim()}>
            送信
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InspectionList;
