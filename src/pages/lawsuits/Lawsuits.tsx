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
import { useFetchLawsuits } from "../../hooks/useFetchLawsuits";
import { lawsuitService } from "../../services/LawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { LAWSUIT_STATUS } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useLawsuitTableColumns } from "../../components/lawsuits/LawsuitTableColumns";
import { SearchInput } from "../../components/common/SearchInput";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	status?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	client?: string;
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

export const Lawsuits: React.FC = () => {
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

	const { response } = useFetchLawsuits();
	const { data, error, isLoading, isFetching } = response;

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
			<Card className='border-border'>
				<Row gutter={16} align='middle'>
					<Col xs={24} sm={12} lg={8}>
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("lawsuits.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={24} lg={16}>
						<Space className='w-full justify-end'>
							<Button onClick={clearFilters}>{t("lawsuits.filter.clear")}</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* Lawsuits Table */}
			<Card className='border-border'>
				<Table
					rowSelection={rowSelection}
					columns={columns}
					dataSource={lawsuits}
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
					className='lawsuits-table'
				/>
			</Card>
		</div>
	);
};
