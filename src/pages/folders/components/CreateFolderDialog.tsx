import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { folderService } from '../../../services/FolderService';
import { clientService } from '../../../services/ClientService';
import { lawsuitService } from '../../../services/LawsuitService';
import { FolderCreateRequestType } from '../../../models/folder';
import { queryKeys } from '../../../services/QueryClientManager';
import { logError, handleApiError, getErrorMessage } from '../../../utils/errorHandling';

interface CreateFolderDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	parentId?: string;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
	open,
	onClose,
	onSuccess,
	parentId,
}) => {
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const queryClient = useQueryClient();

	// Fetch clients for dropdown
	const { data: clientsData } = useQuery(
		[queryKeys.CLIENTS, 'filter'],
		async () => {
			const response = await clientService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Fetch lawsuits for dropdown
	const { data: lawsuitsData } = useQuery(
		[queryKeys.LAWSUITS, 'filter'],
		async () => {
			const response = await lawsuitService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	const createMutation = useMutation(
		(data: FolderCreateRequestType) => folderService.create(data),
		{
			onSuccess: () => {
				message.success(t('folders.createSuccess', 'Folder created successfully'));
				queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				queryClient.invalidateQueries([queryKeys.FOLDERS]);
				form.resetFields();
				onSuccess();
			},
			onError: (error: unknown) => {
				logError(error, 'Failed to create folder');

				// Enhanced error handling for specific backend errors
				const errorMessage = getErrorMessage(error);

				if (errorMessage.includes('does not belong to your company')) {
					message.error(
						t('folders.companyMismatch',
							'Cannot create folder here. Please refresh the page and try again. If the issue persists, contact support.')
					);
					// Force refresh the folder tree to ensure we have latest data
					queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				} else if (errorMessage.includes('already exists')) {
					message.error(
						t('folders.nameExists', 'A folder with this name already exists in this location.')
					);
				} else if (errorMessage.includes('Parent folder')) {
					message.error(
						t('folders.parentNotFound', 'Parent folder not found. Please refresh and try again.')
					);
					queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				} else {
					message.error(handleApiError(error, 'create folder'));
				}
			},
		}
	);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Get the trimmed name value
			const trimmedName = values.name?.trim();

			// Validate that name is a non-empty string
			if (!trimmedName || typeof trimmedName !== 'string') {
				message.error(t('folders.folderNameRequired', 'Please enter a folder name'));
				return;
			}

			// Validate parent folder if provided
			if (parentId && parentId.length > 0) {
				try {
					// Fetch parent folder to verify it exists and belongs to user's company
					const parentFolder = await folderService.getById(parentId);

					if (process.env.NODE_ENV === 'development') {
						console.log('[CreateFolderDialog] Parent folder verified:', {
							id: parentFolder.data._id,
							name: parentFolder.data.name,
							company: parentFolder.data.company
						});
					}
				} catch (error) {
					logError(error, 'Failed to verify parent folder');
					message.error(
						t('folders.invalidParent', 'Cannot create folder: Parent folder is invalid or inaccessible. Please refresh and try again.')
					);
					return;
				}
			}

			// Build the request payload ensuring all fields match backend expectations
			const data: FolderCreateRequestType = {
				name: trimmedName,
				parent: parentId && parentId.length > 0 ? parentId : undefined,
				clientId: values.clientId && values.clientId.length > 0 ? values.clientId : undefined,
				lawsuitId: values.lawsuitId && values.lawsuitId.length > 0 ? values.lawsuitId : undefined,
			};

			// Log the data being sent (development only)
			if (process.env.NODE_ENV === 'development') {
				console.log('[CreateFolderDialog] Submitting folder:', data);
			}

			createMutation.mutate(data);
		} catch (error) {
			logError(error, 'Form validation failed');
			// Validation failed, Ant Design will show field errors
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	return (
		<Modal
			title={t('folders.createFolder', 'Create New Folder')}
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={createMutation.isLoading}
			okText={t('common.create', 'Create')}
			cancelText={t('common.cancel', 'Cancel')}
		>
			<Form
				form={form}
				layout="vertical"
				style={{ marginTop: '24px' }}
			>
				<Form.Item
					name="name"
					label={t('folders.folderName', 'Folder Name')}
					rules={[
						{
							required: true,
							message: t('folders.folderNameRequired', 'Please enter a folder name'),
						},
						{
							validator: (_rule, value) => {
								if (!value) {
									return Promise.reject(new Error(t('folders.folderNameRequired', 'Please enter a folder name')));
								}
								const trimmedValue = value.trim();
								if (trimmedValue.length === 0) {
									return Promise.reject(new Error(t('folders.folderNameWhitespace', 'Folder name cannot be empty')));
								}
								if (trimmedValue.length > 255) {
									return Promise.reject(new Error(t('folders.folderNameMax', 'Folder name cannot exceed 255 characters')));
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<Input
						placeholder={t('folders.folderNamePlaceholder', 'Enter folder name')}
						autoFocus
						maxLength={255}
						allowClear
					/>
				</Form.Item>

				<Form.Item
					name="clientId"
					label={t('folders.associateClient', 'Associate with Client (Optional)')}
				>
					<Select
						placeholder={t('folders.selectClient', 'Select a client')}
						allowClear
						showSearch
						filterOption={(input, option) =>
							(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
						}
						options={clientsData}
					/>
				</Form.Item>

				<Form.Item
					name="lawsuitId"
					label={t('folders.associateLawsuit', 'Associate with Lawsuit (Optional)')}
				>
					<Select
						placeholder={t('folders.selectLawsuit', 'Select a lawsuit')}
						allowClear
						showSearch
						filterOption={(input, option) =>
							(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
						}
						options={lawsuitsData}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
