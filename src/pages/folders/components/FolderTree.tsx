import React, { useState, useEffect } from "react";
import { List, Typography, Space, Dropdown, message, Modal } from "antd";
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
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import {
	FolderTreeResponseType,
	FolderTreeFileType,
} from "../../../models/folder";
import { folderService } from "../../../services/FolderService";
import { fileService } from "../../../services/FileService";
import { queryKeys } from "../../../services/QueryClientManager";
import { EditFolderDialog } from "./EditFolderDialog";
import {
	formatFileSize,
	downloadFile,
	isPreviewSupported,
} from "../../../utils/file.utils";
import { FilePreviewDialog } from "../../../components/common/FilePreviewDialog";
import type { FileModelType } from "../../../models/file";

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
	const [editFolder, setEditFolder] = useState<FolderTreeResponseType | null>(
		null
	);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
		// Load expanded folders from localStorage on mount
		try {
			const saved = localStorage.getItem("expandedFolders");
			if (saved) {
				const parsed = JSON.parse(saved);
				return new Set(parsed);
			}
		} catch (error) {
			console.error(
				"Failed to load expanded folders from localStorage:",
				error
			);
		}
		return new Set();
	});
	const [previewFile, setPreviewFile] = useState<FileModelType | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);

	// Persist expanded folders to localStorage
	useEffect(() => {
		try {
			const expanded = Array.from(expandedFolders);
			localStorage.setItem("expandedFolders", JSON.stringify(expanded));
		} catch (error) {
			console.error("Failed to save expanded folders to localStorage:", error);
		}
	}, [expandedFolders]);

	const deleteFolderMutation = useMutation(
		(folderId: string) => folderService.delete(folderId),
		{
			onSuccess: () => {
				message.success(
					t("folders.deleteSuccess")
				);
				queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				queryClient.invalidateQueries([queryKeys.FOLDERS]);
				onRefresh();
			},
			onError: (error: any) => {
				const errorMessage =
					error?.response?.data?.message ||
					error?.message ||
					t("folders.deleteError");
				message.error(errorMessage);
				console.error("Delete folder error:", error);
			},
		}
	);

	const deleteFileMutation = useMutation(
		(fileId: string) => fileService.deleteFile(fileId),
		{
			onSuccess: () => {
				message.success(t("files.deleteSuccess"));
				queryClient.invalidateQueries([queryKeys.FOLDER_TREE]);
				queryClient.invalidateQueries([queryKeys.FILES]);
				onRefresh();
			},
			onError: (error: any) => {
				const errorMessage =
					error?.response?.data?.message ||
					error?.message ||
					t("files.deleteError");
				message.error(errorMessage);
				console.error("Delete file error:", error);
			},
		}
	);

	const handleDeleteFolder = (folder: FolderTreeResponseType) => {
		Modal.confirm({
			title: t("folders.confirmDelete"),
			content: t(
				"folders.confirmDeleteMessage",
				{ name: folder.name }
			),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: () => deleteFolderMutation.mutate(folder._id),
		});
	};

	const handleDeleteFile = (file: { _id: string; originalName: string }) => {
		Modal.confirm({
			title: t("files.confirmDelete"),
			content: t(
				"files.confirmDeleteMessage",
				{ name: file.originalName }
			),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: () => deleteFileMutation.mutate(file._id),
		});
	};

	const handleDownloadFile = async (file: {
		_id: string;
		originalName: string;
	}) => {
		try {
			message.loading({
				content: t("files.downloading"),
				key: "download",
			});

			// Get the file details first to get the fileName
			const fileDetails = await fileService.getFileById(file._id);

			// Download the file as a blob
			const blob = await fileService.downloadFile(fileDetails.fileName);

			// Use utility function to handle download
			downloadFile(blob, file.originalName);

			message.success({
				content: t("files.downloadSuccess"),
				key: "download",
			});
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				t("files.downloadError");
			message.error({ content: errorMessage, key: "download" });
			console.error("Download error:", error);
		}
	};

	const handleDownloadFolder = async (folder: FolderTreeResponseType) => {
		try {
			message.loading({
				content: t("folders.downloading"),
				key: "downloadFolder",
			});

			// Download the folder as a ZIP blob
			const response = await folderService.download(folder._id);

			// Trigger browser download with folder name
			const fileName = `${folder.name}.zip`;
			downloadFile(response.data, fileName);

			message.success({
				content: t("folders.downloadSuccess"),
				key: "downloadFolder",
			});
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				t("folders.downloadError");
			message.error({ content: errorMessage, key: "downloadFolder" });
			console.error("Folder download error:", error);
		}
	};

	const getFolderMenu = (folder: FolderTreeResponseType): MenuProps => ({
		items: [
			{
				key: "open",
				icon: <FolderOpenOutlined />,
				label: t("folders.open"),
				onClick: () => onFolderClick(folder),
			},
			{
				key: "edit",
				icon: <EditOutlined />,
				label: t("ui.edit"),
				onClick: () => setEditFolder(folder),
			},
			{
				key: "download",
				icon: <DownloadOutlined />,
				label: t("folders.download"),
				onClick: () => handleDownloadFolder(folder),
			},
			{
				type: "divider",
			},
			{
				key: "delete",
				icon: <DeleteOutlined />,
				label: t("ui.delete"),
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

		const menuItems: MenuProps["items"] = [];

		// Add preview option if supported
		if (canPreview) {
			menuItems.push({
				key: "preview",
				icon: <EyeOutlined />,
				label: t("files.preview"),
				onClick: () => handlePreviewFile(file),
			});
		}

		// Add download option
		menuItems.push({
			key: "download",
			icon: <DownloadOutlined />,
			label: t("files.download"),
			onClick: () => handleDownloadFile(file),
		});

		// Add divider
		menuItems.push({
			type: "divider",
		});

		// Add delete option
		menuItems.push({
			key: "delete",
			icon: <DeleteOutlined />,
			label: t("ui.delete"),
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
		const iconStyle = { fontSize: "16px" };

		// Check by MIME type first for more specific icons
		if (file.mimeType.includes("pdf")) {
			return <FilePdfOutlined style={{ ...iconStyle, color: "#f5222d" }} />;
		}
		if (file.mimeType.includes("word") || file.mimeType.includes("document")) {
			return <FileWordOutlined style={{ ...iconStyle, color: "#2b579a" }} />;
		}
		if (file.mimeType.includes("sheet") || file.mimeType.includes("excel")) {
			return <FileExcelOutlined style={{ ...iconStyle, color: "#217346" }} />;
		}
		if (
			file.mimeType.includes("presentation") ||
			file.mimeType.includes("powerpoint")
		) {
			return <FilePptOutlined style={{ ...iconStyle, color: "#d24726" }} />;
		}
		if (
			file.mimeType.includes("zip") ||
			file.mimeType.includes("rar") ||
			file.mimeType.includes("7z")
		) {
			return <FileZipOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		}
		if (
			file.mimeType.includes("text/plain") ||
			file.mimeType.includes("text/csv")
		) {
			return <FileTextOutlined style={{ ...iconStyle, color: "#8c8c8c" }} />;
		}

		// Fallback to category-based icons
		switch (file.category.toLowerCase()) {
			case "image":
				return <FileImageOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
			case "video":
				return (
					<VideoCameraOutlined style={{ ...iconStyle, color: "#722ed1" }} />
				);
			case "audio":
				return <AudioOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
			case "document":
				return <FileTextOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
			default:
				return <FileOutlined style={{ ...iconStyle, color: "#8c8c8c" }} />;
		}
	};

	const renderRootFile = (file: FolderTreeFileType) => {
		return (
			<List.Item
				key={file._id}
				style={{
					padding: "8px 16px",
					borderRadius: "6px",
					marginBottom: "2px",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = "#fafafa";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = "transparent";
				}}
			>
				<List.Item.Meta
					avatar={getFileIcon(file)}
					title={<Text>{file.originalName}</Text>}
					description={
						<Space size='small'>
							<Text type='secondary' style={{ fontSize: "12px" }}>
								{formatFileSize(file.fileSize)}
							</Text>
							<Text type='secondary' style={{ fontSize: "12px" }}>
								•
							</Text>
							<Text type='secondary' style={{ fontSize: "12px" }}>
								{file.category}
							</Text>
						</Space>
					}
				/>
				<Dropdown menu={getFileMenu(file)} trigger={["click"]}>
					<MoreOutlined
						style={{ fontSize: "16px", cursor: "pointer", padding: "4px" }}
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
						cursor: "pointer",
						padding: "12px 16px",
						borderRadius: "6px",
						marginBottom: "4px",
						backgroundColor:
							currentFolderId === folder._id ? "#e6f7ff" : "transparent",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor =
							currentFolderId === folder._id ? "#e6f7ff" : "#f5f5f5";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor =
							currentFolderId === folder._id ? "#e6f7ff" : "transparent";
					}}
				>
					<List.Item.Meta
						avatar={
							<FolderOutlined
								style={{ fontSize: "20px", color: "#faad14" }}
								onClick={() => toggleFolder(folder._id)}
							/>
						}
						title={
							<Space>
								<Text strong onClick={() => onFolderClick(folder)}>
									{folder.name}
								</Text>
								{(hasChildren || hasFiles) && (
									<Text type='secondary' style={{ fontSize: "12px" }}>
										(
										{(folder.children?.length || 0) +
											(folder.files?.length || 0)}{" "}
										items)
									</Text>
								)}
							</Space>
						}
						description={
							<Text type='secondary' style={{ fontSize: "12px" }}>
								{formatFileSize(folder.size)}
							</Text>
						}
					/>
					<Dropdown menu={getFolderMenu(folder)} trigger={["click"]}>
						<MoreOutlined
							style={{ fontSize: "20px", cursor: "pointer", padding: "4px" }}
							onClick={(e) => e.stopPropagation()}
						/>
					</Dropdown>
				</List.Item>

				{/* Show child folders first */}
				{isExpanded && hasChildren && (
					<div>
						{folder.children!.map((child) => renderFolder(child, level + 1))}
					</div>
				)}

				{/* Show files after folders */}
				{isExpanded && hasFiles && (
					<div style={{ marginLeft: 24 }}>
						{folder.files!.map((file) => (
							<List.Item
								key={file._id}
								style={{
									padding: "8px 16px",
									borderRadius: "6px",
									marginBottom: "2px",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = "#fafafa";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "transparent";
								}}
							>
								<List.Item.Meta
									avatar={getFileIcon(file)}
									title={<Text>{file.originalName}</Text>}
									description={
										<Space size='small'>
											<Text type='secondary' style={{ fontSize: "12px" }}>
												{formatFileSize(file.fileSize)}
											</Text>
											<Text type='secondary' style={{ fontSize: "12px" }}>
												•
											</Text>
											<Text type='secondary' style={{ fontSize: "12px" }}>
												{file.category}
											</Text>
										</Space>
									}
								/>
								<Dropdown menu={getFileMenu(file)} trigger={["click"]}>
									<MoreOutlined
										style={{
											fontSize: "16px",
											cursor: "pointer",
											padding: "4px",
										}}
										onClick={(e) => e.stopPropagation()}
									/>
								</Dropdown>
							</List.Item>
						))}
					</div>
				)}
			</div>
		);
	};

	const hasRootFiles = rootFiles && rootFiles.length > 0;
	const hasFolders = folders && folders.length > 0;

	if (!hasFolders && !hasRootFiles) {
		return (
			<div style={{ textAlign: "center", padding: "48px 0" }}>
				<FolderOutlined style={{ fontSize: "64px", color: "#d9d9d9" }} />
				<div style={{ marginTop: "16px", color: "#8c8c8c" }}>
					{t("folders.empty")}
				</div>
			</div>
		);
	}

	return (
		<>
			<div>
				{/* Display folders first */}
				{hasFolders && (
					<div className='mb-4'>
						{hasRootFiles && (
							<Text
								type='secondary'
								className='text-xs ml-4 block mb-2'
							>
								{t("folders.subfolders")}
							</Text>
						)}
						<List
							dataSource={folders}
							renderItem={(folder) => renderFolder(folder)}
						/>
					</div>
				)}

				{/* Display files in the current folder */}
				{hasRootFiles && (
					<div className='mb-4'>
						<Text
							type='secondary'
							className='text-xs ml-4 block mb-2'
						>
							{currentFolderId
								? t("files.currentFolderFiles")
								: t("files.rootFiles")}
						</Text>
						<List
							dataSource={rootFiles}
							renderItem={(file) => renderRootFile(file)}
						/>
					</div>
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
