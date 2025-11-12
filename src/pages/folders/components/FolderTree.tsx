import React, { useState } from 'react';
import { List, Typography, Space, Dropdown, message, Modal } from 'antd';
import {
	FolderOutlined,
	FileOutlined,
	MoreOutlined,
	EditOutlined,
	DeleteOutlined,
	DownloadOutlined,
	FolderOpenOutlined,
	FileImageOutlined,
	FilePdfOutlined,
	FileWordOutlined,
	FileExcelOutlined,
	FilePptOutlined,
	FileTextOutlined,
	FileZipOutlined,
	VideoCameraOutlined,
	AudioOutlined,
	EyeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from 'react-query';
import { FolderTreeResponseType, FolderTreeFileType } from '../../../models/folder';
import { folderService } from '../../../services/FolderService';
import { fileService } from '../../../services/FileService';
import { queryKeys } from '../../../services/QueryClientManager';
import { EditFolderDialog } from './EditFolderDialog';
import { formatFileSize, downloadFile, isPreviewSupported } from '../../../utils/file.utils';
import { FilePreviewDialog } from '../../../components/common/FilePreviewDialog';
import type { FileModelType } from '../../../models/file';

const { Text } = Typography;

interface FolderTreeProps {
	folders: FolderTreeResponseType[];
	rootFiles: FolderTreeFileType[];
	onFolderClick: (folder: FolderTreeResponseType) => void;
	onRefresh: () => void;
	currentFolderId?: string;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
	folders,
	rootFiles,
	onFolderClick,
	onRefresh,
	currentFolderId,
}) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [editFolder, setEditFolder] = useState<FolderTreeResponseType | null>(null);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [previewFile, setPreviewFile] = useState<FileModelType | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);

	const deleteFolderMutation = useMutation(
		(folderId: string) => folderService.delete(folderId),
		{
			onSuccess: () => {
				message.success(t('folders.deleteSuccess', 'Folder deleted successfully'));
				queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				queryClient.invalidateQueries([queryKeys.FOLDERS]);
				onRefresh();
			},
			onError: () => {
				message.error(t('folders.deleteError', 'Failed to delete folder'));
			},
		}
	);

	const deleteFileMutation = useMutation(
		(fileId: string) => fileService.deleteFile(fileId),
		{
			onSuccess: () => {
				message.success(t('files.deleteSuccess', 'File deleted successfully'));
				queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				queryClient.invalidateQueries([queryKeys.FILES]);
				onRefresh();
			},
			onError: () => {
				message.error(t('files.deleteError', 'Failed to delete file'));
			},
		}
	);

	const handleDeleteFolder = (folder: FolderTreeResponseType) => {
		Modal.confirm({
			title: t('folders.confirmDelete', 'Delete Folder'),
			content: t('folders.confirmDeleteMessage', `Are you sure you want to delete "${folder.name}"? This folder must be empty to be deleted.`),
			okText: t('common.delete', 'Delete'),
			okType: 'danger',
			cancelText: t('common.cancel', 'Cancel'),
			onOk: () => deleteFolderMutation.mutate(folder._id),
		});
	};

	const handleDeleteFile = (file: { _id: string; originalName: string }) => {
		Modal.confirm({
			title: t('files.confirmDelete', 'Delete File'),
			content: t('files.confirmDeleteMessage', `Are you sure you want to delete "${file.originalName}"?`),
			okText: t('common.delete', 'Delete'),
			okType: 'danger',
			cancelText: t('common.cancel', 'Cancel'),
			onOk: () => deleteFileMutation.mutate(file._id),
		});
	};

	const handleDownloadFile = async (file: { _id: string; originalName: string }) => {
		try {
			message.loading({ content: t('files.downloading', 'Downloading...'), key: 'download' });

			// Get the file details first to get the fileName
			const fileDetails = await fileService.getFileById(file._id);

			// Download the file as a blob
			const blob = await fileService.downloadFile(fileDetails.fileName);

			// Use utility function to handle download
			downloadFile(blob, file.originalName);

			message.success({ content: t('files.downloadSuccess', 'File downloaded successfully'), key: 'download' });
		} catch (error) {
			message.error({ content: t('files.downloadError', 'Failed to download file'), key: 'download' });
			console.error('Download error:', error);
		}
	};

	const getFolderMenu = (folder: FolderTreeResponseType): MenuProps => ({
		items: [
			{
				key: 'open',
				icon: <FolderOpenOutlined />,
				label: t('folders.open', 'Open'),
				onClick: () => onFolderClick(folder),
			},
			{
				key: 'edit',
				icon: <EditOutlined />,
				label: t('common.edit', 'Edit'),
				onClick: () => setEditFolder(folder),
			},
			{
				type: 'divider',
			},
			{
				key: 'delete',
				icon: <DeleteOutlined />,
				label: t('common.delete', 'Delete'),
				danger: true,
				onClick: () => handleDeleteFolder(folder),
			},
		],
	});

	const handlePreviewFile = (file: FileModelType) => {
		setPreviewFile(file);
		setPreviewOpen(true);
	};

	const getFileMenu = (file: FileModelType): MenuProps => {
		const canPreview = isPreviewSupported(file.originalName);

		const menuItems: MenuProps['items'] = [];

		// Add preview option if supported
		if (canPreview) {
			menuItems.push({
				key: 'preview',
				icon: <EyeOutlined />,
				label: t('files.preview', 'Preview'),
				onClick: () => handlePreviewFile(file),
			});
		}

		// Add download option
		menuItems.push({
			key: 'download',
			icon: <DownloadOutlined />,
			label: t('files.download', 'Download'),
			onClick: () => handleDownloadFile(file),
		});

		// Add divider
		menuItems.push({
			type: 'divider',
		});

		// Add delete option
		menuItems.push({
			key: 'delete',
			icon: <DeleteOutlined />,
			label: t('common.delete', 'Delete'),
			danger: true,
			onClick: () => handleDeleteFile(file),
		});

		return { items: menuItems };
	};

	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	const getFileIcon = (file: { mimeType: string; category: string }) => {
		const iconStyle = { fontSize: '16px' };

		// Check by MIME type first for more specific icons
		if (file.mimeType.includes('pdf')) {
			return <FilePdfOutlined style={{ ...iconStyle, color: '#f5222d' }} />;
		}
		if (file.mimeType.includes('word') || file.mimeType.includes('document')) {
			return <FileWordOutlined style={{ ...iconStyle, color: '#2b579a' }} />;
		}
		if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) {
			return <FileExcelOutlined style={{ ...iconStyle, color: '#217346' }} />;
		}
		if (file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint')) {
			return <FilePptOutlined style={{ ...iconStyle, color: '#d24726' }} />;
		}
		if (file.mimeType.includes('zip') || file.mimeType.includes('rar') || file.mimeType.includes('7z')) {
			return <FileZipOutlined style={{ ...iconStyle, color: '#faad14' }} />;
		}
		if (file.mimeType.includes('text/plain') || file.mimeType.includes('text/csv')) {
			return <FileTextOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
		}

		// Fallback to category-based icons
		switch (file.category.toLowerCase()) {
			case 'image':
				return <FileImageOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
			case 'video':
				return <VideoCameraOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
			case 'audio':
				return <AudioOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
			case 'document':
				return <FileTextOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
			default:
				return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
		}
	};

	const renderRootFile = (file: FolderTreeFileType) => {
		return (
			<List.Item
				key={file._id}
				style={{
					padding: '8px 16px',
					borderRadius: '6px',
					marginBottom: '2px',
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = '#fafafa';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = 'transparent';
				}}
			>
				<List.Item.Meta
					avatar={getFileIcon(file)}
					title={<Text>{file.originalName}</Text>}
					description={
						<Space size="small">
							<Text type="secondary" style={{ fontSize: '12px' }}>
								{formatFileSize(file.fileSize)}
							</Text>
							<Text type="secondary" style={{ fontSize: '12px' }}>
								•
							</Text>
							<Text type="secondary" style={{ fontSize: '12px' }}>
								{file.category}
							</Text>
						</Space>
					}
				/>
				<Dropdown menu={getFileMenu(file)} trigger={['click']}>
					<MoreOutlined
						style={{ fontSize: '16px', cursor: 'pointer', padding: '4px' }}
						onClick={(e) => e.stopPropagation()}
					/>
				</Dropdown>
			</List.Item>
		);
	};

	const renderFolder = (folder: FolderTreeResponseType, level = 0) => {
		const isExpanded = expandedFolders.has(folder._id);
		const hasChildren = folder.children && folder.children.length > 0;
		const hasFiles = folder.files && folder.files.length > 0;

		return (
			<div key={folder._id} style={{ marginLeft: level * 24 }}>
				<List.Item
					style={{
						cursor: 'pointer',
						padding: '12px 16px',
						borderRadius: '6px',
						marginBottom: '4px',
						backgroundColor: currentFolderId === folder._id ? '#e6f7ff' : 'transparent',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = currentFolderId === folder._id ? '#e6f7ff' : '#f5f5f5';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = currentFolderId === folder._id ? '#e6f7ff' : 'transparent';
					}}
				>
					<List.Item.Meta
						avatar={
							<FolderOutlined
								style={{ fontSize: '20px', color: '#faad14' }}
								onClick={() => toggleFolder(folder._id)}
							/>
						}
						title={
							<Space>
								<Text strong onClick={() => onFolderClick(folder)}>
									{folder.name}
								</Text>
								{(hasChildren || hasFiles) && (
									<Text type="secondary" style={{ fontSize: '12px' }}>
										({(folder.children?.length || 0) + (folder.files?.length || 0)} items)
									</Text>
								)}
							</Space>
						}
						description={
							<Text type="secondary" style={{ fontSize: '12px' }}>
								{formatFileSize(folder.size)}
							</Text>
						}
					/>
					<Dropdown menu={getFolderMenu(folder)} trigger={['click']}>
						<MoreOutlined
							style={{ fontSize: '20px', cursor: 'pointer', padding: '4px' }}
							onClick={(e) => e.stopPropagation()}
						/>
					</Dropdown>
				</List.Item>

				{isExpanded && hasFiles && (
					<div style={{ marginLeft: 24 }}>
						{folder.files!.map((file) => (
							<List.Item
								key={file._id}
								style={{
									padding: '8px 16px',
									borderRadius: '6px',
									marginBottom: '2px',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = '#fafafa';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
							>
								<List.Item.Meta
									avatar={getFileIcon(file)}
									title={<Text>{file.originalName}</Text>}
									description={
										<Space size="small">
											<Text type="secondary" style={{ fontSize: '12px' }}>
												{formatFileSize(file.fileSize)}
											</Text>
											<Text type="secondary" style={{ fontSize: '12px' }}>
												•
											</Text>
											<Text type="secondary" style={{ fontSize: '12px' }}>
												{file.category}
											</Text>
										</Space>
									}
								/>
								<Dropdown menu={getFileMenu(file)} trigger={['click']}>
									<MoreOutlined
										style={{ fontSize: '16px', cursor: 'pointer', padding: '4px' }}
										onClick={(e) => e.stopPropagation()}
									/>
								</Dropdown>
							</List.Item>
						))}
					</div>
				)}

				{isExpanded && hasChildren && (
					<div>
						{folder.children!.map((child) => renderFolder(child, level + 1))}
					</div>
				)}
			</div>
		);
	};

	const hasRootFiles = !currentFolderId && rootFiles && rootFiles.length > 0;
	const hasFolders = folders && folders.length > 0;

	if (!hasFolders && !hasRootFiles) {
		return (
			<div style={{ textAlign: 'center', padding: '48px 0' }}>
				<FolderOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
				<div style={{ marginTop: '16px', color: '#8c8c8c' }}>
					{t('folders.empty', 'No folders or files found. Create your first folder or upload a file to get started.')}
				</div>
			</div>
		);
	}

	return (
		<>
			<div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
				{/* Display root files when at root level */}
				{hasRootFiles && (
					<div style={{ marginBottom: '16px' }}>
						<Text type="secondary" style={{ fontSize: '12px', marginLeft: '16px', display: 'block', marginBottom: '8px' }}>
							{t('files.rootFiles', 'Files in Root')}
						</Text>
						<List
							dataSource={rootFiles}
							renderItem={(file) => renderRootFile(file)}
						/>
					</div>
				)}

				{/* Display folders */}
				{hasFolders && (
					<List
						dataSource={folders}
						renderItem={(folder) => renderFolder(folder)}
					/>
				)}
			</div>

			{editFolder && (
				<EditFolderDialog
					open={!!editFolder}
					folder={editFolder}
					onClose={() => setEditFolder(null)}
					onSuccess={() => {
						setEditFolder(null);
						onRefresh();
					}}
				/>
			)}

			<FilePreviewDialog
				open={previewOpen}
				onClose={() => {
					setPreviewOpen(false);
					setPreviewFile(null);
				}}
				file={previewFile}
			/>
		</>
	);
};
