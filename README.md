# 検査システム フロントエンド

React + Material-UIで構築された検査システムのフロントエンドアプリケーションです。

## 機能

### 共通機能
- Microsoft Azure AD認証
- レスポンシブデザイン
- 社内・社外ユーザーの権限分離

### 社内ユーザー（Internal）
- プロジェクト作成・編集
- プロジェクト承認
- 全プロジェクトの閲覧
- 検査結果の確認・分析
- CSV取込機能

### 社外ユーザー（Supplier）
- 担当プロジェクトの閲覧
- 検査結果の確認
- CSV取込機能

## 技術スタック

- **React** 18.2.0
- **Material-UI** 5.15.3
- **Azure MSAL** (認証)
- **React Router** (ルーティング)
- **Axios** (HTTP通信)

## セットアップと環境別の動作

### 1. ローカル開発環境 (`local_poc` ブランチ)

#### 1.1 セットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数ファイルを作成
# .env.local というファイル名で、以下の内容を記述します
REACT_APP_API_BASE_URL=http://localhost:5000

# 開発サーバーの起動
npm start
```
アプリケーションは `http://localhost:3000` で起動します。

#### 1.2 動作仕様
- **認証**: 認証はバイパスされます。画面右下の「Dev Role Switcher」で役割（Internal/Supplier）を動的に切り替えてテストします。
- **API接続**: ローカルで起動しているバックエンド (`http://localhost:5000`) に接続します。

### 2. Azure環境 (dev / staging / main)

#### 2.1 セットアップ
Azure環境では、CI/CDパイプラインによって自動的にビルドとデプロイが行われます。手動でのセットアップは基本的に不要です。

#### 2.2 環境変数
APIの接続先や認証情報は、Azure Static Web Appsの **[構成]** メニューで環境変数として設定します。

```
# 例: Azure開発環境の設定
REACT_APP_API_BASE_URL = "https://dev-api.example.com"

# 例: ステージング/本番環境の設定
REACT_APP_API_BASE_URL = "https://stg-api.example.com"
REACT_APP_AUTH_AUTHORITY = "https://login.microsoftonline.com/..."
REACT_APP_AUTH_CLIENT_ID = "..."
```

#### 2.3 動作仕様
- **Azure開発環境 (`dev`ブランチ)**: 認証は無効化、または簡易認証で動作します。
- **ステージング/本番環境 (`staging`/`main`ブランチ)**: Azure AD/Entra IDによる完全な認証が必須となります。

## ビルドとデプロイ (Azure環境)

Azure環境へのデプロイは、CI/CDパイプラインによる自動化を推奨します。

### 1. ビルド
デプロイの前に、最適化された本番用の静的ファイルを生成します。
```bash
npm run build
```
このコマンドにより、プロジェクトのルートに `build` ディレクトリが作成され、デプロイに必要なファイルが格納されます。

### 2. デプロイ
生成された `build` ディレクトリを **Azure Static Web Apps** にデプロイします。

#### 2.1. CI/CDパイプラインによる自動デプロイ (推奨)
GitHub ActionsなどのCI/CDツールと連携させることで、特定のブランチ（例: `dev`, `staging`, `main`）へのプッシュをトリガーに、自動でビルドとデプロイを実行できます。Azure Static Web Appsリソース作成時のウィザードに従うことで、基本的なパイプラインは自動生成されます。

#### 2.2. 手動デプロイ (Azure CLI)
Azure CLIを使用して手動でデプロイすることも可能です。
```bash
# 1. ビルドを実行
npm run build

# 2. Azure CLIでデプロイ
az staticwebapp deploy \
  --name <あなたのStatic Web App名> \
  --resource-group <リソースグループ名> \
  --source ./build
```

## ディレクトリ構成

```
src/
├── components/          # Reactコンポーネント
│   ├── Dashboard.js     # ダッシュボード
│   ├── Header.js        # ヘッダー・ナビゲーション
│   ├── Login.js         # ログイン画面
│   ├── ProjectList.js   # プロジェクト一覧
│   ├── ProjectCreate.js # プロジェクト作成
│   ├── InspectionList.js# 検査結果一覧
│   └── CsvImport.js     # CSV取込
├── services/            # API通信
│   └── apiService.js    # APIクライアント
├── auth/                # 認証設定
│   └── authConfig.js    # MSAL設定
├── App.js               # メインアプリケーション
└── index.js             # エントリーポイント
```

## 画面構成

### 1. ログイン画面
- Microsoft アカウントでの認証
- システム概要の表示

### 2. ダッシュボード
- ユーザー情報の表示
- 最近のプロジェクト一覧
- クイックアクション

### 3. プロジェクト管理
- プロジェクト一覧表示
- 新規プロジェクト作成（社内ユーザーのみ）
- プロジェクト承認（社内ユーザーのみ）

### 4. 検査結果
- 検索機能付きの結果一覧
- 測定データの詳細表示
- OK/NG判定の可視化

### 5. CSV取込
- ファイルアップロード機能
- 処理状況の表示
- フォーマット説明

## API連携

バックエンドAPIとの通信は`src/services/apiService.js`で管理されています。

### 主要なAPI

- `GET /api/projects` - プロジェクト一覧取得
- `POST /api/projects` - プロジェクト作成
- `PUT /api/projects/{id}/approve` - プロジェクト承認
- `GET /api/inspections` - 検査結果取得
- `POST /api/import` - CSV取込初期化

### 認証

- JWTトークンを使用したBearer認証
- MSALライブラリによる自動トークン管理
- 401エラー時の自動ログアウト

## 権限制御

### ロールベース制御

```javascript
const userRole = currentUser?.idTokenClaims?.roles?.[0];
const isInternal = userRole === 'Internal';
```

### 画面制御
- 社内ユーザー: 全機能利用可能
- 社外ユーザー: 参照機能のみ、自社関連データのみ表示

## 開発時の注意事項

### CORS設定
ローカル開発環境では、バックエンド側で`http://localhost:3000`からのアクセスが許可されている必要があります。

### 認証設定
- **ローカル開発環境**: 認証はバイパスされるため、Azure ADのセットアップは不要です。
- **Azure環境**: ステージング・本番環境では、Azure ADにアプリケーションを登録し、リダイレクトURIなどを正しく設定する必要があります。

### API接続
ローカル開発時は、バックエンドAPI (`http://localhost:5000`) が起動していることを確認してください。

## トラブルシューティング

### よくある問題

1. **認証エラー**
   - Azure ADの設定を確認
   - リダイレクトURIが正しく設定されているか確認

2. **API接続エラー**
   - CORS設定を確認
   - APIのベースURLが正しいか確認

3. **ビルドエラー**
   - Node.jsのバージョンを確認（推奨: 16.x以上）
   - 依存関係を再インストール: `rm -rf node_modules && npm install`

### ログの確認

ブラウザの開発者ツールでコンソールログを確認してください。

## ライセンス

このプロジェクトはPOC（概念実証）用途で作成されています。
