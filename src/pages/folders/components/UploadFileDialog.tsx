import React, { useState } from 'react';
import { Modal, Upload, Form, Select, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { fileService } from '../../../services/FileService';
import { clientService } from '../../../services/ClientService';
import { lawsuitService } from '../../../services/LawsuitService';
import { queryKeys } from '../../../services/QueryClientManager';
import { handleApiError } from '../../../utils/errorHandling';
import type { UploadFile, UploadProps } from 'antd';

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
			setFileList([...fileList, file]);
			return false; // Prevent automatic upload
		},
		onRemove: (file) => {
			setFileList(fileList.filter(f => f.uid !== file.uid));
		},
	};

	const handleSubmit = async () => {
		if (fileList.length === 0) {
			message.warning(t('files.noFilesSelected', 'Please select at least one file'));
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
			const uploadPromises = fileList.map(async (file) => {
				// Validate file before upload
				const validation = await fileService.validateFile(file as unknown as File);
				if (!validation.valid) {
					throw new Error(`${file.name}: ${validation.error}`);
				}

				return fileService.uploadFile(file as unknown as File, uploadData);
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
					  `Uploaded ${successes.length} of ${fileList.length} files. ${failures.length} failed.`)
				);
			} else {
				// All succeeded
				message.success(t('files.uploadSuccess', 'Files uploaded successfully'));
			}

			queryClient.invalidateQueries(queryKeys.FOLDER_TREE);
			queryClient.invalidateQueries(queryKeys.FILES);

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
			title={t('files.uploadFiles', 'Upload Files')}
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={uploading}
			okText={t('common.upload', 'Upload')}
			cancelText={t('common.cancel', 'Cancel')}
			width={600}
		>
			<Form
				form={form}
				layout="vertical"
				style={{ marginTop: '24px' }}
			>
				<Form.Item>
					<Dragger {...uploadProps}>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">
							{t('files.uploadText', 'Click or drag files to this area to upload')}
						</p>
						<p className="ant-upload-hint">
							{t('files.uploadHint', 'Support for single or bulk upload. Strictly prohibit uploading company data or other banned files.')}
						</p>
					</Dragger>
				</Form.Item>

				<Form.Item
					name="clientId"
					label={t('files.associateClient', 'Associate with Client (Optional)')}
				>
					<Select
						placeholder={t('files.selectClient', 'Select a client')}
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
					label={t('files.associateLawsuit', 'Associate with Lawsuit (Optional)')}
				>
					<Select
						placeholder={t('files.selectLawsuit', 'Select a lawsuit')}
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
