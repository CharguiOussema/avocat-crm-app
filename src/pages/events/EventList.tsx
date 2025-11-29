/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	Typography,
	Card,
	Alert,
	Modal,
	message,
} from "antd";
import {
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useInfiniteEvents } from "../../hooks/useInfiniteEvents";
import { eventService } from "../../services/EventService";
import { clientService } from "../../services/ClientService";
import { lawsuitService } from "../../services/LawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import type { EventItemResponseType } from "../../models/event";
import { EventFilters } from "./EventFilters";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "./EventCardSkeleton";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { useApp } from "../../hooks";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	lawsuit?: string;
	client?: string;
}

interface EventListProps {
	onEdit: (event: EventItemResponseType) => void;
}

export const EventList: React.FC<EventListProps> = ({ onEdit }) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { search = "", lawsuit, client } = useQueryParams<QueryParams>();

	const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Use infinite scroll hook
	const {
		data,
		error,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteEvents({
		search,
		lawsuit,
		client,
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

	const { data: lawsuitsOptions } = useQuery(
		[queryKeys.LAWSUITS, "filter"],
		async () => {
			const response = await lawsuitService.filter();
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

	// Handle search input change
	const handleSearchChange = useCallback(
		(value: string) => {
			const searchParams = new URLSearchParams();
			if (value) {
				searchParams.set("search", value);
			}
			if (lawsuit) {
				searchParams.set("lawsuit", lawsuit);
			}
			if (client) {
				searchParams.set("client", client);
			}
			navigate({ search: searchParams.toString() });
			// Reset selection when searching
			setSelectedEventIds([]);
		},
		[lawsuit, client, navigate]
	);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(filterName: string, value: string | undefined) => {
			const searchParams = new URLSearchParams();
			if (search) {
				searchParams.set("search", search);
			}
			if (filterName === "lawsuit" && value) {
				searchParams.set("lawsuit", value);
			} else if (filterName !== "lawsuit" && lawsuit) {
				searchParams.set("lawsuit", lawsuit);
			}
			if (filterName === "client" && value) {
				searchParams.set("client", value);
			} else if (filterName !== "client" && client) {
				searchParams.set("client", client);
			}
			navigate({ search: searchParams.toString() });
			// Reset selection when filtering
			setSelectedEventIds([]);
		},
		[search, lawsuit, client, navigate]
	);


	// Delete handler
	const handleDelete = useCallback(
		(eventId: string, eventName: string) => {
			confirm({
				title: t("events.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("events.delete.confirm", { name: eventName }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await eventService.delete(eventId);
						message.success(t("events.delete.success", { name: eventName }));
						queryClient.invalidateQueries(queryKeys.EVENTS);
					} catch (error) {
						logError(error, "Error deleting event");
						message.error(t("events.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Bulk delete handler
	const handleBulkDelete = useCallback(() => {
		if (selectedEventIds.length === 0) {
			message.warning(t("events.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("events.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("events.bulk.delete.confirm", {
				count: selectedEventIds.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await Promise.all(
						selectedEventIds.map((id) => eventService.delete(id))
					);
					message.success(
						t("events.bulk.delete.success", { count: selectedEventIds.length })
					);
					setSelectedEventIds([]);
					queryClient.invalidateQueries(queryKeys.EVENTS);
				} catch (error) {
					logError(error, "Error deleting events");
					message.error(t("events.bulk.delete.error"));
				}
			},
		});
	}, [selectedEventIds, t, queryClient]);

	// Handle card selection
	const handleCardSelect = useCallback((eventId: string, selected: boolean) => {
		setSelectedEventIds((prev) => {
			if (selected) {
				return [...prev, eventId];
			} else {
				return prev.filter((id) => id !== eventId);
			}
		});
	}, []);


	// Error state
	if (error) {
		return (
			<Alert
				message={t("events.error.title")}
				description={getErrorMessage(error, t("common.unexpectedError"))}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	// Flatten all pages into a single array of events
	const events = data?.pages.flatMap((page) => page.docs) || [];

	return (
		<div className='space-y-4'>
			{/* Filters */}
			<EventFilters
				search={search}
				lawsuit={lawsuit}
				client={client}
				lawsuitsOptions={lawsuitsOptions}
				clientsOptions={clientsOptions}
				onSearchChange={handleSearchChange}
				onFilterChange={handleFilterChange}
			/>

			{/* Events Grid */}
			<div className='min-h-[400px]'>
				{isLoading ? (
					// Initial loading skeletons
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<EventCardSkeleton key={index} />
						))}
					</div>
				) : events.length === 0 ? (
					// Empty state
					<Card className='border-border'>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='text-6xl mb-4 text-muted-foreground'>📅</div>
							<Title level={4} className='!mb-2 text-card-foreground'>
								{search || lawsuit || client
									? t("events.empty.search")
									: t("events.empty.title")}
							</Title>
							<p className='text-muted-foreground mb-4'>
								{search || lawsuit || client
									? t("events.empty.searchDescription")
									: t("events.empty.description")}
							</p>
						</div>
					</Card>
				) : (
					<>
						{/* Responsive Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{events.map((event) => (
								<EventCard
									key={event._id}
									event={event}
									onEdit={onEdit}
									onDelete={handleDelete}
									selected={selectedEventIds.includes(event._id)}
									onSelect={handleCardSelect}
								/>
							))}
						</div>

						{/* Load more trigger */}
						<div ref={loadMoreRef} className='mt-8 text-center'>
							{isFetchingNextPage && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
									{Array.from({ length: 4 }).map((_, index) => (
										<EventCardSkeleton key={`loading-${index}`} />
									))}
								</div>
							)}
							{!hasNextPage && events.length > 0 && (
								<p className='text-muted-foreground py-4'>
									{t("events.pagination.endOfList")}
								</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
