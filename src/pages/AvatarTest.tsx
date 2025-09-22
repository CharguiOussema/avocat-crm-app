/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState } from 'react';
import { Avatar, AvatarUpload } from '../components/common';
import type { AvatarEntity } from '../services/AvatarService';

export const AvatarTest: React.FC = () => {
  const [userAvatarFile, setUserAvatarFile] = useState<File | null>(null);
  const [clientAvatarFile, setClientAvatarFile] = useState<File | null>(null);

  // Test entities (in a real app these would come from props or context)
  const testUser: AvatarEntity = {
    _id: 'test-user-123',
    fullName: 'Test User',
    avatar: null
  };

  const testClient: AvatarEntity = {
    _id: 'test-client-456',
    fullName: 'Test Client',
    avatar: null
  };

  const handleUserAvatarSelected = (file: File | null) => {
    setUserAvatarFile(file);
    console.log('User avatar selected:', file);
  };

  const handleClientAvatarSelected = (file: File | null) => {
    setClientAvatarFile(file);
    console.log('Client avatar selected:', file);
  };

  return (
    <div className="avatar-test-page p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Avatar System Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Avatar Section */}
        <div className="user-avatar-section bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Avatar</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Upload Component</h3>
            <AvatarUpload
              entity={testUser}
              entityType="user"
              onAvatarSelected={handleUserAvatarSelected}
              size="large"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Display Components</h3>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <p className="text-sm mb-2">Small</p>
                <Avatar
                  entity={testUser}
                  entityType="user"
                  size="small"
                />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2">Medium</p>
                <Avatar
                  entity={testUser}
                  entityType="user"
                  size="medium"
                />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2">Large</p>
                <Avatar
                  entity={testUser}
                  entityType="user"
                  size="large"
                />
              </div>
            </div>
          </div>

          <div className="current-status">
            <h3 className="text-lg font-medium mb-2">Current Status</h3>
            <p className="text-sm text-gray-600">
              {userAvatarFile ? `Avatar selected: ${userAvatarFile.name}` : 'No avatar selected'}
            </p>
          </div>
        </div>

        {/* Client Avatar Section */}
        <div className="client-avatar-section bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Client Avatar</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Upload Component</h3>
            <AvatarUpload
              entity={testClient}
              entityType="client"
              onAvatarSelected={handleClientAvatarSelected}
              size="large"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Display Components</h3>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <p className="text-sm mb-2">Small</p>
                <Avatar
                  entity={testClient}
                  entityType="client"
                  size="small"
                />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2">Medium</p>
                <Avatar
                  entity={testClient}
                  entityType="client"
                  size="medium"
                />
              </div>
              <div className="text-center">
                <p className="text-sm mb-2">Large</p>
                <Avatar
                  entity={testClient}
                  entityType="client"
                  size="large"
                />
              </div>
            </div>
          </div>

          <div className="current-status">
            <h3 className="text-lg font-medium mb-2">Current Status</h3>
            <p className="text-sm text-gray-600">
              {clientAvatarFile ? `Avatar selected: ${clientAvatarFile.name}` : 'No avatar selected'}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Upload images for both user and client avatars</li>
          <li>Test file validation (try uploading non-image files or files over 2MB)</li>
          <li>Verify that avatars are properly processed and displayed</li>
          <li>Test delete functionality</li>
          <li>Check that display components show fallback icons when no avatar is present</li>
          <li>Monitor browser console for any errors or upload status messages</li>
        </ul>
      </div>
    </div>
  );
};