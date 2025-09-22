/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React from 'react';
import { X } from 'lucide-react';
import { ClientForm } from './ClientForm';
import { ClientItemResponseType } from '../../models/client';

interface ClientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'update';
  client?: ClientItemResponseType;
  onSuccess?: (client: ClientItemResponseType) => void;
  onClose: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  mode,
  client,
  onSuccess,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSuccess = (updatedClient: ClientItemResponseType) => {
    onSuccess?.(updatedClient);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add New Client' : 'Update Client'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <ClientForm
              mode={mode}
              client={client}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};