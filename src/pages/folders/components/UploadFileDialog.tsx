import React, { useState } from 'react';
import { Modal, Upload, Form, Select, message, Alert, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { fileService } from '../../../services/FileService';
import { clientService } from '../../../services/ClientService';
import { lawsuitService } from '../../../services/LawsuitService';
import { queryKeys } from '../../../services/QueryClientManager';
import { handleApiError } from '../../../utils/errorHandling';
import { formatFileSize } from '../../../utils/file.utils';
import type { UploadFile, UploadProps } from 'antd';

const { Text } = Typography;

const { Dragger } = Upload;

interface UploadFileDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	parentId?: string;
}

export const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
	open,
	onClose,
	onSuccess,
	parentId,
}) => {
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const queryClient = useQueryClient();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploading, setUploading] = useState(false);

	// Fetch storage configuration with React Query (cached)
	const { data: storageConfig } = useQuery(
		[queryKeys.FILES, 'storage-config'],
		async () => {
			const config = await fileService.getStorageConfig();
			return config;
		},
		{
			staleTime: 1000 * 60 * 60, // 1 hour
			cacheTime: 1000 * 60 * 60 * 24, // 24 hours
		}
	);

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

	const uploadProps: UploadProps = {
		multiple: true,
		fileList,
		beforeUpload: (file) => {
			const uploadFile: UploadFile = {
				uid: `${Date.now()}-${file.name}`,
				name: file.name,
				status: 'done',
				size: file.size,
				type: file.type,
				originFileObj: file,
			};
			setFileList([...fileList, uploadFile]);
			return false; // Prevent automatic upload
		},
		onRemove: (file: UploadFile) => {
			setFileList(fileList.filter(f => f.uid !== file.uid));
		},
	};

	const handleSubmit = async () => {
		if (fileList.length === 0) {
			message.warning(t('files.noFilesSelected'));
			return;
		}

		try {
			const values = await form.validateFields();
			setUploading(true);

			// Build upload data ensuring all fields match backend expectations
			const uploadData = {
				parent: parentId && parentId.length > 0 ? parentId : undefined,
				associatedEntity: parentId && parentId.length > 0 ? parentId : undefined,
				associatedEntityType: parentId && parentId.length > 0 ? 'folder' as const : undefined,
				clientId: values.clientId && values.clientId.length > 0 ? values.clientId : undefined,
				lawsuitId: values.lawsuitId && values.lawsuitId.length > 0 ? values.lawsuitId : undefined,
			};

			// Log the data being sent (development only)
			if (process.env.NODE_ENV === 'development') {
				console.log('[UploadFileDialog] Uploading files with data:', uploadData);
			}

			// Upload files using the file service
			const uploadPromises = fileList.map(async (uploadFile: UploadFile) => {
				// Type guard to safely extract File from UploadFile
				const isFileInstance = (obj: unknown): obj is File => {
					return obj instanceof File;
				};

				// Extract the actual File object
				let file: File | undefined;

				if (uploadFile.originFileObj) {
					file = uploadFile.originFileObj as File;
				} else if (isFileInstance(uploadFile)) {
					file = uploadFile;
				}

				if (!file) {
					throw new Error(`${uploadFile.name}: File object not found`);
				}

				// Validate file before upload
				const validation = await fileService.validateFile(file);
				if (!validation.valid) {
					throw new Error(`${file.name}: ${validation.error}`);
				}

				return fileService.uploadFile(file, uploadData);
			});

			const results = await Promise.allSettled(uploadPromises);

			// Check for any failures
			const failures = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
			const successes = results.filter(r => r.status === 'fulfilled');

			if (failures.length > 0 && successes.length === 0) {
				// All failed
				throw failures[0].reason;
			} else if (failures.length > 0) {
				// Some failed
				message.warning(
					t('files.uploadPartialSuccess',
					  { success: successes.length, total: fileList.length, failed: failures.length })
				);
			} else {
				// All succeeded
				message.success(t('files.uploadSuccess'));
			}

			queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
			queryClient.invalidateQueries([queryKeys.FILES]);

			setFileList([]);
			form.resetFields();
			onSuccess();
		} catch (error) {
			const errorMessage = handleApiError(error, 'upload files');
			message.error(errorMessage);
		} finally {
			setUploading(false);
		}
	};

	const handleCancel = () => {
		setFileList([]);
		form.resetFields();
		onClose();
	};

	return (
		<Modal
			title={t('files.uploadFiles')}
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={uploading}
			okText={t('common.fileManager.upload')}
			cancelText={t('ui.cancel')}
			width={600}
		>
			<Form
				form={form}
				layout="vertical"
				style={{ marginTop: '24px' }}
			>
				{fileList.length > 0 && (
					<Alert
						message={t('files.filesSelected', { count: fileList.length })}
						type="info"
						showIcon
						style={{ marginBottom: '16px' }}
					/>
				)}

				<Form.Item>
					<Dragger {...uploadProps}>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">
							{t('files.uploadText')}
						</p>
						<p className="ant-upload-hint">
							{t('files.uploadHint')}
						</p>
						{storageConfig && (
							<div style={{ marginTop: '8px', textAlign: 'left' }}>
								<Text type="secondary" style={{ fontSize: '12px' }}>
									<strong>Max file size:</strong> {formatFileSize(storageConfig.maxFileSize)}
								</Text>
								<br />
								<Text type="secondary" style={{ fontSize: '12px' }}>
									<strong>Allowed types:</strong> Images, Documents (PDF, Word, Excel, PowerPoint), Audio, Video, Archives, and more
								</Text>
							</div>
						)}
					</Dragger>
				</Form.Item>

				<Form.Item
					name="clientId"
					label={t('files.associateClient')}
				>
					<Select
						placeholder={t('files.selectClient')}
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
					label={t('files.associateLawsuit')}
				>
					<Select
						placeholder={t('files.selectLawsuit')}
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
