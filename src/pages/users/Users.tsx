/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 24/9/2024
 */

import React, { useState, useCallback, useMemo } from "react";
import {
	Typography,
	Card,
	Table,
	Button,
	Space,
	Alert,
	Spin,
	Modal,
	message,
	Input,
	Row,
	Col,
	Select,
	Tag,
	Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { UserItemResponseType } from "../../models/user";
import { userService } from "../../services/UserService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { USER_ROLES } from "../../models/consts";
import { AvatarWithModal } from "../../components/common/AvatarWithModal";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	roles?: string;
	page?: number;
	limit?: number;
}

// Utility function to extract error message with proper typing
const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message);
	}
	return "An unexpected error occurred";
};

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

// Role display names - will be moved inside component to access t function

export const Users: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const {
		search = "",
		roles = "",
		page = 1,
		limit = 10,
	} = useQueryParams<QueryParams>();

	// Role display names using i18n
	const getRoleDisplayName = useCallback(
		(role: USER_ROLES): string => {
			switch (role) {
				case USER_ROLES.SUPER_ADMIN:
					return t("users.roles.superAdmin");
				case USER_ROLES.USER_ADMIN:
					return t("users.roles.admin");
				case USER_ROLES.USER_AGENT:
					return t("users.roles.agent");
				default:
					return role;
			}
		},
		[t]
	);

	// Local search state for immediate UI feedback
	const [localSearch, setLocalSearch] = useState(search);
	const [localRoles, setLocalRoles] = useState(roles);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const { response } = useFetchUsers();
	const { data, error, isLoading, isFetching } = response;

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		setLocalSearch(value);
	}, []);

	// Handle role filter change
	const handleRoleFilterChange = useCallback((value: string) => {
		setLocalRoles(value);
	}, []);

	// Apply filters to URL
	const applyFilters = useCallback(() => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1) // Reset to first page when searching
			.setLimit(limit)
			.setQueryParam("search", localSearch || undefined)
			.setQueryParam("roles", localRoles || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [localSearch, localRoles, limit, navigate]);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setLocalSearch("");
		setLocalRoles("");
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit).search;

		navigate({
			search: searchParams,
		});
	}, [limit, navigate]);

	// Handle table pagination change
	const handleTableChange = useCallback(
		(pagination: { pageSize?: number; current?: number }) => {
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined)
				.setQueryParam("roles", roles || undefined).search;

			navigate({
				search: searchParams,
			});
		},
		[limit, page, search, roles, navigate]
	);

	// Handle user deletion
	const handleDelete = useCallback(
		(userId: string, userName: string) => {
			confirm({
				title: t("users.delete.title"),
				icon: <ExclamationCircleOutlined />,
				content: t("users.delete.confirm", { name: userName }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await userService.delete(userId);
						message.success(t("users.delete.success", { name: userName }));
						// Invalidate and refetch users data
						queryClient.invalidateQueries(queryKeys.USERS);
					} catch (error) {
						console.error("Error deleting user:", error);
						message.error(t("users.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedRowKeys.length === 0) {
			message.warning(t("users.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("users.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("users.bulk.delete.confirm", {
				count: selectedRowKeys.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await userService.bulkDelete(selectedRowKeys as string[]);
					message.success(
						t("users.bulk.delete.success", { count: selectedRowKeys.length })
					);
					setSelectedRowKeys([]);
					// Invalidate and refetch users data
					queryClient.invalidateQueries(queryKeys.USERS);
				} catch (error) {
					console.error("Error bulk deleting users:", error);
					message.error(t("users.bulk.delete.error"));
				}
			},
		});
	}, [selectedRowKeys, t, queryClient]);

	// Navigate to add user page
	const handleAddUser = useCallback(() => {
		navigate("/users/add");
	}, [navigate]);

	// Navigate to edit user page
	const handleEditUser = useCallback(
		(userId: string) => {
			navigate(`/users/${userId}/edit`);
		},
		[navigate]
	);

	// Table columns configuration
	const columns: ColumnsType<UserItemResponseType> = useMemo(
		() => [
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
				render: (_: unknown, record: UserItemResponseType) => (
					<Space size='small'>
						<Tooltip title={t("ui.edit")}>
							<Button
								type='text'
								icon={<EditOutlined />}
								onClick={() => handleEditUser(record._id)}
								className='text-primary hover:bg-primary/10'
							/>
						</Tooltip>
						<Tooltip title={t("ui.delete")}>
							<Button
								type='text'
								danger
								icon={<DeleteOutlined />}
								onClick={() => handleDelete(record._id, record.fullName)}
								className='text-destructive hover:bg-destructive/10'
							/>
						</Tooltip>
					</Space>
				),
			},
		],
		[t, handleDelete, handleEditUser, getRoleDisplayName]
	);

	// Row selection configuration
	const rowSelection = {
		selectedRowKeys,
		onChange: (newSelectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(newSelectedRowKeys);
		},
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert
				message={t("users.error.title")}
				description={getErrorMessage(error)}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	const users = data?.data?.docs || [];
	const total = data?.data?.totalDocs || 0;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div
				className={cn(
					"flex items-center justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						{t("users.title")}
					</Title>
					<p className='text-muted-foreground'>{t("users.subtitle")}</p>
				</div>
				<Space>
					{selectedRowKeys.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("users.bulk.delete.button", { count: selectedRowKeys.length })}
						</Button>
					)}
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddUser}
					>
						{t("users.add.button")}
					</Button>
				</Space>
			</div>

			{/* Filters */}
			<Card className='border-border'>
				<Row gutter={16} align='middle'>
					<Col xs={24} sm={12} lg={8}>
						<Input
							placeholder={t("users.search.placeholder")}
							prefix={<SearchOutlined />}
							value={localSearch}
							onChange={(e) => handleSearchChange(e.target.value)}
							onPressEnter={applyFilters}
							className='w-full'
						/>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Select
							placeholder={t("users.filter.roles.placeholder")}
							value={localRoles || undefined}
							onChange={handleRoleFilterChange}
							allowClear
							className='w-full'
						>
							<Select.Option value={USER_ROLES.SUPER_ADMIN}>
								{t("users.roles.superAdmin")}
							</Select.Option>
							<Select.Option value={USER_ROLES.USER_ADMIN}>
								{t("users.roles.admin")}
							</Select.Option>
							<Select.Option value={USER_ROLES.USER_AGENT}>
								{t("users.roles.agent")}
							</Select.Option>
						</Select>
					</Col>
					<Col xs={24} sm={24} lg={10}>
						<Space className='w-full justify-end'>
							<Button onClick={applyFilters} type='primary'>
								{t("users.filter.apply")}
							</Button>
							<Button onClick={clearFilters}>{t("users.filter.clear")}</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* Users Table */}
			<Card className='border-border'>
				<Table
					rowSelection={rowSelection}
					columns={columns}
					dataSource={users}
					rowKey='_id'
					pagination={{
						current: page,
						pageSize: limit,
						total,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) =>
							t("common.pagination.total", {
								start: range[0],
								end: range[1],
								total,
							}),
					}}
					onChange={handleTableChange}
					loading={isFetching}
					scroll={{ x: 800 }}
					className='users-table'
				/>
			</Card>
		</div>
	);
};
