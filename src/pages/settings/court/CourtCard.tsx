/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React from "react";
import { Card, Button, Space, Typography, Tooltip, Avatar } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	HomeOutlined,
} from "@ant-design/icons";
import { CourtModelType } from "../../../models/court";
import { useApp } from "../../../hooks";
import { cn } from "../../../utils/cn";
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

interface CourtCardProps {
	court: CourtModelType;
	onEdit: (court: CourtModelType) => void;
	onDelete: (court: CourtModelType) => void;
	selected?: boolean;
	onSelect?: (courtId: string, selected: boolean) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({
	court,
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
			onSelect(court._id, !selected);
		}
	};

	return (
		<Card
			className={cn(
				"court-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
				selected && "ring-2 ring-primary shadow-md",
				"border-border"
			)}
			onClick={handleCardClick}
			styles={{ body: { padding: "20px" } }}
		>
			{/* Header with Icon, Name and Actions */}
			<div
				className={cn(
					"flex items-start justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div
					className={cn(
						"flex items-center gap-3 flex-1 min-w-0",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Avatar
						size={40}
						icon={<HomeOutlined />}
						className="flex-shrink-0 bg-primary/10 text-primary"
					/>
					<div className="flex-1 min-w-0">
						<Paragraph
							className="!mb-1 text-base font-semibold text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{court.name}
						</Paragraph>
						<Text type="secondary" className="text-xs">
							{formatDate(court.createdAt)}
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
								onEdit(court);
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
								onDelete(court);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>
		</Card>
	);
};
