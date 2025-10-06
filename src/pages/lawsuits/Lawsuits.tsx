/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import React, { useState, useCallback } from "react";
import {
	Typography,
	Button,
	Space,
	Alert,
	Spin,
	Modal,
	message,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { TablePaginationConfig } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useFetchLawsuits } from "../../hooks/useFetchLawsuits";
import { lawsuitService } from "../../services/LawsuitService";
import { clientService } from "../../services/ClientService";
import { courtService } from "../../services/CourtService";
import { lawsuitStageService } from "../../services/LawsuitStageService";
import { typeLawsuitService } from "../../services/TypeLawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { LAWSUIT_STATUS } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useLawsuitTableColumns } from "./LawsuitTableColumns";
import { LawsuitFilters } from "./LawsuitFilters";
import { LawsuitTable } from "./LawsuitTable";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	status?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	client?: string;
	court?: string;
	page?: number;
	limit?: number;
}

export const Lawsuits: React.FC = () => {
	const { t } = useTranslation();

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
		return t("common.unexpectedError");
	};
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		status,
		lawsuitStage,
		lawsuitType,
		client,
		court,
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const { response } = useFetchLawsuits();
	const { data, error, isLoading, isFetching } = response;

	// Fetch filter options
	const { data: clientsOptions } = useQuery(
		[queryKeys.CLIENTS, "filter"],
		async () => {
			const response = await clientService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	const { data: courtsOptions } = useQuery(
		[queryKeys.COURTS, "filter"],
		async () => {
			const response = await courtService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	const { data: lawsuitStagesOptions } = useQuery(
		[queryKeys.LAWSUIT_STAGES, "filter"],
		async () => {
			const response = await lawsuitStageService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	const { data: lawsuitTypesOptions } = useQuery(
		[queryKeys.LAWSUIT_TYPES, "filter"],
		async () => {
			const response = await typeLawsuitService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Status display names using i18n
	const getStatusDisplayName = useCallback(
		(status: LAWSUIT_STATUS): string => {
			switch (status) {
				case LAWSUIT_STATUS.DONE:
					return t("lawsuits.status.done");
				case LAWSUIT_STATUS.INPROGRESS:
					return t("lawsuits.status.inprogress");
				case LAWSUIT_STATUS.SCHEDULED:
					return t("lawsuits.status.scheduled");
				case LAWSUIT_STATUS.CANCELLED:
					return t("lawsuits.status.cancelled");
				default:
					return status;
			}
		},
		[t]
	);

	// Status color mapping
	const getStatusColor = useCallback((status: LAWSUIT_STATUS): string => {
		switch (status) {
			case LAWSUIT_STATUS.DONE:
				return "success";
			case LAWSUIT_STATUS.INPROGRESS:
				return "processing";
			case LAWSUIT_STATUS.SCHEDULED:
				return "warning";
			case LAWSUIT_STATUS.CANCELLED:
				return "error";
			default:
				return "default";
		}
	}, []);

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit)
			.setQueryParam("search", value || undefined)
			.setQueryParam("status", status || undefined)
			.setQueryParam("lawsuitStage", lawsuitStage || undefined)
			.setQueryParam("lawsuitType", lawsuitType || undefined)
			.setQueryParam("client", client || undefined)
			.setQueryParam("court", court || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [limit, status, lawsuitStage, lawsuitType, client, court, navigate]);

	// Handle filter changes
	const handleFilterChange = useCallback((filterName: string, value: string | undefined) => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit)
			.setQueryParam("search", search || undefined)
			.setQueryParam("status", filterName === "status" ? value : status || undefined)
			.setQueryParam("lawsuitStage", filterName === "lawsuitStage" ? value : lawsuitStage || undefined)
			.setQueryParam("lawsuitType", filterName === "lawsuitType" ? value : lawsuitType || undefined)
			.setQueryParam("client", filterName === "client" ? value : client || undefined)
			.setQueryParam("court", filterName === "court" ? value : court || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [limit, search, status, lawsuitStage, lawsuitType, client, court, navigate]);

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
		(pagination: TablePaginationConfig) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined)
				.setQueryParam("status", status || undefined)
				.setQueryParam("lawsuitStage", lawsuitStage || undefined)
				.setQueryParam("lawsuitType", lawsuitType || undefined)
				.setQueryParam("client", client || undefined)
				.setQueryParam("court", court || undefined).search;

			navigate({
				search: searchParams,
			});
		},
		[limit, page, search, status, lawsuitStage, lawsuitType, client, court, navigate]
	);

	// Handle lawsuit deletion
	const handleDelete = useCallback(
		(lawsuitId: string, lawsuitCode: string) => {
			confirm({
				title: t("lawsuits.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("lawsuits.delete.confirm", { code: lawsuitCode }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await lawsuitService.delete(lawsuitId);
						message.success(t("lawsuits.delete.success", { code: lawsuitCode }));
						// Invalidate and refetch lawsuits data
						queryClient.invalidateQueries(queryKeys.LAWSUITS);
					} catch (error) {
						console.error("Error deleting lawsuit:", error);
						message.error(t("lawsuits.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Navigate to add lawsuit page
	const handleAddLawsuit = useCallback(() => {
		navigate("/lawsuits/add");
	}, [navigate]);

	// Navigate to edit lawsuit page
	const handleEditLawsuit = useCallback(
		(lawsuitId: string) => {
			navigate(`/lawsuits/${lawsuitId}/edit`);
		},
		[navigate]
	);

	// Table columns configuration using custom hook
	const columns = useLawsuitTableColumns({
		t,
		onEdit: handleEditLawsuit,
		onDelete: handleDelete,
		getStatusDisplayName,
		getStatusColor,
	});

	// Handle row selection change
	const handleSelectionChange = useCallback((newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
	}, []);

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
				message={t("lawsuits.error.title")}
				description={getErrorMessage(error)}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	const lawsuits = data?.data?.docs || [];
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
						{t("lawsuits.title")}
					</Title>
					<p className='text-muted-foreground'>{t("lawsuits.subtitle")}</p>
				</div>
				<Space>
					{selectedRowKeys.length > 0 && (
						<Button danger icon={<DeleteOutlined />}>
							{t("lawsuits.bulk.delete.button", { count: selectedRowKeys.length })}
						</Button>
					)}
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddLawsuit}
					>
						{t("lawsuits.add.button")}
					</Button>
				</Space>
			</div>

			{/* Filters */}
			<LawsuitFilters
				search={search}
				status={status}
				client={client}
				court={court}
				lawsuitStage={lawsuitStage}
				lawsuitType={lawsuitType}
				clientsOptions={clientsOptions}
				courtsOptions={courtsOptions}
				lawsuitStagesOptions={lawsuitStagesOptions}
				lawsuitTypesOptions={lawsuitTypesOptions}
				onSearchChange={handleSearchChange}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
				getStatusDisplayName={getStatusDisplayName}
			/>

			{/* Lawsuits Table */}
			<LawsuitTable
				lawsuits={lawsuits}
				columns={columns}
				loading={isFetching}
				selectedRowKeys={selectedRowKeys}
				pagination={{
					current: page,
					pageSize: limit,
					total,
				}}
				onSelectionChange={handleSelectionChange}
				onTableChange={handleTableChange}
			/>
		</div>
	);
};
