/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/22/2025
 */

import React, { useCallback } from "react";
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
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useFetchPayments } from "../../hooks/useFetchPayments";
import { paymentService } from "../../services/PaymentService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { usePaymentTableColumns } from "./PaymentTableColumns";
import { SearchInput } from "../../components/common/SearchInput";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	page?: number;
	limit?: number;
}

export const Payments: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	const { response } = useFetchPayments();
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

	// Handle payment deletion
	const handleDelete = useCallback(
		(paymentId: string, description: string) => {
			confirm({
				title: t("payments.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("payments.delete.confirm", { description }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await paymentService.delete(paymentId);
						message.success(t("payments.delete.success", { description }));
						// Invalidate and refetch payments data
						queryClient.invalidateQueries(queryKeys.PAYMENTS);
					} catch (error) {
						logError(error, "Error deleting payment");
						message.error(t("payments.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Navigate to add payment page
	const handleAddPayment = useCallback(() => {
		navigate("/payments/add");
	}, [navigate]);

	// Navigate to edit payment page
	const handleEditPayment = useCallback(
		(paymentId: string) => {
			navigate(`/payments/${paymentId}/edit`);
		},
		[navigate]
	);

	// Table columns configuration using custom hook
	const columns = usePaymentTableColumns({
		t,
		onEdit: handleEditPayment,
		onDelete: handleDelete,
	});

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
				message={t("payments.error.title")}
				description={getErrorMessage(error)}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	const payments = data?.data?.docs || [];
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
						{t("payments.title")}
					</Title>
					<p className='text-muted-foreground'>{t("payments.subtitle")}</p>
				</div>
				<Space>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddPayment}
					>
						{t("payments.add.button")}
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
							placeholder={t("payments.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={24} lg={16}>
						<Space className='w-full justify-end'>
							<Button onClick={clearFilters}>{t("payments.filter.clear")}</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* Payments Table */}
			<Card className='border-border'>
				<Table
					columns={columns}
					dataSource={payments}
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
					className='payments-table'
				/>
			</Card>
		</div>
	);
};
