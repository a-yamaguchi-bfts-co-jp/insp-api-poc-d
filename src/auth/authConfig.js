import { LogLevel } from '@azure/msal-browser';

// 認証バイパス設定
export const authBypassEnabled = process.env.REACT_APP_BYPASS_AUTH === 'true' || 
                                 process.env.REACT_APP_ENVIRONMENT === 'development';

// 認証バイパス用のダミーユーザー
export const bypassUser = {
  account: {
    username: 'bypass-user@example.com',
    name: 'Bypass User (開発用)',
    localAccountId: 'bypass-local-id',
    homeAccountId: 'bypass-home-id',
    environment: 'bypass',
    tenantId: 'bypass-tenant',
    roles: ['Internal'] // デフォルト役割
  },
  idToken: 'bypass-id-token',
  accessToken: 'bypass-access-token'
};

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID || 'api://insp-api-poc',
    authority: process.env.REACT_APP_AUTH_AUTHORITY || 'https://login.microsoftonline.com/common/v2.0',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

// ログ出力
if (authBypassEnabled) {
  console.log('🚨 認証バイパス機能が有効です (開発・検証用)');
  console.log(`Environment: ${process.env.REACT_APP_ENVIRONMENT}`);
  console.log(`Bypass Auth: ${process.env.REACT_APP_BYPASS_AUTH}`);
} else {
  console.log('🔒 認証機能が有効です');
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
