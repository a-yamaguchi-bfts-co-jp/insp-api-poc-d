import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Info,
  Description,
} from '@mui/icons-material';
import { projectsApi } from '../services/apiService';

function CsvImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setMessage('CSVファイルを選択してください');
        setMessageType('error');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('ファイルを選択してください');
      setMessageType('error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage('アップロード準備中...');
      setMessageType('info');

      // ファイル名からプロジェクトIDを取得（例: {projectId}.csv）
      const fileName = selectedFile.name;
      const projectId = fileName.replace('.csv', '');

      // SAS URLを取得
      setUploadProgress(25);
      setMessage('アップロードURL取得中...');
      const response = await projectsApi.initializeImport(fileName);
      const { sasUrl } = response.data;

      // ファイルをBlob Storageにアップロード
      setUploadProgress(50);
      setMessage('ファイルアップロード中...');
      
      const uploadResponse = await fetch(sasUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': 'text/csv',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('ファイルのアップロードに失敗しました');
      }

      setUploadProgress(100);
      setMessage('アップロードが完了しました。CSVファイルの処理が開始されます。');
      setMessageType('success');
      
      // ファイル選択をリセット
      setSelectedFile(null);
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('アップロードエラー:', error);
      setMessage('アップロードに失敗しました: ' + error.message);
      setMessageType('error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const csvFormatInstructions = [
    {
      icon: <Info color="primary" />,
      primary: 'ファイル名形式',
      secondary: '{プロジェクトID}.csv (例: 12345678-1234-1234-1234-123456789012.csv)',
    },
    {
      icon: <Description color="primary" />,
      primary: 'CSV形式',
      secondary: 'SupplierId,Value (ヘッダー行は不要)',
    },
    {
      icon: <CheckCircle color="success" />,
      primary: 'データ例',
      secondary: 'SUPPLIER001,10.25',
    },
    {
      icon: <Error color="warning" />,
      primary: '注意事項',
      secondary: 'プロジェクトが存在し、Draft状態である必要があります',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        CSV取込
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        測定データをCSVファイルから一括取込できます
      </Typography>

      {/* アップロードエリア */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <label htmlFor="csv-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              size="large"
              disabled={uploading}
              sx={{ mb: 2 }}
            >
              CSVファイルを選択
            </Button>
          </label>

          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                選択されたファイル:
              </Typography>
              <Typography variant="body1">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            size="large"
          >
            {uploading ? 'アップロード中...' : 'アップロード開始'}
          </Button>
        </Box>
      </Paper>

      {/* メッセージ表示 */}
      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* CSV形式説明 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            CSV形式について
          </Typography>
          <List>
            {csvFormatInstructions.map((instruction, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {instruction.icon}
                </ListItemIcon>
                <ListItemText
                  primary={instruction.primary}
                  secondary={instruction.secondary}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* 処理フロー説明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          処理フロー
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          1. CSVファイルをアップロード
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          2. Azure Functionが自動的にファイルを処理
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          3. 測定データがデータベースに登録
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          4. プロジェクトのステータスが「ロック済」に変更
        </Typography>
        <Typography variant="body2" color="text.secondary">
          5. 社内ユーザーが承認処理を実行可能
        </Typography>
      </Paper>
    </Box>
  );
}

export default CsvImport;
