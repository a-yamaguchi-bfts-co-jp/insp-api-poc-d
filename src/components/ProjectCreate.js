import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { projectsApi } from '../services/apiService';

/**
 * プロジェクト作成コンポーネント
 * 内部ユーザーが新しい検査プロジェクトを作成するためのフォーム
 */
function ProjectCreate() {
  const navigate = useNavigate();
  
  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    partNo: '',    // 部品番号
    lotNo: '',     // ロット番号
    tolUpper: '',  // 公差上限
    tolLower: '',  // 公差下限
  });
  
  // UI状態の管理
  const [loading, setLoading] = useState(false);     // 送信中フラグ
  const [error, setError] = useState('');           // エラーメッセージ
  const [success, setSuccess] = useState('');       // 成功メッセージ

  /**
   * フォーム入力値変更ハンドラー
   * @param {Event} e - 入力イベント
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * フォーム送信ハンドラー
   * バリデーションを行い、APIを呼び出してプロジェクトを作成
   * @param {Event} e - フォーム送信イベント
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 必須項目のバリデーション
    if (!formData.partNo || !formData.lotNo || !formData.tolUpper || !formData.tolLower) {
      setError('全ての項目を入力してください');
      return;
    }

    // 数値変換とバリデーション
    const tolUpper = parseFloat(formData.tolUpper);
    const tolLower = parseFloat(formData.tolLower);

    if (isNaN(tolUpper) || isNaN(tolLower)) {
      setError('公差は数値で入力してください');
      return;
    }

    // 公差の論理チェック（上限 > 下限）
    if (tolUpper <= tolLower) {
      setError('公差上限は公差下限より大きい値を入力してください');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // APIリクエスト用のデータを準備
      const projectData = {
        partNo: formData.partNo,
        lotNo: formData.lotNo,
        tolUpper: tolUpper,
        tolLower: tolLower,
      };

      // プロジェクト作成APIを呼び出し
      await projectsApi.createProject(projectData);
      setSuccess('プロジェクトが正常に作成されました');
      
      // 成功メッセージ表示後、プロジェクト一覧画面に遷移
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
      
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      setError('プロジェクトの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * キャンセルボタンクリックハンドラー
   * プロジェクト一覧画面に戻る
   */
  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        新規プロジェクト作成
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="部品番号"
                name="partNo"
                value={formData.partNo}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="例: PART-001"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ロット番号"
                name="lotNo"
                value={formData.lotNo}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="例: LOT-2025001"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="公差上限"
                name="tolUpper"
                type="number"
                value={formData.tolUpper}
                onChange={handleChange}
                required
                disabled={loading}
                inputProps={{ step: 0.001 }}
                placeholder="例: 10.5"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="公差下限"
                name="tolLower"
                type="number"
                value={formData.tolLower}
                onChange={handleChange}
                required
                disabled={loading}
                inputProps={{ step: 0.001 }}
                placeholder="例: 9.5"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? '作成中...' : '作成'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          ※ プロジェクト作成後、サプライヤーがCSVファイルをアップロードできるようになります
        </Typography>
      </Box>
    </Box>
  );
}

export default ProjectCreate;
