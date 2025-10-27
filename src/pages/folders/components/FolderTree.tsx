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
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from 'react-query';
import { FolderTreeResponseType } from '../../../models/folder';
import { folderService } from '../../../services/FolderService';
import { queryKeys } from '../../../services/QueryClientManager';
import { EditFolderDialog } from './EditFolderDialog';

const { Text } = Typography;

interface FolderTreeProps {
	folders: FolderTreeResponseType[];
	onFolderClick: (folder: FolderTreeResponseType) => void;
	onRefresh: () => void;
	currentFolderId?: string;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
	folders,
	onFolderClick,
	onRefresh,
	currentFolderId,
}) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [editFolder, setEditFolder] = useState<FolderTreeResponseType | null>(null);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

	const deleteMutation = useMutation(
		(folderId: string) => folderService.delete(folderId),
		{
			onSuccess: () => {
				message.success(t('folders.deleteSuccess', 'Folder deleted successfully'));
				queryClient.invalidateQueries(queryKeys.FOLDER_TREE);
				queryClient.invalidateQueries(queryKeys.FOLDERS);
				onRefresh();
			},
			onError: () => {
				message.error(t('folders.deleteError', 'Failed to delete folder'));
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
			onOk: () => deleteMutation.mutate(folder._id),
		});
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

	const getFileMenu = (_file: { _id: string; originalName: string }): MenuProps => ({
		items: [
			{
				key: 'download',
				icon: <DownloadOutlined />,
				label: t('files.download', 'Download'),
				onClick: () => {
					// TODO: Implement file download
					message.info(t('files.downloadStarted', 'Download started'));
				},
			},
			{
				type: 'divider',
			},
			{
				key: 'delete',
				icon: <DeleteOutlined />,
				label: t('common.delete', 'Delete'),
				danger: true,
				onClick: () => {
					// TODO: Implement file delete
					message.info(t('files.deleteNotImplemented', 'File deletion not yet implemented'));
				},
			},
		],
	});

	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
									avatar={<FileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
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

	if (!folders || folders.length === 0) {
		return (
			<div style={{ textAlign: 'center', padding: '48px 0' }}>
				<FolderOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
				<div style={{ marginTop: '16px', color: '#8c8c8c' }}>
					{t('folders.empty', 'No folders found. Create your first folder to get started.')}
				</div>
			</div>
		);
	}

	return (
		<>
			<List
				dataSource={folders}
				renderItem={(folder) => renderFolder(folder)}
				style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}
			/>

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
		</>
	);
};
