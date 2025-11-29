/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/29/2025
 */

import React from "react";
import { Card, Button, Space, Typography, Tooltip, Progress, Tag } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	EyeOutlined,
	UserOutlined,
	DollarOutlined,
	FileTextOutlined,
} from "@ant-design/icons";
import { ClientPaymentItemResponseType } from "../../models/clientPayment";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = date.toLocaleString("en", { month: "short" });
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
};

interface ClientPaymentCardProps {
	clientPayment: ClientPaymentItemResponseType;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string, title: string) => void;
	selected?: boolean;
	onSelect?: (id: string, selected: boolean) => void;
}

export const ClientPaymentCard: React.FC<ClientPaymentCardProps> = ({
	clientPayment,
	onView,
	onEdit,
	onDelete,
	selected = false,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();

	const percentage = clientPayment.targetPrice > 0
		? Math.min((clientPayment.total / clientPayment.targetPrice) * 100, 100)
		: 0;

	const handleCardClick = (e: React.MouseEvent) => {
		if (
			(e.target as HTMLElement).closest(".card-actions") ||
			(e.target as HTMLElement).closest(".ant-btn")
		) {
			return;
		}

		if (e.shiftKey && onSelect) {
			onSelect(clientPayment._id, !selected);
			return;
		}

		navigate(`/payments/${clientPayment._id}`);
	};

	return (
		<Card
			className={cn(
				"client-payment-card hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
				selected && "ring-2 ring-primary shadow-md",
				"border-border"
			)}
			onClick={handleCardClick}
			styles={{ body: { padding: "20px" } }}
		>
			{/* Header with Title and Actions */}
			<div
				className={cn(
					"flex items-start justify-between mb-4",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div className="flex-1 min-w-0">
					<Paragraph
						className="!mb-1 text-lg font-semibold text-card-foreground"
						ellipsis={{ rows: 1, tooltip: true }}
					>
						{clientPayment.title}
					</Paragraph>
					<Text type="secondary" className="text-xs">
						{formatDate(clientPayment.createdAt)}
					</Text>
				</div>

				{/* Action Buttons */}
				<Space size="small" className="card-actions flex-shrink-0">
					<Tooltip title={t("payments.card.viewTooltip")}>
						<Button
							type="text"
							icon={<EyeOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onView(clientPayment._id);
							}}
							className="hover:text-primary"
						/>
					</Tooltip>
					<Tooltip title={t("payments.card.editTooltip")}>
						<Button
							type="text"
							icon={<EditOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onEdit(clientPayment._id);
							}}
							className="hover:text-primary"
						/>
					</Tooltip>
					<Tooltip title={t("payments.card.deleteTooltip")}>
						<Button
							type="text"
							danger
							icon={<DeleteOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onDelete(clientPayment._id, clientPayment.title);
							}}
							className="hover:text-destructive"
						/>
					</Tooltip>
				</Space>
			</div>

			{/* Client Information */}
			<div className="space-y-3 mb-4">
				{clientPayment.client && (
					<div
						className={cn(
							"flex items-center gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<UserOutlined className="text-muted-foreground flex-shrink-0" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 1, tooltip: true }}
						>
							{clientPayment.client.fullName}
						</Paragraph>
					</div>
				)}

				{clientPayment.description && (
					<div
						className={cn(
							"flex items-start gap-2",
							isRTL ? "flex-row-reverse" : "flex-row"
						)}
					>
						<FileTextOutlined className="text-muted-foreground flex-shrink-0 mt-1" />
						<Paragraph
							className="!mb-0 text-sm text-card-foreground"
							ellipsis={{ rows: 2, tooltip: true }}
						>
							{clientPayment.description}
						</Paragraph>
					</div>
				)}
			</div>

			{/* Financial Information */}
			<div className="space-y-2 mb-3">
				<div
					className={cn(
						"flex items-center justify-between",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Text type="secondary" className="text-xs">
						{t("payments.table.targetPrice")}:
					</Text>
					<Text className="text-sm font-medium text-blue-600">
						{clientPayment.targetPrice.toLocaleString()} TND
					</Text>
				</div>
				<div
					className={cn(
						"flex items-center justify-between",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Text type="secondary" className="text-xs">
						{t("payments.table.total")}:
					</Text>
					<Text className="text-sm font-medium text-green-600">
						{clientPayment.total.toLocaleString()} TND
					</Text>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="mb-3">
				<Progress
					percent={Number(percentage.toFixed(1))}
					status={percentage >= 100 ? "success" : "active"}
					size="small"
				/>
			</div>

			{/* Footer with Payments Count */}
			<div
				className={cn(
					"pt-3 border-t border-border flex items-center justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<Tag color="blue">
					{clientPayment.payments.length} {t("payments.table.paymentsLabel")}
				</Tag>
				{clientPayment.createdBy && (
					<Text type="secondary" className="text-xs">
						{t("payments.card.createdBy")}: {clientPayment.createdBy.fullName}
					</Text>
				)}
			</div>
		</Card>
	);
};
