/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/29/2025
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	Typography,
	Card,
	Button,
	Space,
	Alert,
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
import { useInfiniteClientPayments } from "../../hooks/useInfiniteClientPayments";
import { clientPaymentService } from "../../services/ClientPaymentService";
import { queryKeys } from "../../services/QueryClientManager";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { SearchInput } from "../../components/common/SearchInput";
import { ClientPaymentCard } from "./ClientPaymentCard";
import { ClientPaymentCardSkeleton } from "./ClientPaymentCardSkeleton";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	client?: string;
}

export const ClientPayments: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { search = "", client = "" } = useQueryParams<QueryParams>();

	const [selectedClientPaymentIds, setSelectedClientPaymentIds] = useState<string[]>([]);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Use infinite scroll hook
	const {
		data,
		error,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteClientPayments({ search, client, limit: 20 });

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		const searchParams = new URLSearchParams();
		if (value) {
			searchParams.set("search", value);
		}
		if (client) {
			searchParams.set("client", client);
		}
		navigate({
			search: searchParams.toString(),
		});
		setSelectedClientPaymentIds([]);
	}, [client, navigate]);


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

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedClientPaymentIds.length === 0) {
			message.warning(t("payments.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("payments.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("payments.bulk.delete.confirm", {
				count: selectedClientPaymentIds.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await clientPaymentService.bulkDelete(selectedClientPaymentIds);
					message.success(
						t("payments.bulk.delete.success", { count: selectedClientPaymentIds.length })
					);
					setSelectedClientPaymentIds([]);
					queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);
				} catch (error) {
					logError(error, "Error bulk deleting client payments");
					message.error(t("payments.bulk.delete.error"));
				}
			},
		});
	}, [selectedClientPaymentIds, t, queryClient]);

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

	// Handle card selection
	const handleCardSelect = useCallback((clientPaymentId: string, selected: boolean) => {
		setSelectedClientPaymentIds((prev) => {
			if (selected) {
				return [...prev, clientPaymentId];
			} else {
				return prev.filter((id) => id !== clientPaymentId);
			}
		});
	}, []);


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

	// Flatten all pages into a single array of client payments
	const clientPayments = data?.pages.flatMap((page) => page.data.docs) || [];
	const totalClientPayments = data?.pages[0]?.data?.totalDocs || 0;

	return (
		<div className='space-y-6 pb-8'>
			{/* Header */}
			<div
				className={cn(
					"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
					isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
				)}
			>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						{t("payments.title")}
					</Title>
					<p className='text-muted-foreground'>
						{t("payments.subtitle")} ({totalClientPayments})
					</p>
				</div>
				<Space wrap>
					{selectedClientPaymentIds.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("payments.bulk.delete.button", { count: selectedClientPaymentIds.length })}
						</Button>
					)}
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

			{/* Client Payments Grid */}
			<div className='min-h-[400px]'>
				{isLoading ? (
					// Initial loading skeletons
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<ClientPaymentCardSkeleton key={index} />
						))}
					</div>
				) : clientPayments.length === 0 ? (
					// Empty state
					<Card className='border-border'>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='text-6xl mb-4 text-muted-foreground'>💳</div>
							<Title level={4} className='!mb-2 text-card-foreground'>
								{search || client ? t("payments.empty.search") : t("payments.empty.title")}
							</Title>
							<p className='text-muted-foreground mb-4'>
								{search || client
									? t("payments.empty.searchDescription")
									: t("payments.empty.description")}
							</p>
							{!search && !client && (
								<Button
									type='primary'
									icon={<PlusOutlined />}
									onClick={handleAddClientPayment}
								>
									{t("payments.addClientPayment.button")}
								</Button>
							)}
						</div>
					</Card>
				) : (
					<>
						{/* Responsive Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{clientPayments.map((clientPayment) => (
								<ClientPaymentCard
									key={clientPayment._id}
									clientPayment={clientPayment}
									onView={handleViewClientPayment}
									onEdit={handleEditClientPayment}
									onDelete={handleDelete}
									selected={selectedClientPaymentIds.includes(clientPayment._id)}
									onSelect={handleCardSelect}
								/>
							))}
						</div>

						{/* Load more trigger */}
						<div ref={loadMoreRef} className='mt-8 text-center'>
							{isFetchingNextPage && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
									{Array.from({ length: 4 }).map((_, index) => (
										<ClientPaymentCardSkeleton key={`loading-${index}`} />
									))}
								</div>
							)}
							{!hasNextPage && clientPayments.length > 0 && (
								<p className='text-muted-foreground py-4'>
									{t("payments.pagination.endOfList")}
								</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
