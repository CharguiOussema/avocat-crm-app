import React, { useState } from 'react';
import { Button, Input, Breadcrumb, Space, Card, Row, Col } from 'antd';
import {
	FolderAddOutlined,
	UploadOutlined,
	HomeOutlined,
	FolderOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useFetchFolderTree } from '../../hooks/useFetchFolderTree';
import { FolderTreeResponseType } from '../../models/folder';
import { FolderTree } from './components/FolderTree';
import { CreateFolderDialog } from './components/CreateFolderDialog';
import { UploadFileDialog } from './components/UploadFileDialog';

export const Folders: React.FC = () => {
	const { t } = useTranslation();
	const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
	const [breadcrumbPath, setBreadcrumbPath] = useState<Array<{ id: string | undefined; name: string }>>([
		{ id: undefined, name: 'Root' }
	]);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const { data: folderTreeResponse, isLoading, refetch } = useFetchFolderTree(currentFolderId);

	// Extract folders and root files from the response
	const folderTree = folderTreeResponse?.data?.folders || [];
	const rootFiles = folderTreeResponse?.data?.rootFiles || [];

	const handleFolderClick = (folder: FolderTreeResponseType) => {
		setCurrentFolderId(folder._id);
		setBreadcrumbPath([...breadcrumbPath, { id: folder._id, name: folder.name }]);
	};

	const handleBreadcrumbClick = (index: number) => {
		const newPath = breadcrumbPath.slice(0, index + 1);
		setBreadcrumbPath(newPath);
		setCurrentFolderId(newPath[newPath.length - 1].id);
	};

	const handleFolderCreated = () => {
		refetch();
		setCreateDialogOpen(false);
	};

	const handleFileUploaded = () => {
		refetch();
		setUploadDialogOpen(false);
	};

	const filteredTree = React.useMemo(() => {
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

	const filteredRootFiles = React.useMemo(() => {
		if (!searchQuery) return rootFiles;
		return rootFiles.filter(file =>
			file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [rootFiles, searchQuery]);

	return (
		<div style={{ padding: '24px' }}>
			{/* Header */}
			<Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
				<Col xs={24} lg={16}>
					<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
						<FolderOutlined style={{ marginRight: '12px' }} />
						{t('folders.title', 'Folders & Files')}
					</h1>
				</Col>
				<Col xs={24} lg={8} style={{ textAlign: 'right' }}>
					<Space wrap>
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
				</Col>
			</Row>

			{/* Breadcrumb Navigation */}
			<Card style={{ marginBottom: '16px' }}>
				<Breadcrumb>
					{breadcrumbPath.map((item, index) => (
						<Breadcrumb.Item key={item.id || 'root'}>
							<span
								onClick={() => handleBreadcrumbClick(index)}
								style={{ cursor: 'pointer' }}
							>
								{index === 0 ? (
									<>
										<HomeOutlined style={{ marginRight: '4px' }} />
										{item.name}
									</>
								) : (
									item.name
								)}
							</span>
						</Breadcrumb.Item>
					))}
				</Breadcrumb>
			</Card>

			{/* Search Bar */}
			<Card style={{ marginBottom: '16px' }}>
				<Input
					placeholder={t('folders.searchPlaceholder', 'Search folders and files...')}
					prefix={<SearchOutlined />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					allowClear
					size="large"
				/>
			</Card>

			{/* Folder Tree */}
			<Card loading={isLoading}>
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
