/*
 * Developer: Oussema Chargui
 * Company: Avocat Project
 * Date: 10/7/2025
 */

import React, { useState, useCallback, useMemo } from "react";
import {
	Button,
	Alert,
	Spin,
	Modal,
	message,
	Card,
} from "antd";
import {
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { TablePaginationConfig } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useFetchEvents } from "../../hooks/useFetchEvents";
import { eventService } from "../../services/EventService";
import { clientService } from "../../services/ClientService";
import { lawsuitService } from "../../services/LawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { EventTable } from "./EventTable";
import { EventFilters } from "./EventFilters";
import type { EventItemResponseType } from "../../models/event";

const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	lawsuit?: string;
	client?: string;
	page?: number;
	limit?: number;
}

interface EventListProps {
	onEdit: (event: EventItemResponseType) => void;
}

export const EventList: React.FC<EventListProps> = ({ onEdit }) => {
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

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		lawsuit,
		client,
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	// Local state
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	// Fetch events data
	const { response } = useFetchEvents();
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

	// Memoized computed values
	const events = useMemo(() => data?.data?.docs || [], [data]);
	const total = useMemo(() => data?.data?.totalDocs || 0, [data]);

	// Handle search input change
	const handleSearchChange = useCallback(
		(value: string) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setPage(1)
				.setLimit(limit)
				.setQueryParam("search", value || undefined)
				.setQueryParam("lawsuit", lawsuit || undefined)
				.setQueryParam("client", client || undefined).search;
			navigate({ search: searchParams });
		},
		[limit, lawsuit, client, navigate]
	);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(filterName: string, value: string | undefined) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setPage(1)
				.setLimit(limit)
				.setQueryParam("search", search || undefined)
				.setQueryParam(
					"lawsuit",
					filterName === "lawsuit" ? value : lawsuit || undefined
				)
				.setQueryParam(
					"client",
					filterName === "client" ? value : client || undefined
				).search;

			navigate({
				search: searchParams,
			});
		},
		[limit, search, lawsuit, client, navigate]
	);

	// Clear all filters
	const clearFilters = useCallback(() => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit).search;

		navigate({
			search: searchParams,
		});
	}, [limit, navigate]);

	// Pagination handler
	const handleTableChange = useCallback(
		(pagination: TablePaginationConfig) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined)
				.setQueryParam("lawsuit", lawsuit || undefined)
				.setQueryParam("client", client || undefined).search;
			navigate({ search: searchParams });
		},
		[search, lawsuit, client, navigate, limit, page]
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
						console.error("Error deleting event:", error);
						message.error(t("events.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Bulk delete handler
	const handleBulkDelete = useCallback(() => {
		if (selectedRowKeys.length === 0) {
			message.warning(t("events.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("events.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("events.bulk.delete.confirm", {
				count: selectedRowKeys.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await Promise.all(
						selectedRowKeys.map((key) => eventService.delete(String(key)))
					);
					message.success(
						t("events.bulk.delete.success", { count: selectedRowKeys.length })
					);
					setSelectedRowKeys([]);
					queryClient.invalidateQueries(queryKeys.EVENTS);
				} catch (error) {
					console.error("Error deleting events:", error);
					message.error(t("events.bulk.delete.error"));
				}
			},
		});
	}, [selectedRowKeys, t, queryClient]);

	// Selection handler
	const handleSelectionChange = useCallback(
		(newSelectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(newSelectedRowKeys);
		},
		[]
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert
				message={t("events.error.title")}
				description={getErrorMessage(error)}
				type="error"
				showIcon
				className="m-4"
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<EventFilters
				search={search}
				lawsuit={lawsuit}
				client={client}
				lawsuitsOptions={lawsuitsOptions}
				clientsOptions={clientsOptions}
				onSearchChange={handleSearchChange}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
			/>

			{/* Bulk Delete Action */}
			{selectedRowKeys.length > 0 && (
				<div className="flex justify-end">
					<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
						{t("events.bulk.delete.button", { count: selectedRowKeys.length })}
					</Button>
				</div>
			)}

			{/* Events Table */}
			<Card className="border-border">
				<EventTable
					events={events}
					loading={isFetching}
					selectedRowKeys={selectedRowKeys}
					pagination={{ current: page, pageSize: limit, total }}
					onSelectionChange={handleSelectionChange}
					onTableChange={handleTableChange}
					onEdit={onEdit}
					onDelete={handleDelete}
				/>
			</Card>
		</div>
	);
};
