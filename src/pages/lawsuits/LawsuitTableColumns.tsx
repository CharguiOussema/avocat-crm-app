/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import { Space, Tooltip, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { LawsuitItemResponseType } from "../../models/lawsuit";
import { LAWSUIT_STATUS } from "../../models/consts";

interface LawsuitTableColumnsProps {
	t: (key: string, options?: Record<string, unknown>) => string;
	onEdit: (lawsuitId: string) => void;
	onDelete: (lawsuitId: string, lawsuitCode: string) => void;
	getStatusDisplayName: (status: LAWSUIT_STATUS) => string;
	getStatusColor: (status: LAWSUIT_STATUS) => string;
}

export const useLawsuitTableColumns = ({
	t,
	onEdit,
	onDelete,
	getStatusDisplayName,
	getStatusColor,
}: LawsuitTableColumnsProps): ColumnsType<LawsuitItemResponseType> => {
	const columns: ColumnsType<LawsuitItemResponseType> = [
		{
			title: t("lawsuits.table.lawsuitCode"),
			dataIndex: "lawsuitCode",
			key: "lawsuitCode",
			sorter: true,
			render: (text: string) => (
				<span className='font-medium text-card-foreground'>{text}</span>
			),
		},
		{
			title: t("lawsuits.table.clients"),
			dataIndex: "clients",
			key: "clients",
			responsive: ["md"],
			render: (clients: LawsuitItemResponseType["clients"]) => {
				if (!Array.isArray(clients) || clients.length === 0) {
					return <span className='text-muted-foreground'>{t("common.notProvided")}</span>;
				}
				// Handle both string IDs and populated objects
				const displayClients = clients.slice(0, 2).map((client, index) => {
					const key = typeof client === 'string' ? client : (client as {_id: string})._id;
					const name = typeof client === 'string' ? `Client ${index + 1}` : (client as {fullName: string}).fullName;
					return <Tag key={key} className='text-xs'>{name}</Tag>;
				});
				return (
					<div className='flex flex-wrap gap-1'>
						{displayClients}
						{clients.length > 2 && (
							<Tag className='text-xs'>+{clients.length - 2}</Tag>
						)}
					</div>
				);
			},
		},
		{
			title: t("lawsuits.table.court"),
			dataIndex: "court",
			key: "court",
			responsive: ["lg"],
			render: (court: LawsuitItemResponseType["court"]) => {
				if (!court) return <span className='text-muted-foreground'>{t("common.notProvided")}</span>;
				// Handle both string ID and populated object
				const name = typeof court === 'string' ? court : (court as {name: string}).name;
				return <span className='text-muted-foreground'>{name}</span>;
			},
		},
		{
			title: t("lawsuits.table.lawsuitType"),
			dataIndex: "lawsuitType",
			key: "lawsuitType",
			responsive: ["lg"],
			render: (lawsuitType: LawsuitItemResponseType["lawsuitType"]) => {
				if (!lawsuitType) return <span className='text-muted-foreground'>{t("common.notProvided")}</span>;
				// Handle both string ID and populated object
				const name = typeof lawsuitType === 'string' ? lawsuitType : (lawsuitType as {name: string}).name;
				return <span className='text-muted-foreground'>{name}</span>;
			},
		},
		{
			title: t("lawsuits.table.lawsuitStage"),
			dataIndex: "lawsuitStage",
			key: "lawsuitStage",
			responsive: ["lg"],
			render: (lawsuitStage: LawsuitItemResponseType["lawsuitStage"]) => {
				if (!lawsuitStage) return <span className='text-muted-foreground'>{t("common.notProvided")}</span>;
				// Handle both string ID and populated object
				const name = typeof lawsuitStage === 'string' ? lawsuitStage : (lawsuitStage as {name: string}).name;
				return <span className='text-muted-foreground'>{name}</span>;
			},
		},
		{
			title: t("lawsuits.table.status"),
			dataIndex: "status",
			key: "status",
			responsive: ["sm"],
			render: (status: LAWSUIT_STATUS) => (
				<Tag color={getStatusColor(status)}>{getStatusDisplayName(status)}</Tag>
			),
		},
		{
			title: t("lawsuits.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			sorter: true,
			responsive: ["xl"],
			render: (date: string) => (
				<span className='text-muted-foreground'>
					{new Date(date).toLocaleDateString()}
				</span>
			),
		},
		{
			title: t("lawsuits.table.actions"),
			key: "actions",
			width: 120,
			render: (_text: string, record: LawsuitItemResponseType) => (
				<Space size='small'>
					<Tooltip title={t("ui.edit")}>
						<Button
							type='text'
							icon={<EditOutlined />}
							onClick={() => onEdit(record._id)}
							className='text-primary hover:bg-primary/10'
						/>
					</Tooltip>
					<Tooltip title={t("ui.delete")}>
						<Button
							type='text'
							danger
							icon={<DeleteOutlined />}
							onClick={() => onDelete(record._id, record.lawsuitCode)}
							className='text-destructive hover:bg-destructive/10'
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	return columns;
};
