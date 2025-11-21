import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Input, Breadcrumb, Space, Card, Row, Col, Typography, Spin, Alert } from 'antd';
import {
	FolderAddOutlined,
	UploadOutlined,
	HomeOutlined,
	FolderOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchFolderTree } from '../../hooks/useFetchFolderTree';
import { FolderTreeResponseType } from '../../models/folder';
import { FolderTree } from './components/FolderTree';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { UploadFileDialog } from './components/UploadFileDialog';
import { useApp } from '../../hooks';
import { cn } from '../../utils/cn';
import { getErrorMessage } from '../../utils/errorHandling';

const { Title } = Typography;

export const Folders: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const location = useLocation();

	// URL sync: Read folder ID and search from URL query params
	const searchParams = new URLSearchParams(location.search);
	const folderIdFromUrl = searchParams.get('folder') || undefined;
	const searchFromUrl = searchParams.get('search') || '';

	const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(folderIdFromUrl);
	const [breadcrumbPath, setBreadcrumbPath] = useState<Array<{ id: string | undefined; name: string }>>([
		{ id: undefined, name: 'Root' }
	]);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState(searchFromUrl);

	const { data: folderTreeResponse, isLoading, error, refetch } = useFetchFolderTree(currentFolderId);

	// Extract folders and root files from the response
	const folderTree = folderTreeResponse?.data?.folders || [];
	const rootFiles = folderTreeResponse?.data?.rootFiles || [];

	// URL sync: Update URL when currentFolderId or searchQuery changes
	useEffect(() => {
		const params = new URLSearchParams();
		if (currentFolderId) {
			params.set('folder', currentFolderId);
		}
		if (searchQuery) {
			params.set('search', searchQuery);
		}
		const newUrl = params.toString() ? `?${params.toString()}` : '';
		navigate(`/folders${newUrl}`, { replace: true });
	}, [currentFolderId, searchQuery, navigate]);

	const handleFolderClick = useCallback((folder: FolderTreeResponseType) => {
		setCurrentFolderId(folder._id);
		setBreadcrumbPath(prev => [...prev, { id: folder._id, name: folder.name }]);
	}, []);

	const handleBreadcrumbClick = useCallback((index: number) => {
		setBreadcrumbPath(prev => {
			const newPath = prev.slice(0, index + 1);
			setCurrentFolderId(newPath[newPath.length - 1].id);
			return newPath;
		});
	}, []);

	const handleFolderCreated = useCallback(() => {
		refetch();
		setCreateDialogOpen(false);
	}, [refetch]);

	const handleFileUploaded = useCallback(() => {
		refetch();
		setUploadDialogOpen(false);
	}, [refetch]);

	// Client-side filtering for folders and files (tree API doesn't support search)
	const filteredTree = useMemo(() => {
		if (!searchQuery) return folderTree;

		const filterTree = (items: FolderTreeResponseType[]): FolderTreeResponseType[] => {
			return items.filter(item => {
				const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
				const childrenMatch = item.children && filterTree(item.children).length > 0;
				return nameMatch || childrenMatch;
			}).map(item => ({
				...item,
				children: item.children ? filterTree(item.children) : undefined
			}));
		};

		return filterTree(folderTree);
	}, [folderTree, searchQuery]);

	const filteredRootFiles = useMemo(() => {
		if (!searchQuery) return rootFiles;
		return rootFiles.filter(file =>
			file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [rootFiles, searchQuery]);

	// Loading state
	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert
				message={t('folders.error.title', 'Error Loading Folders')}
				description={getErrorMessage(error)}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div
				className={cn(
					"flex items-center justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						<FolderOutlined className='mr-3' />
						{t('folders.title', 'Folders & Files')}
					</Title>
					<p className='text-muted-foreground'>
						{t('folders.subtitle', 'Manage your documents and files')}
					</p>
				</div>
				<Space>
					<Button
						type="primary"
						icon={<FolderAddOutlined />}
						onClick={() => setCreateDialogOpen(true)}
					>
						{t('folders.createFolder', 'New Folder')}
					</Button>
					<Button
						icon={<UploadOutlined />}
						onClick={() => setUploadDialogOpen(true)}
					>
						{t('folders.uploadFile', 'Upload File')}
					</Button>
				</Space>
			</div>

			{/* Navigation and Search */}
			<Card className='border-border'>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} md={12}>
						<Breadcrumb>
							{breadcrumbPath.map((item, index) => (
								<Breadcrumb.Item key={item.id || 'root'}>
									<span
										onClick={() => handleBreadcrumbClick(index)}
										className='cursor-pointer hover:text-primary'
									>
										{index === 0 ? (
											<>
												<HomeOutlined className='mr-1' />
												{item.name}
											</>
										) : (
											item.name
										)}
									</span>
								</Breadcrumb.Item>
							))}
						</Breadcrumb>
					</Col>
					<Col xs={24} md={12}>
						<Input
							placeholder={t('folders.searchPlaceholder', 'Search folders and files...')}
							prefix={<SearchOutlined />}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							allowClear
							size="large"
						/>
					</Col>
				</Row>
			</Card>

			{/* Folder Tree */}
			<Card className='border-border'>
				<FolderTree
					folders={filteredTree}
					rootFiles={filteredRootFiles}
					onFolderClick={handleFolderClick}
					onRefresh={refetch}
					currentFolderId={currentFolderId}
				/>
			</Card>

			{/* Dialogs */}
			<CreateFolderDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onSuccess={handleFolderCreated}
				parentId={currentFolderId}
			/>

			<UploadFileDialog
				open={uploadDialogOpen}
				onClose={() => setUploadDialogOpen(false)}
				onSuccess={handleFileUploaded}
				parentId={currentFolderId}
			/>
		</div>
	);
};
