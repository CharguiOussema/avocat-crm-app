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
import { useFetchClientPayments } from "../../hooks/useFetchClientPayments";
import { clientPaymentService } from "../../services/ClientPaymentService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { useClientPaymentTableColumns } from "./ClientPaymentTableColumns";
import { SearchInput } from "../../components/common/SearchInput";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	client?: string;
	page?: number;
	limit?: number;
}

export const ClientPayments: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		client = "",
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	const { response } = useFetchClientPayments();
	const { data, error, isLoading, isFetching } = response;

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit)
			.setQueryParam("search", value || undefined)
			.setQueryParam("client", client || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [limit, client, navigate]);


	// Handle table pagination change
	const handleTableChange = useCallback(
		(pagination: { pageSize?: number; current?: number }) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined)
				.setQueryParam("client", client || undefined).search;

			navigate({
				search: searchParams,
			});
		},
		[limit, page, search, client, navigate]
	);

	// Handle client payment deletion
	const handleDelete = useCallback(
		(clientPaymentId: string, title: string) => {
			confirm({
				title: t("clientPayments.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("clientPayments.delete.confirm", { title }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await clientPaymentService.delete(clientPaymentId);
						message.success(t("clientPayments.delete.success", { title }));
						queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);
					} catch (error) {
						logError(error, "Error deleting client payment");
						message.error(t("clientPayments.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Navigate to add client payment page
	const handleAddClientPayment = useCallback(() => {
		navigate("/payments/add");
	}, [navigate]);

	// Navigate to view client payment details
	const handleViewClientPayment = useCallback(
		(clientPaymentId: string) => {
			navigate(`/payments/${clientPaymentId}`);
		},
		[navigate]
	);

	// Navigate to edit client payment page
	const handleEditClientPayment = useCallback(
		(clientPaymentId: string) => {
			navigate(`/payments/${clientPaymentId}/edit`);
		},
		[navigate]
	);

	// Table columns configuration using custom hook
	const columns = useClientPaymentTableColumns({
		t,
		onView: handleViewClientPayment,
		onEdit: handleEditClientPayment,
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

	const clientPayments = data?.data?.docs || [];
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
						onClick={handleAddClientPayment}
					>
						{t("payments.addClientPayment.button")}
					</Button>
				</Space>
			</div>

			{/* Filters */}
			<Card className='border-border'>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} sm={12} md={8} lg={5}>
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("payments.search.placeholder")}
						/>
					</Col>
				</Row>
			</Card>

			{/* Client Payments Table */}
			<Card className='border-border' title={t("payments.clientPayments.tableTitle")}>
				<Table
					columns={columns}
					dataSource={clientPayments}
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
					className='client-payments-table'
				/>
			</Card>
		</div>
	);
};
