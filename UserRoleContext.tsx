'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole } from './types';

interface UserRoleContextType {
  userRole: UserRole;
  toggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SEEKER);

  const toggleRole = () => {
    setUserRole(prev => prev === UserRole.SEEKER ? UserRole.OFFICE : UserRole.SEEKER);
  };

  return (
    <UserRoleContext.Provider value={{ userRole, toggleRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) throw new Error('useUserRole must be used within a UserRoleProvider');
  return context;
};
