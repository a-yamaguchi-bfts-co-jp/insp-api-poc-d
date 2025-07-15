import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

// User role context
const UserRoleContext = createContext();

// User role provider component
export const UserRoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { accounts, instance } = useMsal();

  // 認証バイパス設定をチェック
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true' || 
                     process.env.NODE_ENV === 'development';

  useEffect(() => {
    const determineUserRole = async () => {
      try {
        // 認証バイパス時はデフォルトでInternalロールを設定
        if (bypassAuth) {
          setUserRole('Internal');
        } else if (accounts && accounts.length > 0) {
          const account = accounts[0];
          
          // Check if user has specific roles in their token claims
          // This is a simplified role determination logic
          const userEmail = account.username;
          
          // Default role assignment based on email domain or other criteria
          if (userEmail && userEmail.includes('admin')) {
            setUserRole('Internal');
          } else if (userEmail && userEmail.includes('supplier')) {
            setUserRole('Supplier');
          } else {
            // Default to Internal for authenticated users
            setUserRole('Internal');
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    determineUserRole();
  }, [accounts, instance, bypassAuth]);

  const value = {
    userRole,
    setUserRole,
    loading,
    bypassAuth,
    isInternal: userRole === 'Internal',
    isSupplier: userRole === 'Supplier',
    isAuthenticated: userRole !== null
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Custom hook to use user role context
export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  
  return context;
};

export default UserRoleContext;
