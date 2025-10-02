/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import { Space, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ClientItemResponseType } from "../../models/client";
import { AvatarWithModal } from "../common/AvatarWithModal";

interface ClientTableColumnsProps {
	t: (key: string, options?: Record<string, unknown>) => string;
	onEdit: (clientId: string) => void;
	onDelete: (clientId: string, clientName: string) => void;
}

export const useClientTableColumns = ({
	t,
	onEdit,
	onDelete,
}: ClientTableColumnsProps): ColumnsType<ClientItemResponseType> => {
	const columns: ColumnsType<ClientItemResponseType> = [
		{
			title: t("clients.table.avatar"),
			dataIndex: "avatar",
			key: "avatar",
			width: 80,
			responsive: ["sm"],
			render: (avatar: string | null, record: ClientItemResponseType) => (
				<AvatarWithModal
					entity={{
						_id: record._id,
						avatar,
						fullName: record.fullName,
					}}
					entityType='client'
					size='small'
					showModal={!!avatar}
				/>
			),
		},
		{
			title: t("clients.table.fullName"),
			dataIndex: "fullName",
			key: "fullName",
			sorter: true,
			render: (text: string) => (
				<span className='font-medium text-card-foreground'>{text}</span>
			),
		},
		{
			title: t("clients.table.email"),
			dataIndex: "email",
			key: "email",
			responsive: ["md"],
			render: (email: string | null) => (
				<span className='text-muted-foreground'>
					{email || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("clients.table.phoneNumber"),
			dataIndex: "phoneNumber",
			key: "phoneNumber",
			responsive: ["lg"],
			render: (phone: string | null) => (
				<span className='text-muted-foreground'>
					{phone || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("clients.table.cin"),
			dataIndex: "cin",
			key: "cin",
			responsive: ["xl"],
			render: (cin: string | null) => (
				<span className='text-muted-foreground'>
					{cin || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("clients.table.location"),
			dataIndex: "location",
			key: "location",
			responsive: ["xl"],
			render: (location: string | null) => (
				<span className='text-muted-foreground'>
					{location || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("clients.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			sorter: true,
			responsive: ["lg"],
			render: (date: string) => (
				<span className='text-muted-foreground'>
					{new Date(date).toLocaleDateString()}
				</span>
			),
		},
		{
			title: t("clients.table.actions"),
			key: "actions",
			width: 120,
			render: (_text: string, record: ClientItemResponseType) => (
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
							onClick={() => onDelete(record._id, record.fullName)}
							className='text-destructive hover:bg-destructive/10'
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	return columns;
};
