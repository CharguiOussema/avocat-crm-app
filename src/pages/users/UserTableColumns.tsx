/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 2/10/2025
 */

import { Space, Tag, Tooltip, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { UserItemResponseType } from "../../models/user";
import { USER_ROLES } from "../../models/consts";
import { AvatarWithModal } from "../../components/common/AvatarWithModal";

// Role color mapping
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

interface UserTableColumnsProps {
	t: (key: string, options?: Record<string, unknown>) => string;
	getRoleDisplayName: (role: USER_ROLES) => string;
	onEdit: (userId: string) => void;
	onDelete: (userId: string, userName: string) => void;
}

export const useUserTableColumns = ({
	t,
	getRoleDisplayName,
	onEdit,
	onDelete,
}: UserTableColumnsProps): ColumnsType<UserItemResponseType> => {
	return [
		{
			title: t("users.table.avatar"),
			dataIndex: "avatar",
			key: "avatar",
			width: 80,
			render: (avatar: string | null, record: UserItemResponseType) => (
				<AvatarWithModal
					entity={{
						_id: record._id,
						avatar,
						fullName: record.fullName,
					}}
					entityType='user'
					size='small'
					showModal={!!avatar}
				/>
			),
		},
		{
			title: t("users.table.fullName"),
			dataIndex: "fullName",
			key: "fullName",
			sorter: true,
			render: (text: string) => (
				<span className='font-medium text-card-foreground'>{text}</span>
			),
		},
		{
			title: t("users.table.email"),
			dataIndex: "email",
			key: "email",
			render: (email: string) => (
				<span className='text-muted-foreground'>{email}</span>
			),
		},
		{
			title: t("users.table.roles"),
			dataIndex: "roles",
			key: "roles",
			render: (roles: USER_ROLES[]) => (
				<Space wrap>
					{roles.map((role) => (
						<Tag key={role} color={getRoleColor(role)}>
							{getRoleDisplayName(role)}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: t("users.table.phoneNumber"),
			dataIndex: "phoneNumber",
			key: "phoneNumber",
			render: (phone: string | null) => (
				<span className='text-muted-foreground'>
					{phone || t("common.notProvided")}
				</span>
			),
		},
		{
			title: t("users.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			sorter: true,
			render: (date: string) => (
				<span className='text-muted-foreground'>
					{new Date(date).toLocaleDateString()}
				</span>
			),
		},
		{
			title: t("users.table.actions"),
			key: "actions",
			width: 120,
			render: (_text: string, record: UserItemResponseType) => (
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
};
