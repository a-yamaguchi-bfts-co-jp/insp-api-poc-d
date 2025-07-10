import React, { createContext, useState, useContext } from 'react';
import { useMsal } from '@azure/msal-react';

const UserRoleContext = createContext();

export const useUserRole = () => useContext(UserRoleContext);

export const UserRoleProvider = ({ children }) => {
  // 開発環境用の擬似的なロール状態
  const [devRole, setDevRole] = useState('Internal'); 

  const { accounts } = useMsal();
  const isDevelopment = process.env.NODE_ENV === 'development';

  let role = 'Guest';
  if (isDevelopment) {
    // 開発環境では、擬似的なロールを使用
    role = devRole;
  } else if (accounts.length > 0) {
    // 本番環境では、認証情報からロールを取得
    role = accounts[0]?.idTokenClaims?.roles?.[0] || 'Guest';
  }

  const value = {
    role,
    setDevRole, // 開発時のみ使用
    isInternal: role === 'Internal',
    isSupplier: role === 'Supplier',
    isDevelopment,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};
