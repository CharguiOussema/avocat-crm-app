import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Typography,
	Card,
	Table,
	Button,
	Space,
	Alert,
	Spin,
	Modal,
	message,
	Input,
	Row,
	Col,
} from "antd";
import { CustomModal } from "../components/common";
import type { ColumnsType } from "antd/es/table";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useFetchClients } from "../hooks/useFetchClients";
import { ClientItemResponseType } from "../models/client";
import { ClientAvatarDisplay } from "../components/client";
import { ClientFormSimple } from "../components/client/ClientFormSimple";
import { clientService } from "../services/ClientService";
import { queryKeys } from "../services/QueryClientManager";
import { QueryBuilder } from "../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../hooks/useQueryParams";
// import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

interface ModalState {
	isOpen: boolean;
	mode: "create" | "update";
	client?: ClientItemResponseType;
}

interface QueryParams extends Record<string, unknown> {
	search?: string;
}

// Utility function to extract error message with proper typing
const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}
	return "An unknown error occurred";
};

// Test identifiers for better testability
export const testIds = {
	loadingSpinner: "clients-loading-spinner",
	addClientButton: "add-client-button",
	searchInput: "clients-search-input",
	clientsTable: "clients-table",
	errorAlert: "clients-error-alert",
	clientModal: "client-modal",
} as const;

export const Clients: React.FC = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const queryParams = useQueryParams<QueryParams>();
	const search = queryParams.search ?? "";
	const [modalState, setModalState] = useState<ModalState>({
		isOpen: false,
		mode: "create",
	});
	const [searchValue, setSearchValue] = useState(search);
	// Authentication context available if needed
	// const { user } = useAuth();

	// !example of fetch list of data
	const { response, handleTableChange } = useFetchClients();
	const { data: paginatedClients, isLoading, error } = response;

	// Extract clients from paginated response
	const clients = paginatedClients?.data?.docs || [];

	// Debounced search effect
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchValue !== search) {
				const searchParams = QueryBuilder.generateSearchParams()
					.setPage(1) // Reset to first page when searching
					.setLimit(paginatedClients?.data?.limit || 10)
					.setSearch(searchValue).search;
				navigate({
					search: searchParams,
				});
			}
		}, 500); // 500ms debounce

		return () => clearTimeout(timer);
	}, [searchValue, search, navigate, paginatedClients?.data?.limit]);

	// Sync search value with URL parameter
	useEffect(() => {
		setSearchValue(search);
	}, [search]);

	const handleAddClient = useCallback(() => {
		setModalState({
			isOpen: true,
			mode: "create",
		});
	}, []);

	const handleEditClient = useCallback((client: ClientItemResponseType) => {
		setModalState({
			isOpen: true,
			mode: "update",
			client,
		});
	}, []);

	const handleDeleteClient = useCallback(
		async (client: ClientItemResponseType) => {
			Modal.confirm({
				title: t("clients.delete.title"),
				content: t("clients.delete.content", { name: client.fullName }),
				okText: t("clients.delete.confirm"),
				cancelText: t("ui.cancel"),
				okButtonProps: { danger: true },
				onOk: async () => {
					try {
						await clientService.delete(client._id);
						message.success(
							t("clients.delete.success", { name: client.fullName })
						);
						// Refetch the clients list to show updated data
						queryClient.invalidateQueries([queryKeys.CLIENTS]);
					} catch (error) {
						const errorMessage = getErrorMessage(error);
						message.error(t("clients.delete.error"));
						console.error("Delete error:", errorMessage, error);
					}
				},
			});
		},
		[t, queryClient]
	);

	const handleFormSuccess = useCallback(() => {
		setModalState({ isOpen: false, mode: "create" });
		// Invalidate and refetch the clients query to show the new/updated client
		queryClient.invalidateQueries([queryKeys.CLIENTS]);
	}, [queryClient]);

	const handleModalClose = useCallback(() => {
		setModalState({ isOpen: false, mode: "create" });
	}, []);

	const handleSearch = useCallback(
		(value: string) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setPage(1) // Reset to first page when searching
				.setLimit(paginatedClients?.data?.limit || 10)
				.setSearch(value).search;
			navigate({
				search: searchParams,
			});
		},
		[navigate, paginatedClients?.data?.limit]
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	};

	const handleSearchClear = useCallback(() => {
		setSearchValue("");
		handleSearch("");
	}, [handleSearch]);

	const columns: ColumnsType<ClientItemResponseType> = useMemo(
		() => [
			{
				title: t("clients.name"),
				dataIndex: "fullName",
				key: "fullName",
				render: (_: string, record: ClientItemResponseType) => (
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<ClientAvatarDisplay client={record} size='small' />
						<span>{record.fullName}</span>
					</div>
				),
			},
			{
				title: t("clients.email"),
				dataIndex: "email",
				key: "email",
				render: (email: string) => email || t("ui.noData"),
			},
			{
				title: t("clients.phone"),
				dataIndex: "phoneNumber",
				key: "phoneNumber",
				render: (phone: string) => phone || t("ui.noData"),
			},
			{
				title: t("clients.location"),
				dataIndex: "location",
				key: "location",
				render: (location: string) => location || t("ui.noData"),
			},
			{
				title: t("ui.actions"),
				key: "actions",
				width: 120,
				render: (_: unknown, record: ClientItemResponseType) => (
					<Space>
						<Button
							icon={<EditOutlined />}
							size='small'
							onClick={() => handleEditClient(record)}
							aria-label={t("clients.edit", "Edit client")}
						/>
						<Button
							icon={<DeleteOutlined />}
							size='small'
							danger
							onClick={() => handleDeleteClient(record)}
							aria-label={t("clients.delete.title")}
						/>
					</Space>
				),
			},
		],
		[t, handleEditClient, handleDeleteClient]
	);

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}
				data-testid={testIds.loadingSpinner}
			>
				<Spin size='large' />
			</div>
		);
	}

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "24px",
				}}
			>
				<Title level={2} style={{ margin: 0 }}>
					{t("navigation.clients")}
				</Title>
				<Button
					type='primary'
					icon={<PlusOutlined />}
					onClick={handleAddClient}
					data-testid={testIds.addClientButton}
				>
					{t("clients.add")}
				</Button>
			</div>

			{/* Search Section */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				<Col xs={24} sm={12} md={8}>
					<Input
						placeholder={t("clients.search")}
						allowClear
						prefix={<SearchOutlined />}
						size='middle'
						value={searchValue}
						onChange={handleSearchChange}
						onClear={handleSearchClear}
						data-testid={testIds.searchInput}
					/>
				</Col>
			</Row>

			{!!error && (
				<Alert
					message={t("error.fetchFailed", "Failed to fetch data")}
					description={getErrorMessage(error)}
					type='error'
					closable
					style={{ marginBottom: "16px" }}
					data-testid={testIds.errorAlert}
				/>
			)}

			<Card>
				<Table<ClientItemResponseType>
					dataSource={clients}
					columns={columns}
					rowKey='_id'
					loading={isLoading}
					data-testid={testIds.clientsTable}
					onRow={(record) => ({
						onClick: () => handleEditClient(record),
						style: { cursor: "pointer" },
						title: t("clients.clickToEdit"),
					})}
					pagination={{
						total: paginatedClients?.data?.totalDocs || 0,
						current: paginatedClients?.data?.page || 1,
						pageSize: paginatedClients?.data?.limit || 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total: number, range: [number, number]) =>
							t("clients.pagination.showTotal", {
								defaultValue: `${range[0]}-${range[1]} of ${total} clients`,
								start: range[0],
								end: range[1],
								total: total,
							}),
						onChange: (page: number, pageSize: number) => {
							handleTableChange({ current: page, pageSize });
						},
					}}
				/>
			</Card>

			{/* Client Form Modal */}
			<CustomModal
				className=''
				title={
					modalState.mode === "create"
						? t("clients.modal.addTitle")
						: t("clients.modal.updateTitle")
				}
				borderB={false}
				isOpen={modalState.isOpen}
				close={handleModalClose}
				width='700px'
				height='500px'
				maskClosable={false}
				data-testid={testIds.clientModal}
			>
				<ClientFormSimple
					mode={modalState.mode}
					client={modalState.client}
					onSuccess={handleFormSuccess}
					onCancel={handleModalClose}
				/>
			</CustomModal>
		</div>
	);
};
