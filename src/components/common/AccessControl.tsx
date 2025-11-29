/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 29/11/2024
 */

import React, { useEffect, useState } from 'react';
import { useAccess, AccessModule } from '../../hooks/useAccess';
import { NoAccess } from './NoAccess';

interface AccessControlProps {
  module: AccessModule;
  children: React.ReactNode;
  writeOnly?: boolean;
}

/**
 * Component that controls access to pages and features based on user permissions
 * - NO_ACCESS: Shows NoAccess screen
 * - READ: Shows content but buttons will be disabled
 * - WRITE: Shows full access
 */
export const AccessControl: React.FC<AccessControlProps> = ({
  module,
  children,
  writeOnly = false,
}) => {
  const { hasAccess, canWrite } = useAccess();
  const [isLoaded, setIsLoaded] = useState(false);

  // Delay rendering to prevent flash of content before access check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Check if user has access to this module
  if (!hasAccess(module)) {
    return <NoAccess />;
  }

  // If writeOnly is true, check for write permissions
  if (writeOnly && !canWrite(module)) {
    return <NoAccess />;
  }

  return <>{children}</>;
};
