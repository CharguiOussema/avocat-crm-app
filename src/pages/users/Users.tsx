/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/26/2025
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	Typography,
	Card,
	Button,
	Space,
	Alert,
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
import { useInfiniteUsers } from "../../hooks/useInfiniteUsers";
import { userService } from "../../services/UserService";
import { queryKeys } from "../../services/QueryClientManager";
import { useNavigate } from "react-router-dom";
import useQueryParams from "../../hooks/useQueryParams";
import { USER_ROLES } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { SearchInput } from "../../components/common/SearchInput";
import { RoleFilter } from "./RoleFilter";
import { UserCard } from "./UserCard";
import { UserCardSkeleton } from "./UserCardSkeleton";

const { Title } = Typography;
const { confirm } = Modal;

interface QueryParams extends Record<string, unknown> {
	search?: string;
	roles?: string | string[];
}

export const Users: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { search = "", roles = "" } = useQueryParams<QueryParams>();

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [selectedRoles, setSelectedRoles] = useState<USER_ROLES[]>([]);
	const loadMoreRef = useRef<HTMLDivElement>(null);

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

	// Get available roles for filtering
	const getAvailableRoles = useCallback((): USER_ROLES[] => {
		return [USER_ROLES.SUPER_ADMIN, USER_ROLES.USER_ADMIN, USER_ROLES.USER_AGENT];
	}, []);

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

	// Use infinite scroll hook
	const rolesParam = Array.isArray(roles) ? roles.join(',') : roles;
	const {
		data,
		error,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteUsers({ search, roles: rolesParam, limit: 20 });

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Update selected roles when URL roles parameter changes
	useEffect(() => {
		const parsedRoles = parseRolesFromUrl(roles);
		setSelectedRoles(parsedRoles);
	}, [roles, parseRolesFromUrl]);

	// Handle search input change
	const handleSearchChange = useCallback(
		(value: string) => {
			const searchParams = new URLSearchParams();
			if (value) {
				searchParams.set("search", value);
			}
			if (rolesParam) {
				searchParams.set("roles", rolesParam);
			}
			navigate({
				search: searchParams.toString(),
			});
			// Reset selection when searching
			setSelectedUserIds([]);
		},
		[navigate, rolesParam]
	);

	// Handle role filter change
	const handleRoleFilterChange = useCallback(
		(checkedRoles: USER_ROLES[]) => {
			const searchParams = new URLSearchParams();
			if (search) {
				searchParams.set("search", search);
			}
			const rolesUrlParam = rolesToUrlParam(checkedRoles);
			if (rolesUrlParam) {
				searchParams.set("roles", rolesUrlParam);
			}
			navigate({
				search: searchParams.toString(),
			});
			// Reset selection when filtering
			setSelectedUserIds([]);
		},
		[search, navigate, rolesToUrlParam]
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
						logError(error, "Error deleting user");
						message.error(t("users.delete.error"));
					}
				},
			});
		},
		[t, queryClient]
	);

	// Handle bulk deletion
	const handleBulkDelete = useCallback(() => {
		if (selectedUserIds.length === 0) {
			message.warning(t("users.bulk.noSelection"));
			return;
		}

		confirm({
			title: t("users.bulk.delete.title"),
			icon: <ExclamationCircleOutlined />,
			content: t("users.bulk.delete.confirm", {
				count: selectedUserIds.length,
			}),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await userService.bulkDelete(selectedUserIds);
					message.success(
						t("users.bulk.delete.success", { count: selectedUserIds.length })
					);
					setSelectedUserIds([]);
					// Invalidate and refetch users data
					queryClient.invalidateQueries(queryKeys.USERS);
				} catch (error) {
					logError(error, "Error bulk deleting users");
					message.error(t("users.bulk.delete.error"));
				}
			},
		});
	}, [selectedUserIds, t, queryClient]);

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

	// Handle card selection
	const handleCardSelect = useCallback((userId: string, selected: boolean) => {
		setSelectedUserIds((prev) => {
			if (selected) {
				return [...prev, userId];
			} else {
				return prev.filter((id) => id !== userId);
			}
		});
	}, []);


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

	// Flatten all pages into a single array of users
	const users = data?.pages.flatMap((page) => page.docs) || [];
	const totalUsers = data?.pages[0]?.totalDocs || 0;

	return (
		<div className='space-y-6 pb-8'>
			{/* Header */}
			<div
				className={cn(
					"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
					isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
				)}
			>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						{t("users.title")}
					</Title>
					<p className='text-muted-foreground'>
						{t("users.subtitle")} ({totalUsers})
					</p>
				</div>
				<Space wrap>
					{selectedUserIds.length > 0 && (
						<Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
							{t("users.bulk.delete.button", { count: selectedUserIds.length })}
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
				<Row gutter={[16, 16]} align='middle'>
					{/* Search Input - 1/5 width */}
					<Col xs={24} sm={12} md={8} lg={5}>
						<SearchInput
							value={search}
							onChange={handleSearchChange}
							placeholder={t("users.search.placeholder")}
						/>
					</Col>
					{/* Role Filter - 1/5 width */}
					<Col xs={24} sm={12} md={8} lg={5}>
						<RoleFilter
							selectedRoles={selectedRoles}
							availableRoles={getAvailableRoles()}
							onChange={handleRoleFilterChange}
							getRoleDisplayName={getRoleDisplayName}
							t={t}
						/>
					</Col>
				</Row>
			</Card>

			{/* Users Grid */}
			<div className='min-h-[400px]'>
				{isLoading ? (
					// Initial loading skeletons
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<UserCardSkeleton key={index} />
						))}
					</div>
				) : users.length === 0 ? (
					// Empty state
					<Card className='border-border'>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='text-6xl mb-4 text-muted-foreground'>👥</div>
							<Title level={4} className='!mb-2 text-card-foreground'>
								{search || roles ? t("users.empty.search") : t("users.empty.title")}
							</Title>
							<p className='text-muted-foreground mb-4'>
								{search || roles
									? t("users.empty.searchDescription")
									: t("users.empty.description")}
							</p>
							{!search && !roles && (
								<Button
									type='primary'
									icon={<PlusOutlined />}
									onClick={handleAddUser}
								>
									{t("users.add.button")}
								</Button>
							)}
						</div>
					</Card>
				) : (
					<>
						{/* Responsive Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{users.map((user) => (
								<UserCard
									key={user._id}
									user={user}
									onEdit={handleEditUser}
									onDelete={handleDelete}
									getRoleDisplayName={getRoleDisplayName}
									selected={selectedUserIds.includes(user._id)}
									onSelect={handleCardSelect}
								/>
							))}
						</div>

						{/* Load more trigger */}
						<div ref={loadMoreRef} className='mt-8 text-center'>
							{isFetchingNextPage && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
									{Array.from({ length: 4 }).map((_, index) => (
										<UserCardSkeleton key={`loading-${index}`} />
									))}
								</div>
							)}
							{!hasNextPage && users.length > 0 && (
								<p className='text-muted-foreground py-4'>
									{t("users.pagination.endOfList")}
								</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
