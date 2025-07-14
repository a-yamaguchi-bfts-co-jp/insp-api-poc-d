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

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

#### ローカル開発環境
ローカル開発では、プロジェクトルートに `.env.local` ファイルを作成し、APIサーバーのURLを設定します。

```env
# .env.local
REACT_APP_API_BASE_URL=http://localhost:5000
```
認証関連の変数は、ローカル開発では使用されません。

#### Azure環境 (Azure開発 / ステージング / 本番)
Azure上の各環境では、すべての設定をAzure Static Web Appsの **[構成]** で管理します。以下は設定例です。

```
# アプリケーション設定のキーと値
REACT_APP_API_BASE_URL = "https://..."
REACT_APP_AUTH_AUTHORITY = "https://..."
REACT_APP_AUTH_CLIENT_ID = "..."
```

### 3. 開発サーバーの起動

```bash
npm start
```

アプリケーションは http://localhost:3000 で起動します。

## 環境別の設定と動作

### ローカル開発環境 (`local_poc` ブランチ)
- **目的**: 迅速なUI開発とコンポーネントの単体テスト。
- **認証**: 認証はバイパスされます。画面右下の「Dev Role Switcher」で役割（Internal/Supplier）を切り替えることで、権限に応じた表示を確認できます。
- **API接続**: ローカルで起動しているバックエンド (`http://localhost:5000`) に接続します。接続先は `.env.local` ファイルで定義します。
- **起動コマンド**: `npm start`

### Azure開発環境 (`dev` ブランチ)
- **目的**: Azure上のバックエンドサービスとの基本的な連携テスト。
- **認証**: 認証は無効化、またはAPIキーなどの簡易的な認証を使用します。Azure AD/Entra IDとの連携は行いません。
- **API接続**: Azure上の開発環境用バックエンドAPIに接続します。接続先はAzure Static Web Appsの環境変数で設定します。

### ステージング環境 (`staging` ブランチ) / 本番環境 (`main` ブランチ)
- **目的**: 本番リリース前の最終確認、および本番運用。
- **認証**: 本番用のAzure AD/Entra IDテナントを使用した認証が必須です。
- **API接続**: 各環境に対応するバックエンドAPIに接続します。
- **ビルドコマンド**: `npm run build`

## ビルド

本番用ビルドを作成：

```bash
npm run build
```

ビルドファイルは`build/`ディレクトリに出力されます。

## Azure Static Web Appsへのデプロイ

### GitHub Actions経由（推奨）

1. GitHubリポジトリにコードをプッシュ
2. Azure Static Web Appsリソースを作成時にGitHub連携を設定
3. 自動的にCI/CDパイプラインが構築されます

### 手動デプロイ

```bash
# ビルド
npm run build

# Azure CLI経由でデプロイ
az staticwebapp deploy \
  --name your-static-web-app \
  --resource-group your-resource-group \
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
開発時は`http://localhost:3000`からのアクセスを許可する必要があります。

### 認証設定
Azure ADでSPAアプリケーションとして登録し、適切なリダイレクトURIを設定してください。

### API接続
バックエンドAPIが起動していることを確認してください。

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
