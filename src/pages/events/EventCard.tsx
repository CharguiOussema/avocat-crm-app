/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Button, Space, Typography, Tooltip, Avatar, Tag } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	CalendarOutlined,
	ClockCircleOutlined,
	FileTextOutlined,
	UserOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { EventItemResponseType } from "../../models/event";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";

const { Text, Paragraph } = Typography;

// Helper function to format date and time
const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = date.toLocaleString("en", { month: "short" });
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${day} ${month} ${year} ${hours}:${minutes}`;
};

// Helper to check if event is upcoming, ongoing, or past
const getEventStatus = (startDate: string, endDate: string): "upcoming" | "ongoing" | "past" => {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (now < start) return "upcoming";
	if (now > end) return "past";
	return "ongoing";
};

interface EventCardProps {
	event: EventItemResponseType;
	onEdit: (event: EventItemResponseType) => void;
	onDelete: (eventId: string, eventName: string) => void;
	selected?: boolean;
	onSelect?: (eventId: string, selected: boolean) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
	event,
	onEdit,
	onDelete,
	selected = false,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();

	const handleCardClick = (e: React.MouseEvent) => {
		// Prevent selection when clicking action buttons
		if (
			(e.target as HTMLElement).closest(".card-actions") ||
			(e.target as HTMLElement).closest(".ant-btn")
		) {
			return;
		}
		if (onSelect) {
			onSelect(event._id, !selected);
		}
	};

	const eventStatus = getEventStatus(event.startDate, event.endDate);

	// Get status color
	const getStatusColor = (): string => {
		switch (eventStatus) {
			case "upcoming":
				return "blue";
			case "ongoing":
				return "green";
			case "past":
				return "default";
			default:
				return "default";
		}
	};

	// Get status label
	const getStatusLabel = (): string => {
		switch (eventStatus) {
			case "upcoming":
				return t("events.status.upcoming");
			case "ongoing":
				return t("events.status.ongoing");
			case "past":
				return t("events.status.past");
			default:
				return "";
		}
	};

	return (
		<Card
			className={cn(
				"event-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
				selected && "ring-2 ring-primary shadow-md",
				"border-border"
			)}
			onClick={handleCardClick}
			styles={{ body: { padding: "20px" } }}
		>
			{/* Header with Title, Status and Actions */}
			<div
				className={cn(
					"flex items-start justify-between mb-3",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div className="flex-1 min-w-0">
					<div
						className={cn(
							"flex items-center gap-2 mb-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<CalendarOutlined className="text-primary flex-shrink-0" />
						<Paragraph
							className="!mb-0 text-base font-semibold text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{event.name}
						</Paragraph>
					</div>
					<Tag color={getStatusColor()}>
						{getStatusLabel()}
					</Tag>
				</div>

				{/* Action Buttons */}
				<Space size="small" className="card-actions flex-shrink-0">
					<Tooltip title={t("ui.edit")}>
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onEdit(event);
							}}
							className="hover:text-primary"
						/>
					</Tooltip>
					<Tooltip title={t("ui.delete")}>
						<Button
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onDelete(event._id, event.name);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>

			{/* Description */}
			{event.description && (
				<Paragraph
					className="!mb-3 text-sm text-muted-foreground"
					ellipsis={{ rows: 2, tooltip: true }}
				>
					{event.description}
				</Paragraph>
			)}

			{/* Date Range */}
			<div className="space-y-2 mb-3">
				<div
					className={cn(
						"flex items-center gap-2",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<ClockCircleOutlined className="text-muted-foreground flex-shrink-0 text-xs" />
					<Text className="text-sm text-card-foreground">
						{formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
					</Text>
				</div>
			</div>

			{/* Footer with Lawsuit and Clients */}
			<div
				className={cn(
					"mt-4 pt-3 border-t border-border space-y-2",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				{/* Lawsuit */}
				{event.lawsuit && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<FileTextOutlined className="text-muted-foreground flex-shrink-0 text-xs" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{event.lawsuit.lawsuitCode}
						</Paragraph>
					</div>
				)}

				{/* Clients */}
				{event.clients && event.clients.length > 0 && (
					<div className="space-y-2">
						<div
							className={cn(
								"flex items-center gap-2",
								isRTL ? "flex-row-reverse" : "flex-row"
							)}
						>
							<TeamOutlined className="text-muted-foreground text-xs" />
							<Text type="secondary" className="text-xs">
								{t("events.card.clients")} ({event.clients.length})
							</Text>
						</div>
						<Avatar.Group
							maxCount={4}
							maxStyle={{
								color: "#f56a00",
								backgroundColor: "#fde3cf",
							}}
						>
							{event.clients.map((client) => (
								<Tooltip key={client._id} title={client.fullName}>
									<Avatar
										src={
											client.avatar
												? `/api/files/serve/client-avatar/${client._id}`
												: undefined
										}
										icon={!client.avatar ? <UserOutlined /> : undefined}
										className="bg-primary/10 text-primary"
									>
										{!client.avatar && client.fullName?.charAt(0).toUpperCase()}
									</Avatar>
								</Tooltip>
							))}
						</Avatar.Group>
					</div>
				)}
			</div>
		</Card>
	);
};
