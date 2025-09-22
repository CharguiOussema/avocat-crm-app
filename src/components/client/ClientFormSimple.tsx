/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { ClientAvatarUpload } from './ClientAvatarUpload';
import { clientService } from '../../services/ClientService';
import { CreateClientBodyRequest, UpdateClientBodyRequest, ClientItemResponseType } from '../../models/client';

interface ClientFormSimpleProps {
  mode: 'create' | 'update';
  client?: ClientItemResponseType;
  onSuccess?: (client: ClientItemResponseType) => void;
  onCancel?: () => void;
}

interface FormValues {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  cin?: string;
  location?: string;
}

export const ClientFormSimple: React.FC<ClientFormSimpleProps> = ({
  mode,
  client,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm<FormValues>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'update' && client) {
      form.setFieldsValue({
        fullName: client.fullName,
        email: client.email || '',
        phoneNumber: client.phoneNumber || '',
        cin: client.cin || '',
        location: client.location || ''
      });
    } else {
      form.resetFields();
    }
    setAvatarFile(null);
  }, [mode, client, form]);

  const handleAvatarSelected = (file: File | null) => {
    setAvatarFile(file);
  };

  // Convert client to AvatarEntity for upload component
  const getAvatarEntity = () => {
    if (mode === 'update' && client) {
      return {
        _id: client._id,
        avatar: client.avatar,
        fullName: client.fullName
      };
    }
    return undefined;
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      let response: { data: ClientItemResponseType };

      if (mode === 'create') {
        const createData: CreateClientBodyRequest = {
          fullName: values.fullName.trim(),
          email: values.email?.trim() || null,
          phoneNumber: values.phoneNumber?.trim() || null,
          cin: values.cin?.trim() || null,
          location: values.location?.trim() || null,
          avatar: null
        };

        response = await clientService.createWithAvatar(createData, avatarFile || undefined);
        message.success(`${values.fullName} has been created successfully`);
      } else {
        if (!client) {
          throw new Error('Client data is required for update mode');
        }

        const updateData: UpdateClientBodyRequest = {
          _id: client._id,
          fullName: values.fullName.trim(),
          email: values.email?.trim() || null,
          phoneNumber: values.phoneNumber?.trim() || null,
          cin: values.cin?.trim() || null,
          location: values.location?.trim() || null,
          avatar: client.avatar
        };

        response = await clientService.updateWithAvatar(updateData, avatarFile || undefined);
        message.success(`${values.fullName} has been updated successfully`);
      }

      onSuccess?.(response.data);

      // Reset form for create mode
      if (mode === 'create') {
        form.resetFields();
        setAvatarFile(null);
      }

    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} client:`, error);
      message.error(`Failed to ${mode} client`);
    } finally {
      setLoading(false);
    }
  };

  const validateCIN = (_: unknown, value: string) => {
    if (value && !/^\d{8}$/.test(value)) {
      return Promise.reject(new Error('CIN must be exactly 8 digits'));
    }
    return Promise.resolve();
  };

  const validateEmail = (_: unknown, value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return Promise.reject(new Error('Please enter a valid email address'));
    }
    return Promise.resolve();
  };

  return (
    <div>
      {/* Avatar Upload Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
          Profile Picture
        </div>
        <ClientAvatarUpload
          onAvatarSelected={handleAvatarSelected}
          entity={getAvatarEntity()}
          disabled={loading}
        />
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
      >
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[
            { required: true, message: 'Please enter the full name' },
            { min: 2, message: 'Full name must be at least 2 characters' }
          ]}
        >
          <Input placeholder="Enter client's full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[{ validator: validateEmail }]}
        >
          <Input type="email" placeholder="client@example.com" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
        >
          <Input placeholder="+1234567890" />
        </Form.Item>

        <Form.Item
          name="cin"
          label="CIN (National ID)"
          rules={[{ validator: validateCIN }]}
        >
          <Input placeholder="12345678" maxLength={8} />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
        >
          <Input placeholder="City, Country" />
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === 'create' ? 'Create Client' : 'Update Client'}
            </Button>
            {onCancel && (
              <Button onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};