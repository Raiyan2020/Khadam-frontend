import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from './types';
import { AUTH_CHANGED_EVENT } from './lib/authBridge';

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  handleToggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

/**
 * Maps the API's `user.type` onto a role.
 *
 * Coerce before comparing: the field comes back as `'2'` on some endpoints and
 * as `2` on others, and a strict `=== '2'` on the numeric form silently signed
 * office accounts in as seekers.
 */
export const roleFromUserType = (type: unknown): UserRole =>
  String(type ?? '') === '2' ? UserRole.OFFICE : UserRole.SEEKER;

const readStoredRole = (): UserRole => roleFromUserType(localStorage.getItem('user_type'));

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(readStoredRole);

  const handleToggleRole = () => {
    setUserRole(prev => {
      const newRole = prev === UserRole.SEEKER ? UserRole.OFFICE : UserRole.SEEKER;
      localStorage.setItem('user_type', newRole === UserRole.OFFICE ? '2' : '1');
      return newRole;
    });
  };

  /**
   * Re-read the stored role on every auth transition so the bottom nav and the
   * home screen switch as soon as the user logs in or out — not on the next
   * reload. `auth:changed` covers this tab (login, OTP, logout, 401 handling);
   * `storage` covers the same happening in another tab.
   */
  useEffect(() => {
    const sync = () => setUserRole(readStoredRole());
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    // Catch a token written before the listeners attached.
    sync();
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
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
