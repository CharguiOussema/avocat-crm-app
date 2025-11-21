import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Input, Breadcrumb, Space, Card, Row, Col, Typography, Spin, Alert, Select } from 'antd';
import {
	FolderAddOutlined,
	UploadOutlined,
	HomeOutlined,
	FolderOutlined,
	SearchOutlined,
	FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useFetchFolderTree } from '../../hooks/useFetchFolderTree';
import { FolderTreeResponseType } from '../../models/folder';
import { FolderTree } from './components/FolderTree';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { UploadFileDialog } from './components/UploadFileDialog';
import { clientService } from '../../services/ClientService';
import { lawsuitService } from '../../services/LawsuitService';
import { queryKeys } from '../../services/QueryClientManager';
import { useApp } from '../../hooks';
import { cn } from '../../utils/cn';
import { getErrorMessage } from '../../utils/errorHandling';

const { Title } = Typography;

// Type for display filter options
type DisplayFilterType = 'all' | 'folders' | 'files';

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

	// Filter states
	const [displayFilter, setDisplayFilter] = useState<DisplayFilterType>('all');
	const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);
	const [lawsuitFilter, setLawsuitFilter] = useState<string | undefined>(undefined);

	const { data: folderTreeResponse, isLoading, error, refetch } = useFetchFolderTree(currentFolderId);

	// Fetch clients for filter dropdown
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

	// Fetch lawsuits for filter dropdown
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

	// Client-side filtering for folders and files with multiple filter criteria
	const filteredTree = useMemo(() => {
		// Return empty array if display filter is set to "files" only
		if (displayFilter === 'files') return [];

		const filterTree = (items: FolderTreeResponseType[]): FolderTreeResponseType[] => {
			return items
				.filter(item => {
					// Search filter: match folder name
					const nameMatch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());

					// Client filter: match clientId if provided
					const clientMatch = !clientFilter || item.clientId === clientFilter;

					// Lawsuit filter: match lawsuitId if provided
					const lawsuitMatch = !lawsuitFilter || item.lawsuitId === lawsuitFilter;

					// Check if any children match the filters
					const childrenMatch = item.children && filterTree(item.children).length > 0;

					return (nameMatch || childrenMatch) && clientMatch && lawsuitMatch;
				})
				.map(item => ({
					...item,
					children: item.children ? filterTree(item.children) : undefined
				}));
		};

		return filterTree(folderTree);
	}, [folderTree, searchQuery, displayFilter, clientFilter, lawsuitFilter]);

	const filteredRootFiles = useMemo(() => {
		// Return empty array if display filter is set to "folders" only
		if (displayFilter === 'folders') return [];

		return rootFiles.filter(file => {
			// Search filter: match file name
			const nameMatch = !searchQuery || file.originalName.toLowerCase().includes(searchQuery.toLowerCase());

			// Client filter: match clientId if provided
			const clientMatch = !clientFilter || file.clientId === clientFilter;

			// Lawsuit filter: match lawsuitId if provided
			const lawsuitMatch = !lawsuitFilter || file.lawsuitId === lawsuitFilter;

			return nameMatch && clientMatch && lawsuitMatch;
		});
	}, [rootFiles, searchQuery, displayFilter, clientFilter, lawsuitFilter]);

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
					{/* Breadcrumb Navigation */}
					<Col xs={24} lg={24}>
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

					{/* Search and Filters Row */}
					<Col xs={24} sm={24} md={12} lg={10}>
						<Input
							placeholder={t('folders.searchPlaceholder', 'Search folders and files...')}
							prefix={<SearchOutlined />}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							allowClear
							size="large"
						/>
					</Col>

					{/* Display Type Filter */}
					<Col xs={8} sm={8} md={4} lg={4}>
						<Select
							value={displayFilter}
							onChange={setDisplayFilter}
							size="large"
							style={{ width: '100%' }}
							placeholder={t('folders.displayType', 'Type')}
							options={[
								{ value: 'all', label: t('folders.displayAll', 'All') },
								{ value: 'folders', label: t('folders.displayFolders', 'Folders') },
								{ value: 'files', label: t('folders.displayFiles', 'Files') },
							]}
						/>
					</Col>

					{/* Client Filter */}
					<Col xs={8} sm={8} md={4} lg={5}>
						<Select
							value={clientFilter}
							onChange={setClientFilter}
							size="large"
							style={{ width: '100%' }}
							placeholder={t('folders.filterByClient', 'Client')}
							allowClear
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
							}
							options={clientsData}
						/>
					</Col>

					{/* Lawsuit Filter */}
					<Col xs={8} sm={8} md={4} lg={5}>
						<Select
							value={lawsuitFilter}
							onChange={setLawsuitFilter}
							size="large"
							style={{ width: '100%' }}
							placeholder={t('folders.filterByLawsuit', 'Lawsuit')}
							allowClear
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
							}
							options={lawsuitsData}
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
