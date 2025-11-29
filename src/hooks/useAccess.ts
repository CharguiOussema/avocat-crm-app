/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 29/11/2024
 */

import { useAuth } from './useAuth';
import { APP_ACCESS, USER_ROLES } from '../models/consts';

export type AccessModule =
  | 'dashboard'
  | 'clients'
  | 'users'
  | 'lawsuits'
  | 'payments'
  | 'folders'
  | 'events'
  | 'courts'
  | 'lawsuitStages'
  | 'lawsuitTypes';

/**
 * Hook to check user access to different modules
 * SUPER_ADMIN and USER_ADMIN have full WRITE access to all modules by default
 * USER_AGENT access is controlled by the userAccess field
 */
export const useAccess = () => {
  const { user } = useAuth();

  /**
   * Check if user is admin (SUPER_ADMIN or USER_ADMIN)
   * Admin users have full access to everything
   */
  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.USER_ADMIN;
  };

  const getAccess = (module: AccessModule): APP_ACCESS => {
    if (!user) {
      return APP_ACCESS.NO_ACCESS;
    }

    // SUPER_ADMIN and USER_ADMIN have full WRITE access to all modules
    if (isAdmin()) {
      return APP_ACCESS.WRITE;
    }

    // For USER_AGENT, check the userAccess field
    if (!user.userAccess) {
      return APP_ACCESS.NO_ACCESS;
    }

    return user.userAccess[module] || APP_ACCESS.NO_ACCESS;
  };

  const hasAccess = (module: AccessModule): boolean => {
    const access = getAccess(module);
    return access !== APP_ACCESS.NO_ACCESS;
  };

  const canWrite = (module: AccessModule): boolean => {
    const access = getAccess(module);
    return access === APP_ACCESS.WRITE;
  };

  const canRead = (module: AccessModule): boolean => {
    const access = getAccess(module);
    return access === APP_ACCESS.READ || access === APP_ACCESS.WRITE;
  };

  return {
    getAccess,
    hasAccess,
    canWrite,
    canRead,
    isAdmin: isAdmin(),
  };
};
