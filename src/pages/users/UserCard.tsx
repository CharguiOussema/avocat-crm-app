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
	MailOutlined,
	PhoneOutlined,
	IdcardOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { UserItemResponseType } from "../../models/user";
import { USER_ROLES } from "../../models/consts";
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

interface UserCardProps {
	user: UserItemResponseType;
	onEdit: (userId: string) => void;
	onDelete: (userId: string, userName: string) => void;
	getRoleDisplayName: (role: USER_ROLES) => string;
	selected?: boolean;
	onSelect?: (userId: string, selected: boolean) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
	user,
	onEdit,
	onDelete,
	getRoleDisplayName,
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
			onSelect(user._id, !selected);
		}
	};

	// Get color for role tag
	const getRoleColor = (role: USER_ROLES): string => {
		switch (role) {
			case USER_ROLES.SUPER_ADMIN:
				return "red";
			case USER_ROLES.USER_ADMIN:
				return "blue";
			case USER_ROLES.USER_AGENT:
				return "green";
			default:
				return "default";
		}
	};

	return (
		<Card
			className={cn(
				"user-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
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
						src={user.avatar ? `/api/files/serve/user-avatar/${user._id}` : undefined}
						icon={!user.avatar ? <UserOutlined /> : undefined}
						className="flex-shrink-0 bg-primary/10 text-primary"
					>
						{!user.avatar && user.fullName?.charAt(0).toUpperCase()}
					</Avatar>
					<div className="flex-1 min-w-0">
						<Paragraph
							className="!mb-1 text-lg font-semibold text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{user.fullName}
						</Paragraph>
						<Text type="secondary" className="text-xs">
							{formatDate(user.createdAt)}
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
								onEdit(user._id);
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
								onDelete(user._id, user.fullName);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>

			{/* Contact Information */}
			<div className="space-y-2">
				{user.email && (
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
							{user.email}
						</Paragraph>
					</div>
				)}

				{user.phoneNumber && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<PhoneOutlined className="text-muted-foreground flex-shrink-0" />
						<Text className="text-sm text-card-foreground">
							{user.phoneNumber}
						</Text>
					</div>
				)}

				{user.cin && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<IdcardOutlined className="text-muted-foreground flex-shrink-0" />
						<Text className="text-sm text-card-foreground">{user.cin}</Text>
					</div>
				)}
			</div>

			{/* Footer with Role Tags */}
			<div
				className={cn(
					"mt-4 pt-3 border-t border-border",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div
					className={cn(
						"flex flex-wrap gap-2",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					{user.roles.map((role) => (
						<Tag key={role} color={getRoleColor(role)}>
							{getRoleDisplayName(role)}
						</Tag>
					))}
				</div>
			</div>
		</Card>
	);
};
