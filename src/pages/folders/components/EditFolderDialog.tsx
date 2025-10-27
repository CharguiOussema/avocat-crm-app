import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { folderService } from '../../../services/FolderService';
import { clientService } from '../../../services/ClientService';
import { lawsuitService } from '../../../services/LawsuitService';
import { FolderUpdateRequestType, FolderTreeResponseType } from '../../../models/folder';
import { queryKeys } from '../../../services/QueryClientManager';
import { logError, handleApiError, getErrorMessage } from '../../../utils/errorHandling';

interface EditFolderDialogProps {
	open: boolean;
	folder: FolderTreeResponseType;
	onClose: () => void;
	onSuccess: () => void;
}

export const EditFolderDialog: React.FC<EditFolderDialogProps> = ({
	open,
	folder,
	onClose,
	onSuccess,
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

	useEffect(() => {
		if (open && folder) {
			form.setFieldsValue({
				name: folder.name,
				clientId: folder.clientId,
				lawsuitId: folder.lawsuitId,
			});
		}
	}, [open, folder, form]);

	const updateMutation = useMutation(
		(data: { id: string; updates: FolderUpdateRequestType }) =>
			folderService.update(data.id, data.updates),
		{
			onSuccess: () => {
				message.success(t('folders.updateSuccess', 'Folder updated successfully'));
				queryClient.invalidateQueries(queryKeys.FOLDER_TREE);
				queryClient.invalidateQueries(queryKeys.FOLDERS);
				onSuccess();
			},
			onError: (error: unknown) => {
				logError(error, 'Failed to update folder');

				// Enhanced error handling for specific backend errors
				const errorMessage = getErrorMessage(error);

				if (errorMessage.includes('does not belong to your company')) {
					message.error(
						t('folders.companyMismatch',
							'Cannot update folder. Please refresh the page and try again. If the issue persists, contact support.')
					);
					// Force refresh the folder tree to ensure we have latest data
					queryClient.invalidateQueries(queryKeys.FOLDER_TREE);
				} else if (errorMessage.includes('already exists')) {
					message.error(
						t('folders.nameExists', 'A folder with this name already exists in this location.')
					);
				} else if (errorMessage.includes('circular reference')) {
					message.error(
						t('folders.circularReference', 'Cannot move folder: This would create a circular reference.')
					);
				} else if (errorMessage.includes('not found')) {
					message.error(
						t('folders.folderNotFound', 'Folder not found. It may have been deleted.')
					);
					queryClient.invalidateQueries(queryKeys.FOLDER_TREE);
				} else {
					message.error(handleApiError(error, 'update folder'));
				}
			},
		}
	);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Get trimmed values
			const trimmedName = values.name?.trim();

			// Validate that if name is provided, it's a non-empty string
			if (values.name && (!trimmedName || trimmedName.length === 0)) {
				message.error(t('folders.folderNameWhitespace', 'Folder name cannot be empty'));
				return;
			}

			// Build the update payload ensuring all fields match backend expectations
			const updates: FolderUpdateRequestType = {
				name: trimmedName && trimmedName.length > 0 ? trimmedName : undefined,
				clientId: values.clientId && values.clientId.length > 0 ? values.clientId : undefined,
				lawsuitId: values.lawsuitId && values.lawsuitId.length > 0 ? values.lawsuitId : undefined,
			};

			// Only include fields that have changed
			const cleanedUpdates: FolderUpdateRequestType = {};
			if (updates.name && updates.name !== folder.name) {
				cleanedUpdates.name = updates.name;
			}
			if (updates.clientId !== folder.clientId) {
				cleanedUpdates.clientId = updates.clientId;
			}
			if (updates.lawsuitId !== folder.lawsuitId) {
				cleanedUpdates.lawsuitId = updates.lawsuitId;
			}

			// If no changes, show message
			if (Object.keys(cleanedUpdates).length === 0) {
				message.info(t('folders.noChanges', 'No changes to save'));
				return;
			}

			// Log the data being sent (development only)
			if (process.env.NODE_ENV === 'development') {
				console.log('[EditFolderDialog] Updating folder:', { id: folder._id, updates: cleanedUpdates });
			}

			updateMutation.mutate({ id: folder._id, updates: cleanedUpdates });
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
			title={t('folders.editFolder', 'Edit Folder')}
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={updateMutation.isLoading}
			okText={t('common.save', 'Save')}
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
