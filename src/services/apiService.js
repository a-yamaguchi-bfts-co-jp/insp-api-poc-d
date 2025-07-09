import axios from 'axios';

// APIのベースURL（環境変数から取得、デフォルトはlocalhost:7000）
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Axiosクライアントインスタンスを作成
 * 共通のベースURLとヘッダーを設定
 */
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * リクエストインターセプター
 * 全てのAPIリクエストに認証トークンを自動で追加
 */
apiClient.interceptors.request.use(
  (config) => {
    // ローカルストレージからアクセストークンを取得
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * レスポンスインターセプター
 * エラーハンドリングを共通化
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401エラー（認証失敗）の場合はログイン画面にリダイレクト
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * プロジェクト関連のAPI関数群
 */
export const projectsApi = {
  /**
   * プロジェクト一覧を取得
   * @returns {Promise} プロジェクト一覧のPromise
   */
  getProjects: () => apiClient.get('/projects'),
  
  /**
   * 新しいプロジェクトを作成
   * @param {Object} project - プロジェクト情報
   * @param {string} project.partNo - 部品番号
   * @param {string} project.lotNo - ロット番号
   * @param {number} project.tolUpper - 上限公差
   * @param {number} project.tolLower - 下限公差
   * @returns {Promise} 作成されたプロジェクトのPromise
   */
  createProject: (project) => apiClient.post('/projects', project),
  
  /**
   * プロジェクトを承認
   * @param {string} id - プロジェクトID
   * @returns {Promise} 承認処理のPromise
   */
  approveProject: (id) => apiClient.put(`/projects/${id}/approve`),
  
  /**
   * 検査結果一覧を取得
   * @param {Object} params - 検索パラメータ
   * @param {string} params.partNo - 部品番号（オプション）
   * @param {string} params.lotNo - ロット番号（オプション）
   * @returns {Promise} 検査結果一覧のPromise
   */
  getInspections: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.partNo) queryParams.append('partNo', params.partNo);
    if (params.lotNo) queryParams.append('lotNo', params.lotNo);
    
    const queryString = queryParams.toString();
    return apiClient.get(`/inspections${queryString ? `?${queryString}` : ''}`);
  },
  
  /**
   * CSVインポートを初期化（SAS URL取得）
   * @param {string} fileName - アップロードするファイル名
   * @param {number} size - ファイルサイズ
   * @returns {Promise} SAS URLのPromise
   */
  initializeImport: (fileName, size) => apiClient.post('/import', { fileName, size }),
  
  /**
   * 測定データに手動判定を設定
   * @param {string} recordId - 測定記録ID
   * @param {boolean} isOk - 判定結果（true: OK, false: NG）
   * @param {string} comment - 判定コメント
   * @returns {Promise} 判定処理のPromise
   */
  setJudgment: (recordId, isOk, comment) => 
    apiClient.put(`/measurements/${recordId}/judgment`, { recordId, isOk, comment }),
  
  /**
   * 通知を送信
   * @param {Object} notification - 通知情報
   * @param {string} notification.projectId - プロジェクトID
   * @param {string} notification.supplierId - サプライヤーID（オプション）
   * @param {string} notification.message - 通知メッセージ
   * @param {string} notification.notificationType - 通知タイプ
   * @returns {Promise} 通知送信のPromise
   */
  sendNotification: (notification) => apiClient.post('/notifications', notification),
  
  /**
   * 通知一覧を取得
   * @returns {Promise} 通知一覧のPromise
   */
  getNotifications: () => apiClient.get('/notifications'),
  
  /**
   * 通知を既読にマーク
   * @param {string} notificationId - 通知ID
   * @returns {Promise} 既読処理のPromise
   */
  markNotificationAsRead: (notificationId) => 
    apiClient.put(`/notifications/${notificationId}/read`),
};

/**
 * 承認フロー関連のAPI関数群
 */
export const approvalApi = {
  /**
   * 承認申請を作成
   * @param {Object} request - 承認申請情報
   * @param {string} request.projectId - プロジェクトID
   * @param {string} request.requestType - 申請種類（ProjectCreation/ProjectCompletion）
   * @param {string} request.requestComment - 申請コメント
   * @returns {Promise} 承認申請作成のPromise
   */
  createApprovalRequest: (request) => apiClient.post('/approval-requests', request),
  
  /**
   * 承認申請一覧を取得（上長用）
   * @param {string} status - ステータスフィルター（オプション）
   * @returns {Promise} 承認申請一覧のPromise
   */
  getApprovalRequests: (status) => {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/approval-requests${params}`);
  },
  
  /**
   * 自分の承認申請一覧を取得
   * @returns {Promise} 自分の承認申請一覧のPromise
   */
  getMyApprovalRequests: () => apiClient.get('/my-approval-requests'),
  
  /**
   * 承認申請詳細を取得
   * @param {string} id - 承認申請ID
   * @returns {Promise} 承認申請詳細のPromise
   */
  getApprovalRequest: (id) => apiClient.get(`/approval-requests/${id}`),
  
  /**
   * 承認処理を実行
   * @param {string} id - 承認申請ID
   * @param {boolean} isApproved - 承認するかどうか
   * @param {string} approvalComment - 承認コメント
   * @returns {Promise} 承認処理のPromise
   */
  processApproval: (id, isApproved, approvalComment) => 
    apiClient.put(`/approval-requests/${id}/process`, { isApproved, approvalComment }),
};

export default apiClient;
