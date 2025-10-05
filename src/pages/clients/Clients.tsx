/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import React, { useState, useCallback } from "react";
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
	Row,
	Col,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useFetchClients } from "../../hooks/useFetchClients";
import { clientService } from "../../services/ClientService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useClientTableColumns } from "./ClientTableColumns";
import { SearchInput } from "../../components/common/SearchInput";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	page?: number;
	limit?: number;
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
		return String((error as { message: unknown }).message);
	}
	return "An unexpected error occurred";
};

export const Clients: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const { response } = useFetchClients();
	const { data, error, isLoading, isFetching } = response;

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit)
			.setQueryParam("search", value || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [limit, navigate]);

	// Clear all filters
	const clearFilters = useCallback(() => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit).search;

		navigate({
			search: searchParams,
		});
	}, [limit, navigate]);

	// Handle table pagination change
	const handleTableChange = useCallback(
		(pagination: { pageSize?: number; current?: number }) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined).search;

			navigate({
				search: searchParams,
			});
		},
		[limit, page, search, navigate]
	);

	// Handle client deletion
	const handleDelete = useCallback(
		(clientId: string, clientName: string) => {
			confirm({
				title: t("clients.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("clients.delete.confirm", { name: clientName }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await clientService.delete(clientId);
						message.success(t("clients.delete.success", { name: clientName }));
						// Invalidate and refetch clients data
						queryClient.invalidateQueries(queryKeys.CLIENTS);
					} catch (error) {
						console.error("Error deleting client:", error);
						message.error(t("clients.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedRowKeys.length === 0) {
			message.warning(t("clients.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("clients.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("clients.bulk.delete.confirm", {
				count: selectedRowKeys.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await clientService.bulkDelete(selectedRowKeys as string[]);
					message.success(
						t("clients.bulk.delete.success", { count: selectedRowKeys.length })
					);
					setSelectedRowKeys([]);
					// Invalidate and refetch clients data
					queryClient.invalidateQueries(queryKeys.CLIENTS);
				} catch (error) {
					console.error("Error bulk deleting clients:", error);
					message.error(t("clients.bulk.delete.error"));
				}
			},
		});
	}, [selectedRowKeys, t, queryClient]);

	// Navigate to add client page
	const handleAddClient = useCallback(() => {
		navigate("/clients/add");
	}, [navigate]);

	// Navigate to edit client page
	const handleEditClient = useCallback(
		(clientId: string) => {
			navigate(`/clients/${clientId}/edit`);
		},
		[navigate]
	);

	// Table columns configuration using custom hook
	const columns = useClientTableColumns({
		t,
		onEdit: handleEditClient,
		onDelete: handleDelete,
	});

	// Row selection configuration
	const rowSelection = {
		selectedRowKeys,
		onChange: (newSelectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(newSelectedRowKeys);
		},
	};

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
				message={t("clients.error.title")}
				description={getErrorMessage(error)}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	const clients = data?.data?.docs || [];
	const total = data?.data?.totalDocs || 0;

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
						{t("clients.title")}
					</Title>
					<p className='text-muted-foreground'>{t("clients.subtitle")}</p>
				</div>
				<Space>
					{selectedRowKeys.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("clients.bulk.delete.button", { count: selectedRowKeys.length })}
						</Button>
					)}
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddClient}
					>
						{t("clients.add.button")}
					</Button>
				</Space>
			</div>

			{/* Filters */}
			<Card className='border-border'>
				<Row gutter={16} align='middle'>
					<Col xs={24} sm={12} lg={8}>
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("clients.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={24} lg={16}>
						<Space className='w-full justify-end'>
							<Button onClick={clearFilters}>{t("clients.filter.clear")}</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* Clients Table */}
			<Card className='border-border'>
				<Table
					rowSelection={rowSelection}
					columns={columns}
					dataSource={clients}
					rowKey='_id'
					pagination={{
						current: page,
						pageSize: limit,
						total,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) =>
							t("common.pagination.total", {
								start: range[0],
								end: range[1],
								total,
							}),
					}}
					onChange={handleTableChange}
					loading={isFetching}
					className='clients-table'
				/>
			</Card>
		</div>
	);
};
