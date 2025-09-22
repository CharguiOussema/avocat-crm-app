/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState } from 'react';
import { ClientAvatarUpload, ClientAvatarDisplay } from '../components/client';
import { clientService } from '../services/ClientService';
import { CreateClientBodyRequest, UpdateClientBodyRequest, ClientItemResponseType } from '../models/client';

export const ClientAvatarTest: React.FC = () => {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [createdClient, setCreatedClient] = useState<ClientItemResponseType | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    cin: '',
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateClient = async () => {
    if (!formData.fullName) {
      alert('Please enter a full name');
      return;
    }

    setIsCreating(true);
    try {
      const clientData: CreateClientBodyRequest = {
        fullName: formData.fullName,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        cin: formData.cin || null,
        location: formData.location || null,
        avatar: null // This will be handled by the service
      };

      const response = await clientService.createWithAvatar(clientData, selectedAvatarFile || undefined);
      setCreatedClient(response.data);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        cin: '',
        location: ''
      });
      setSelectedAvatarFile(null);

      console.log('Client created successfully:', response.data);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!createdClient) {
      alert('No client to update');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: UpdateClientBodyRequest = {
        _id: createdClient._id,
        fullName: createdClient.fullName,
        email: createdClient.email,
        phoneNumber: createdClient.phoneNumber,
        cin: createdClient.cin,
        location: createdClient.location,
        avatar: createdClient.avatar
      };

      const response = await clientService.updateWithAvatar(updateData, selectedAvatarFile || undefined);
      setCreatedClient(response.data);
      setSelectedAvatarFile(null);

      console.log('Client updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="client-avatar-test-page p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Client Avatar Integration Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Client Section */}
        <div className="create-client-section bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Client</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <ClientAvatarUpload
              onAvatarSelected={setSelectedAvatarFile}
              disabled={isCreating}
            />
          </div>

          <div className="form-fields space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CIN</label>
              <input
                type="text"
                name="cin"
                value={formData.cin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
            </div>
          </div>

          <button
            onClick={handleCreateClient}
            disabled={isCreating || !formData.fullName}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Client'}
          </button>
        </div>

        {/* Created Client Section */}
        <div className="created-client-section bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Created Client</h2>

          {createdClient ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Client Avatar Display</h3>
                <div className="flex gap-4 items-center mb-4">
                  <div className="text-center">
                    <p className="text-sm mb-2">Small</p>
                    <ClientAvatarDisplay
                      client={createdClient}
                      size="small"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-2">Medium</p>
                    <ClientAvatarDisplay
                      client={createdClient}
                      size="medium"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-2">Large</p>
                    <ClientAvatarDisplay
                      client={createdClient}
                      size="large"
                    />
                  </div>
                </div>
              </div>

              <div className="client-info mb-4">
                <h3 className="text-lg font-medium mb-2">Client Information</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>ID:</strong> {createdClient._id}</p>
                  <p><strong>Name:</strong> {createdClient.fullName}</p>
                  <p><strong>Email:</strong> {createdClient.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {createdClient.phoneNumber || 'N/A'}</p>
                  <p><strong>CIN:</strong> {createdClient.cin || 'N/A'}</p>
                  <p><strong>Location:</strong> {createdClient.location || 'N/A'}</p>
                  <p><strong>Avatar ID:</strong> {createdClient.avatar || 'No avatar'}</p>
                </div>
              </div>

              <div className="update-section">
                <h3 className="text-lg font-medium mb-2">Update Avatar</h3>
                <ClientAvatarUpload
                  onAvatarSelected={setSelectedAvatarFile}
                  disabled={isUpdating}
                />
                <button
                  onClick={handleUpdateClient}
                  disabled={isUpdating || !selectedAvatarFile}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Avatar'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No client created yet. Create a client to see the results.</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Upload an avatar image and fill in the client form</li>
          <li>Click "Create Client" to create a new client with avatar</li>
          <li>Verify that the avatar displays correctly in different sizes</li>
          <li>Test updating the avatar by selecting a new image and clicking "Update Avatar"</li>
          <li>Test validation by trying to upload non-image files or files over 2MB</li>
          <li>Check browser console for API responses and any errors</li>
        </ul>
      </div>
    </div>
  );
};