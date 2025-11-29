/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
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
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useInfiniteLawsuits } from "../../hooks/useInfiniteLawsuits";
import { lawsuitService } from "../../services/LawsuitService";
import { clientService } from "../../services/ClientService";
import { courtService } from "../../services/CourtService";
import { lawsuitStageService } from "../../services/LawsuitStageService";
import { typeLawsuitService } from "../../services/TypeLawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { LAWSUIT_STATUS } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { LawsuitFilters } from "./LawsuitFilters";
import { LawsuitCard } from "./LawsuitCard";
import { LawsuitCardSkeleton } from "./LawsuitCardSkeleton";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	status?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	client?: string;
	court?: string;
}

export const Lawsuits: React.FC = () => {
	const { t } = useTranslation();
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
	} = useQueryParams<QueryParams>();

	const [selectedLawsuitIds, setSelectedLawsuitIds] = useState<string[]>([]);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Use infinite scroll hook
	const {
		data,
		error,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteLawsuits({
		search,
		status,
		lawsuitStage,
		lawsuitType,
		client,
		court,
		limit: 20,
	});

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
		[queryKeys.TYPE_LAWSUITS, "filter"],
		async () => {
			const response = await typeLawsuitService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

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

	// Status display names using i18n
	const getStatusDisplayName = useCallback(
		(statusValue: LAWSUIT_STATUS): string => {
			switch (statusValue) {
				case LAWSUIT_STATUS.DONE:
					return t("lawsuits.status.done");
				case LAWSUIT_STATUS.INPROGRESS:
					return t("lawsuits.status.inprogress");
				case LAWSUIT_STATUS.SCHEDULED:
					return t("lawsuits.status.scheduled");
				case LAWSUIT_STATUS.CANCELLED:
					return t("lawsuits.status.cancelled");
				default:
					return statusValue;
			}
		},
		[t]
	);

	// Status color mapping
	const getStatusColor = useCallback((statusValue: LAWSUIT_STATUS): string => {
		switch (statusValue) {
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
	const handleSearchChange = useCallback(
		(value: string) => {
			const searchParams = new URLSearchParams();
			if (value) {
				searchParams.set("search", value);
			}
			if (status) {
				searchParams.set("status", status);
			}
			if (lawsuitStage) {
				searchParams.set("lawsuitStage", lawsuitStage);
			}
			if (lawsuitType) {
				searchParams.set("lawsuitType", lawsuitType);
			}
			if (client) {
				searchParams.set("client", client);
			}
			if (court) {
				searchParams.set("court", court);
			}
			navigate({
				search: searchParams.toString(),
			});
			// Reset selection when searching
			setSelectedLawsuitIds([]);
		},
		[status, lawsuitStage, lawsuitType, client, court, navigate]
	);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(filterName: string, value: string | undefined) => {
			const searchParams = new URLSearchParams();
			if (search) {
				searchParams.set("search", search);
			}
			if (filterName === "status" && value) {
				searchParams.set("status", value);
			} else if (filterName !== "status" && status) {
				searchParams.set("status", status);
			}
			if (filterName === "lawsuitStage" && value) {
				searchParams.set("lawsuitStage", value);
			} else if (filterName !== "lawsuitStage" && lawsuitStage) {
				searchParams.set("lawsuitStage", lawsuitStage);
			}
			if (filterName === "lawsuitType" && value) {
				searchParams.set("lawsuitType", value);
			} else if (filterName !== "lawsuitType" && lawsuitType) {
				searchParams.set("lawsuitType", lawsuitType);
			}
			if (filterName === "client" && value) {
				searchParams.set("client", value);
			} else if (filterName !== "client" && client) {
				searchParams.set("client", client);
			}
			if (filterName === "court" && value) {
				searchParams.set("court", value);
			} else if (filterName !== "court" && court) {
				searchParams.set("court", court);
			}
			navigate({
				search: searchParams.toString(),
			});
			// Reset selection when filtering
			setSelectedLawsuitIds([]);
		},
		[search, status, lawsuitStage, lawsuitType, client, court, navigate]
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
						logError(error, "Error deleting lawsuit");
						message.error(t("lawsuits.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedLawsuitIds.length === 0) {
			message.warning(t("lawsuits.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("lawsuits.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("lawsuits.bulk.delete.confirm", {
				count: selectedLawsuitIds.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					// Note: You might need to implement bulkDelete in lawsuitService
					await Promise.all(
						selectedLawsuitIds.map((id) => lawsuitService.delete(id))
					);
					message.success(
						t("lawsuits.bulk.delete.success", { count: selectedLawsuitIds.length })
					);
					setSelectedLawsuitIds([]);
					// Invalidate and refetch lawsuits data
					queryClient.invalidateQueries(queryKeys.LAWSUITS);
				} catch (error) {
					logError(error, "Error bulk deleting lawsuits");
					message.error(t("lawsuits.bulk.delete.error"));
				}
			},
		});
	}, [selectedLawsuitIds, t, queryClient]);

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

	// Handle card selection
	const handleCardSelect = useCallback((lawsuitId: string, selected: boolean) => {
		setSelectedLawsuitIds((prev) => {
			if (selected) {
				return [...prev, lawsuitId];
			} else {
				return prev.filter((id) => id !== lawsuitId);
			}
		});
	}, []);


	// Error state
	if (error) {
		return (
			<Alert
				message={t("lawsuits.error.title")}
				description={getErrorMessage(error, t("common.unexpectedError"))}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	// Flatten all pages into a single array of lawsuits
	const lawsuits = data?.pages.flatMap((page) => page.docs) || [];
	const totalLawsuits = data?.pages[0]?.totalDocs || 0;

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
						{t("lawsuits.title")}
					</Title>
					<p className='text-muted-foreground'>
						{t("lawsuits.subtitle")} ({totalLawsuits})
					</p>
				</div>
				<Space wrap>
					{selectedLawsuitIds.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("lawsuits.bulk.delete.button", {
								count: selectedLawsuitIds.length,
							})}
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
				getStatusDisplayName={getStatusDisplayName}
			/>

			{/* Lawsuits Grid */}
			<div className='min-h-[400px]'>
				{isLoading ? (
					// Initial loading skeletons
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<LawsuitCardSkeleton key={index} />
						))}
					</div>
				) : lawsuits.length === 0 ? (
					// Empty state
					<Card className='border-border'>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='text-6xl mb-4 text-muted-foreground'>⚖️</div>
							<Title level={4} className='!mb-2 text-card-foreground'>
								{search || status || client || court || lawsuitStage || lawsuitType
									? t("lawsuits.empty.search")
									: t("lawsuits.empty.title")}
							</Title>
							<p className='text-muted-foreground mb-4'>
								{search || status || client || court || lawsuitStage || lawsuitType
									? t("lawsuits.empty.searchDescription")
									: t("lawsuits.empty.description")}
							</p>
							{!search &&
								!status &&
								!client &&
								!court &&
								!lawsuitStage &&
								!lawsuitType && (
									<Button
										type='primary'
										icon={<PlusOutlined />}
										onClick={handleAddLawsuit}
									>
										{t("lawsuits.add.button")}
									</Button>
								)}
						</div>
					</Card>
				) : (
					<>
						{/* Responsive Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{lawsuits.map((lawsuit) => (
								<LawsuitCard
									key={lawsuit._id}
									lawsuit={lawsuit}
									onEdit={handleEditLawsuit}
									onDelete={handleDelete}
									getStatusDisplayName={getStatusDisplayName}
									getStatusColor={getStatusColor}
									selected={selectedLawsuitIds.includes(lawsuit._id)}
									onSelect={handleCardSelect}
								/>
							))}
						</div>

						{/* Load more trigger */}
						<div ref={loadMoreRef} className='mt-8 text-center'>
							{isFetchingNextPage && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
									{Array.from({ length: 4 }).map((_, index) => (
										<LawsuitCardSkeleton key={`loading-${index}`} />
									))}
								</div>
							)}
							{!hasNextPage && lawsuits.length > 0 && (
								<p className='text-muted-foreground py-4'>
									{t("lawsuits.pagination.endOfList")}
								</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
