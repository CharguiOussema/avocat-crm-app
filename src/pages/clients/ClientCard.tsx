/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/25/2025
 */

import React from "react";
import { Card, Button, Space, Typography, Tooltip, Avatar } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	MailOutlined,
	PhoneOutlined,
	EnvironmentOutlined,
	IdcardOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { ClientItemResponseType } from "../../models/client";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

// Helper function to format date
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = date.toLocaleString("en", { month: "short" });
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
};

interface ClientCardProps {
	client: ClientItemResponseType;
	onEdit: (clientId: string) => void;
	onDelete: (clientId: string, clientName: string) => void;
	selected?: boolean;
	onSelect?: (clientId: string, selected: boolean) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
	client,
	onEdit,
	onDelete,
	selected = false,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();

	const handleCardClick = (e: React.MouseEvent) => {
		// Prevent navigation when clicking action buttons
		if (
			(e.target as HTMLElement).closest(".card-actions") ||
			(e.target as HTMLElement).closest(".ant-btn")
		) {
			return;
		}

		// If shift key is pressed, toggle selection for bulk operations
		if (e.shiftKey && onSelect) {
			onSelect(client._id, !selected);
			return;
		}

		// Default behavior: navigate to client details
		navigate(`/clients/${client._id}`);
	};

	return (
		<Card
			className={cn(
				"client-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
				selected && "ring-2 ring-primary shadow-md",
				"border-border"
			)}
			onClick={handleCardClick}
			styles={{ body: { padding: "20px" } }}
		>
			{/* Header with Avatar and Actions */}
			<div
				className={cn(
					"flex items-start justify-between mb-4",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div
					className={cn(
						"flex items-center gap-3 flex-1",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Avatar
						size={56}
						src={client.avatar ? `/api/files/serve/client-avatar/${client._id}` : undefined}
						icon={!client.avatar ? <UserOutlined /> : undefined}
						className="flex-shrink-0 bg-primary/10 text-primary"
					>
						{!client.avatar && client.fullName?.charAt(0).toUpperCase()}
					</Avatar>
					<div className="flex-1 min-w-0">
						<Paragraph
							className="!mb-1 text-lg font-semibold text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{client.fullName}
						</Paragraph>
						<Text type="secondary" className="text-xs">
							{formatDate(client.createdAt)}
						</Text>
					</div>
				</div>

				{/* Action Buttons */}
				<Space size="small" className="card-actions flex-shrink-0">
					<Tooltip title={t("ui.edit")}>
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onEdit(client._id);
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
								onDelete(client._id, client.fullName);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>

			{/* Contact Information */}
			<div className="space-y-2">
				{client.email && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<MailOutlined className="text-muted-foreground flex-shrink-0" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{client.email}
						</Paragraph>
					</div>
				)}

				{client.phoneNumber && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<PhoneOutlined className="text-muted-foreground flex-shrink-0" />
						<Text className="text-sm text-card-foreground">
							{client.phoneNumber}
						</Text>
					</div>
				)}

				{client.cin && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<IdcardOutlined className="text-muted-foreground flex-shrink-0" />
						<Text className="text-sm text-card-foreground">{client.cin}</Text>
					</div>
				)}

				{client.location && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<EnvironmentOutlined className="text-muted-foreground flex-shrink-0" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{client.location}
						</Paragraph>
					</div>
				)}
			</div>

			{/* Footer with Created By Info */}
			{client.createdBy && (
				<div
					className={cn(
						"mt-4 pt-3 border-t border-border flex items-center justify-between",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Text type="secondary" className="text-xs">
						{t("clients.card.createdBy")}: {client.createdBy.fullName}
					</Text>
				</div>
			)}
		</Card>
	);
};
