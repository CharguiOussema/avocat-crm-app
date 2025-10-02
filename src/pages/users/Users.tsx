/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 24/9/2024
 */

import React, { useState, useCallback, useEffect } from "react";
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
	Row,
	Col,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { userService } from "../../services/UserService";
import { queryKeys } from "../../services/QueryClientManager";
import { QueryBuilder } from "../../services/QueryBuilder";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { USER_ROLES } from "../../models/consts";
import { useApp, useAuth } from "../../hooks";
import { cn } from "../../utils/cn";
import { useUserTableColumns } from "../../components/users/UserTableColumns";
import { SearchInput } from "../../components/common/SearchInput";
import { RoleFilter } from "../../components/users/RoleFilter";

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
	const [selectedRoles, setSelectedRoles] = useState<USER_ROLES[]>([]);

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

	// Update selected roles when URL roles parameter changes
	useEffect(() => {
		const parsedRoles = parseRolesFromUrl(roles);
		setSelectedRoles(parsedRoles);
	}, [roles, parseRolesFromUrl]);

	// Handle search input change
	const handleSearchChange = useCallback((value: string) => {
		const rolesParam = Array.isArray(roles) ? roles.join(',') : roles;
		const searchParams = QueryBuilder.generateSearchParams()
			.setPage(1)
			.setLimit(limit)
			.setQueryParam("search", value || undefined)
			.setQueryParam("roles", rolesParam || undefined).search;

		navigate({
			search: searchParams,
		});
	}, [limit, roles, navigate]);

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

	// Clear all filters
	const clearFilters = useCallback(() => {
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

	// Table columns configuration using custom hook
	const columns = useUserTableColumns({
		t,
		getRoleDisplayName,
		onEdit: handleEditUser,
		onDelete: handleDelete,
	});

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
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("users.search.placeholder")}
						/>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<RoleFilter
							selectedRoles={selectedRoles}
							availableRoles={getAvailableRoles()}
							onChange={handleRoleFilterChange}
							getRoleDisplayName={getRoleDisplayName}
							t={t}
						/>
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
