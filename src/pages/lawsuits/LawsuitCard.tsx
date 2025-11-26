/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Button, Space, Typography, Tooltip, Tag, Avatar } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	FileTextOutlined,
	BankOutlined,
	UserOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { LawsuitItemResponseType } from "../../models/lawsuit";
import { LAWSUIT_STATUS } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";

const { Text, Paragraph } = Typography;

// Helper function to format date
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = date.toLocaleString("en", { month: "short" });
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
};

interface LawsuitCardProps {
	lawsuit: LawsuitItemResponseType;
	onEdit: (lawsuitId: string) => void;
	onDelete: (lawsuitId: string, lawsuitCode: string) => void;
	getStatusDisplayName: (status: LAWSUIT_STATUS) => string;
	getStatusColor: (status: LAWSUIT_STATUS) => string;
	selected?: boolean;
	onSelect?: (lawsuitId: string, selected: boolean) => void;
}

export const LawsuitCard: React.FC<LawsuitCardProps> = ({
	lawsuit,
	onEdit,
	onDelete,
	getStatusDisplayName,
	getStatusColor,
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
			onSelect(lawsuit._id, !selected);
		}
	};

	return (
		<Card
			className={cn(
				"lawsuit-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
				selected && "ring-2 ring-primary shadow-md",
				"border-border"
			)}
			onClick={handleCardClick}
			styles={{ body: { padding: "20px" } }}
		>
			{/* Header with Code, Status and Actions */}
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
						<FileTextOutlined className="text-primary flex-shrink-0" />
						<Paragraph
							className="!mb-0 text-base font-semibold text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{lawsuit.lawsuitCode}
						</Paragraph>
					</div>
					<Tag color={getStatusColor(lawsuit.status)}>
						{getStatusDisplayName(lawsuit.status)}
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
								onEdit(lawsuit._id);
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
								onDelete(lawsuit._id, lawsuit.lawsuitCode);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>

			{/* Description */}
			{lawsuit.description && (
				<Paragraph
					className="!mb-3 text-sm text-muted-foreground"
					ellipsis={{ rows: 2, tooltip: true }}
				>
					{lawsuit.description}
				</Paragraph>
			)}

			{/* Lawsuit Details */}
			<div className="space-y-2 mb-3">
				{lawsuit.lawsuitType && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<FileTextOutlined className="text-muted-foreground flex-shrink-0 text-xs" />
						<Text className="text-sm text-card-foreground">
							{lawsuit.lawsuitType.name}
						</Text>
					</div>
				)}

				{lawsuit.lawsuitStage && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<Tag color="blue" className="!m-0">
							{lawsuit.lawsuitStage.name}
						</Tag>
					</div>
				)}

				{lawsuit.court && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<BankOutlined className="text-muted-foreground flex-shrink-0 text-xs" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{lawsuit.court.name}
						</Paragraph>
					</div>
				)}
			</div>

			{/* Footer with Clients */}
			<div
				className={cn(
					"mt-4 pt-3 border-t border-border",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				{lawsuit.clients && lawsuit.clients.length > 0 && (
					<div className="space-y-2">
						<div
							className={cn(
								"flex items-center gap-2",
								isRTL ? "flex-row-reverse" : "flex-row"
							)}
						>
							<TeamOutlined className="text-muted-foreground text-xs" />
							<Text type="secondary" className="text-xs">
								{t("lawsuits.card.clients")} ({lawsuit.clients.length})
							</Text>
						</div>
						<Avatar.Group
							maxCount={4}
							maxStyle={{
								color: "#f56a00",
								backgroundColor: "#fde3cf",
							}}
						>
							{lawsuit.clients.map((client) => (
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

				{/* Created Date */}
				<div className="mt-2">
					<Text type="secondary" className="text-xs">
						{formatDate(lawsuit.createdAt)}
					</Text>
				</div>
			</div>
		</Card>
	);
};
