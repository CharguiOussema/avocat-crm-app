/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 24/9/2024
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
	Tag,
	Tooltip,
	Checkbox,
	Popover,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	ExclamationCircleOutlined,
	FilterOutlined,
	DownOutlined,
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
import { useApp, useAuth } from "../../hooks";
import { cn } from "../../utils/cn";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	roles?: string | string[];
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
	const { user: currentUser } = useAuth();
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

	// Get available roles for filtering based on current user
	const getAvailableRoles = useCallback(() => {
		const roles = [USER_ROLES.USER_ADMIN, USER_ROLES.USER_AGENT];

		// Only superAdmin can see and filter by superAdmin role
		if (currentUser?.roles.includes(USER_ROLES.SUPER_ADMIN)) {
			roles.unshift(USER_ROLES.SUPER_ADMIN);
		}

		return roles;
	}, [currentUser]);

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [localSearch, setLocalSearch] = useState(search);
	const [selectedRoles, setSelectedRoles] = useState<USER_ROLES[]>([]);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

	// Parse roles from URL parameter
	const parseRolesFromUrl = useCallback((rolesParam?: string | string[]): USER_ROLES[] => {
		if (!rolesParam) return [];
		if (Array.isArray(rolesParam)) {
			return rolesParam.filter((role): role is USER_ROLES =>
				Object.values(USER_ROLES).includes(role as USER_ROLES)
			);
		}
		// Handle comma-separated string
		return rolesParam.split(',').filter((role): role is USER_ROLES =>
			Object.values(USER_ROLES).includes(role as USER_ROLES)
		);
	}, []);

	// Convert roles array to URL parameter
	const rolesToUrlParam = useCallback((rolesList: USER_ROLES[]): string | undefined => {
		return rolesList.length > 0 ? rolesList.join(',') : undefined;
	}, []);

	const { response } = useFetchUsers();
	const { data, error, isLoading, isFetching } = response;

	// Update local search when URL search changes
	useEffect(() => {
		setLocalSearch(search);
	}, [search]);

	// Update selected roles when URL roles parameter changes
	useEffect(() => {
		const parsedRoles = parseRolesFromUrl(roles);
		setSelectedRoles(parsedRoles);
	}, [roles, parseRolesFromUrl]);

	// Debounced search function
	const debouncedSearch = useCallback((searchValue: string) => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			const rolesParam = Array.isArray(roles) ? roles.join(',') : roles;
			const searchParams = QueryBuilder.generateSearchParams()
				.setPage(1) // Reset to first page when searching
				.setLimit(limit)
				.setQueryParam("search", searchValue || undefined)
				.setQueryParam("roles", rolesParam || undefined).search;

			navigate({
				search: searchParams,
			});
		}, 500); // 500ms debounce
	}, [limit, roles, navigate]);

	// Handle search input change with debounce
	const handleSearchChange = useCallback((value: string) => {
		setLocalSearch(value);
		debouncedSearch(value);
	}, [debouncedSearch]);

	// Handle role filter change (immediate)
	const handleRoleFilterChange = useCallback((checkedRoles: USER_ROLES[]) => {
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1) // Reset to first page when filtering
			.setLimit(limit)
			.setQueryParam("search", search || undefined)
			.setQueryParam("roles", rolesToUrlParam(checkedRoles)).search;

		navigate({
			search: searchParams,
		});
	}, [search, limit, navigate, rolesToUrlParam]);

	// Handle individual role checkbox change
	const handleRoleCheckboxChange = useCallback((role: USER_ROLES, checked: boolean) => {
		let newSelectedRoles: USER_ROLES[];
		if (checked) {
			newSelectedRoles = [...selectedRoles, role];
		} else {
			newSelectedRoles = selectedRoles.filter(r => r !== role);
		}
		handleRoleFilterChange(newSelectedRoles);
	}, [selectedRoles, handleRoleFilterChange]);

	// Render role filter content
	const renderRoleFilterContent = useCallback(() => {
		const availableRoles = getAvailableRoles();
		return (
			<div className="space-y-2 p-2 min-w-[200px]">
				{availableRoles.map(role => (
					<div key={role} className="flex items-center">
						<Checkbox
							checked={selectedRoles.includes(role)}
							onChange={(e) => handleRoleCheckboxChange(role, e.target.checked)}
						>
							{getRoleDisplayName(role)}
						</Checkbox>
					</div>
				))}
				{selectedRoles.length > 0 && (
					<div className="pt-2 border-t border-gray-200">
						<Button
							type="link"
							size="small"
							onClick={() => handleRoleFilterChange([])}
							className="text-red-500 p-0 h-auto"
						>
							{t("users.filter.clear")}
						</Button>
					</div>
				)}
			</div>
		);
	}, [getAvailableRoles, selectedRoles, handleRoleCheckboxChange, getRoleDisplayName, handleRoleFilterChange, t]);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setLocalSearch("");
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit).search;

		navigate({
			search: searchParams,
		});
	}, [limit, navigate]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// Handle table pagination change
	const handleTableChange = useCallback(
		(pagination: { pageSize?: number; current?: number }) => {
			const rolesParam = Array.isArray(roles) ? roles.join(',') : roles;
			const searchParams = QueryBuilder.generateSearchParams()
				.setLimit(pagination.pageSize || limit)
				.setPage(pagination.current || page)
				.setQueryParam("search", search || undefined)
				.setQueryParam("roles", rolesParam || undefined).search;

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
							className='w-full'
						/>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Popover
							content={renderRoleFilterContent()}
							title={t("users.filter.roles.title")}
							trigger="click"
							placement="bottomLeft"
						>
							<Button
								className='w-full text-left'
								style={{
									height: '32px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									borderColor: selectedRoles.length > 0 ? '#1890ff' : undefined,
									color: selectedRoles.length > 0 ? '#1890ff' : undefined
								}}
							>
								<span>
									{selectedRoles.length > 0
										? `${selectedRoles.length} ${t("users.filter.roles.selected")}`
										: t("users.filter.roles.placeholder")
									}
								</span>
								<Space>
									<FilterOutlined />
									<DownOutlined style={{ fontSize: '12px' }} />
								</Space>
							</Button>
						</Popover>
					</Col>
					<Col xs={24} sm={24} lg={10}>
						<Space className='w-full justify-end'>
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
