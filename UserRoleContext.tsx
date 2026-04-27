import React, { createContext, useContext, useState } from 'react';
import { UserRole } from './types';

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  handleToggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedType = localStorage.getItem('user_type');
    return savedType === '2' ? UserRole.OFFICE : UserRole.SEEKER;
  });

  const handleToggleRole = () => {
    setUserRole(prev => {
      const newRole = prev === UserRole.SEEKER ? UserRole.OFFICE : UserRole.SEEKER;
      localStorage.setItem('user_type', newRole === UserRole.OFFICE ? '2' : '1');
      return newRole;
    });
  };

  // Optional: Listen to storage changes across tabs
  React.useEffect(() => {
    const handleStorageChange = () => {
      const savedType = localStorage.getItem('user_type');
      setUserRole(savedType === '2' ? UserRole.OFFICE : UserRole.SEEKER);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, handleToggleRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
