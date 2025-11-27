/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/27/2025
 */

import React from "react";
import { Card, Button, Typography, Tooltip, Avatar } from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	ApartmentOutlined,
} from "@ant-design/icons";
import { TypeLawsuitModelType } from "../../../models/typeLawsuit";
import { useApp } from "../../../hooks";
import { cn } from "../../../utils/cn";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

interface TypeLawsuitCardProps {
	type: TypeLawsuitModelType;
	onEdit: (type: TypeLawsuitModelType) => void;
	onDelete: (type: TypeLawsuitModelType) => void;
}

export const TypeLawsuitCard: React.FC<TypeLawsuitCardProps> = ({
	type,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();

	const handleEdit = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		onEdit(type);
	};

	const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		onDelete(type);
	};

	return (
		<Card
			className={cn(
				"type-lawsuit-card hover:shadow-lg transition-all duration-200",
				"flex flex-col h-full min-h-[120px]",
				"border-border"
			)}
			styles={{ body: { padding: "20px", display: "flex", flexDirection: "column", height: "100%" } }}
		>
			{/* Card Content */}
			<div className="flex flex-col gap-4 h-full">
				{/* Header with Icon and Name */}
				<div
					className={cn(
						"flex items-start gap-3 flex-1",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Avatar
						size={48}
						icon={<ApartmentOutlined />}
						className="flex-shrink-0 bg-primary/10 text-primary"
					/>
					<div className="flex-1 min-w-0">
						<Title
							level={5}
							className={cn(
								"!mb-0 !text-base font-semibold text-card-foreground break-words",
								isRTL ? "text-right" : "text-left"
							)}
							style={{
								wordBreak: "break-word",
								overflowWrap: "break-word",
								hyphens: "auto"
							}}
						>
							{type.name}
						</Title>
					</div>
				</div>

				{/* Action Buttons */}
				<div
					className={cn(
						"flex justify-end gap-2 card-actions pt-2 border-t border-border",
						isRTL ? "flex-row-reverse" : "flex-row"
					)}
				>
					<Tooltip title={t("ui.edit")}>
						<Button
							type="text"
							size="small"
							icon={<EditOutlined />}
							onClick={handleEdit}
							className="hover:text-primary hover:bg-primary/10"
						/>
					</Tooltip>
					<Tooltip title={t("ui.delete")}>
						<Button
							type="text"
							size="small"
							danger
							icon={<DeleteOutlined />}
							onClick={handleDelete}
							className="hover:text-destructive hover:bg-destructive/10"
						/>
					</Tooltip>
				</div>
			</div>
		</Card>
	);
};
