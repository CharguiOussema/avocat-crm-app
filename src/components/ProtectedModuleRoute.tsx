/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 29/11/2024
 */

import React from 'react';
import { AccessControl } from './common/AccessControl';
import { AccessModule } from '../hooks/useAccess';

interface ProtectedModuleRouteProps {
  module: AccessModule;
  children: React.ReactNode;
  writeOnly?: boolean;
}

/**
 * Wrapper component for routes that require specific module access
 * This prevents unnecessary API requests by checking access before rendering the page
 *
 * @param module - The module to check access for (e.g., 'clients', 'users', 'payments')
 * @param children - The page component to render if access is granted
 * @param writeOnly - If true, requires WRITE access instead of just READ
 */
export const ProtectedModuleRoute: React.FC<ProtectedModuleRouteProps> = ({
  module,
  children,
  writeOnly = false,
}) => {
  return (
    <AccessControl module={module} writeOnly={writeOnly}>
      {children}
    </AccessControl>
  );
};
