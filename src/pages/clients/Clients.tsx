/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/25/2025
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
	Checkbox,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useInfiniteClients } from "../../hooks/useInfiniteClients";
import { clientService } from "../../services/ClientService";
import { queryKeys } from "../../services/QueryClientManager";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { SearchInput } from "../../components/common/SearchInput";
import { ClientCard } from "./ClientCard";
import { ClientCardSkeleton } from "./ClientCardSkeleton";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
}

export const Clients: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { search = "" } = useQueryParams<QueryParams>();

	const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Use infinite scroll hook
	const {
		data,
		error,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteClients({ search, limit: 20 });

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
	const handleSearchChange = useCallback(
		(value: string) => {
			const searchParams = new URLSearchParams();
			if (value) {
				searchParams.set("search", value);
			}
			navigate({
				search: searchParams.toString(),
			});
			// Reset selection when searching
			setSelectedClientIds([]);
		},
		[navigate]
	);

	// Clear all filters
	const clearFilters = useCallback(() => {
		navigate({
			search: "",
		});
		setSelectedClientIds([]);
	}, [navigate]);

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
						logError(error, "Error deleting client");
						message.error(t("clients.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedClientIds.length === 0) {
			message.warning(t("clients.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("clients.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("clients.bulk.delete.confirm", {
				count: selectedClientIds.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await clientService.bulkDelete(selectedClientIds);
					message.success(
						t("clients.bulk.delete.success", { count: selectedClientIds.length })
					);
					setSelectedClientIds([]);
					// Invalidate and refetch clients data
					queryClient.invalidateQueries(queryKeys.CLIENTS);
				} catch (error) {
					logError(error, "Error bulk deleting clients");
					message.error(t("clients.bulk.delete.error"));
				}
			},
		});
	}, [selectedClientIds, t, queryClient]);

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

	// Handle card selection
	const handleCardSelect = useCallback((clientId: string, selected: boolean) => {
		setSelectedClientIds((prev) => {
			if (selected) {
				return [...prev, clientId];
			} else {
				return prev.filter((id) => id !== clientId);
			}
		});
	}, []);

	// Handle select all
	const handleSelectAll = useCallback(
		(checked: boolean) => {
			if (checked && data?.pages) {
				const allClientIds = data.pages.flatMap((page) =>
					page.docs.map((client) => client._id)
				);
				setSelectedClientIds(allClientIds);
			} else {
				setSelectedClientIds([]);
			}
		},
		[data]
	);

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

	// Flatten all pages into a single array of clients
	const clients = data?.pages.flatMap((page) => page.docs) || [];
	const totalClients = data?.pages[0]?.totalDocs || 0;
	const allSelected = clients.length > 0 && selectedClientIds.length === clients.length;

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
						{t("clients.title")}
					</Title>
					<p className='text-muted-foreground'>
						{t("clients.subtitle")} ({totalClients})
					</p>
				</div>
				<Space wrap>
					{selectedClientIds.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("clients.bulk.delete.button", { count: selectedClientIds.length })}
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
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} sm={12} lg={8}>
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("clients.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={12} lg={16}>
						<div
							className={cn(
								"flex flex-wrap items-center gap-3 justify-end",
								isRTL ? "flex-row-reverse" : "flex-row"
							)}
						>
							{clients.length > 0 && (
								<Checkbox
									checked={allSelected}
									indeterminate={
										selectedClientIds.length > 0 &&
										selectedClientIds.length < clients.length
									}
									onChange={(e) => handleSelectAll(e.target.checked)}
								>
									Select All ({selectedClientIds.length}/{clients.length})
								</Checkbox>
							)}
							<Button onClick={clearFilters}>{t("clients.filter.clear")}</Button>
						</div>
					</Col>
				</Row>
			</Card>

			{/* Clients Grid */}
			<div className='min-h-[400px]'>
				{isLoading ? (
					// Initial loading skeletons
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<ClientCardSkeleton key={index} />
						))}
					</div>
				) : clients.length === 0 ? (
					// Empty state
					<Card className='border-border'>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='text-6xl mb-4 text-muted-foreground'>📋</div>
							<Title level={4} className='!mb-2 text-card-foreground'>
								{search ? t("clients.empty.search") : t("clients.empty.title")}
							</Title>
							<p className='text-muted-foreground mb-4'>
								{search
									? t("clients.empty.searchDescription")
									: t("clients.empty.description")}
							</p>
							{!search && (
								<Button
									type='primary'
									icon={<PlusOutlined />}
									onClick={handleAddClient}
								>
									{t("clients.add.button")}
								</Button>
							)}
						</div>
					</Card>
				) : (
					<>
						{/* Responsive Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{clients.map((client) => (
								<ClientCard
									key={client._id}
									client={client}
									onEdit={handleEditClient}
									onDelete={handleDelete}
									selected={selectedClientIds.includes(client._id)}
									onSelect={handleCardSelect}
								/>
							))}
						</div>

						{/* Load more trigger */}
						<div ref={loadMoreRef} className='mt-8 text-center'>
							{isFetchingNextPage && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
									{Array.from({ length: 4 }).map((_, index) => (
										<ClientCardSkeleton key={`loading-${index}`} />
									))}
								</div>
							)}
							{!hasNextPage && clients.length > 0 && (
								<p className='text-muted-foreground py-4'>
									{t("clients.pagination.endOfList")}
								</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
