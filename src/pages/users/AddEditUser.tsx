/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 24/9/2024
 */

import React, { useState, useEffect } from "react";
import {
	Typography,
	Card,
	Form,
	Input,
	Button,
	message,
	Select,
	Row,
	Col,
	Spin,
	Alert,
} from "antd";
import {
	ArrowLeftOutlined,
	SaveOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { AvatarUpload } from "../../components/common/AvatarUpload";
import { userService } from "../../services/UserService";
import { documentService } from "../../services/DocumentService";
import { queryKeys } from "../../services/QueryClientManager";
import {
	CreateUserBodyRequest,
	UpdateUserBodyRequest,
	UserItemResponseType,
} from "../../models/user";
import { USER_ROLES, APP_ACCESS } from "../../models/consts";
import { useApp, useAuth } from "../../hooks";
import { cn } from "../../utils/cn";
import type { AvatarEntity } from "../../services/AvatarService";
import type { UserAccessType } from "../../models/user";

const { Title } = Typography;
const { Option } = Select;

interface FormValues {
	fullName: string;
	email: string;
	password?: string;
	confirmPassword?: string;
	role: USER_ROLES;
	cin?: string;
	phoneNumber?: string;
	userAccess?: Partial<UserAccessType>;
}

// Utility function to extract error message with proper typing
const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message);
	}
	return fallbackMessage;
};

export const AddEditUser: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const { user: currentUser } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm<FormValues>();

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [userData, setUserData] = useState<UserItemResponseType | null>(null);
	const [fetchingUser, setFetchingUser] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;
	const [selectedRole, setSelectedRole] = useState<USER_ROLES | null>(null);

	// Get available roles based on current user
	const getAvailableRoles = () => {
		const roles = [USER_ROLES.USER_ADMIN, USER_ROLES.USER_AGENT];

		// Only superAdmin can assign superAdmin role
		if (currentUser?.role === USER_ROLES.SUPER_ADMIN) {
			roles.unshift(USER_ROLES.SUPER_ADMIN);
		}

		return roles;
	};

	// Check if current user can manage userAccess (only SUPER_ADMIN and USER_ADMIN can manage USER_AGENT access)
	const canManageUserAccess = (role: USER_ROLES | null): boolean => {
		if (!role || !currentUser) return false;
		const isAdminUser = currentUser.role === USER_ROLES.SUPER_ADMIN || currentUser.role === USER_ROLES.USER_ADMIN;
		return isAdminUser && role === USER_ROLES.USER_AGENT;
	};

	// Fetch user data for edit mode
	useEffect(() => {
		if (isEditMode && id) {
			setFetchingUser(true);
			setError(null);

			userService
				.getById(id)
				.then((response) => {
					const user = response.data;
					setUserData(user);
					setSelectedRole(user.role);

					// Pre-fill form with user data
					form.setFieldsValue({
						fullName: user.fullName,
						email: user.email,
						role: user.role,
						cin: user.cin || "",
						phoneNumber: user.phoneNumber || "",
					});
				})
				.catch((err) => {
					console.error("Error fetching user:", err);
					setError(getErrorMessage(err, t("common.unexpectedError")));
				})
				.finally(() => {
					setFetchingUser(false);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, id, form]);

	// Handle avatar selection
	const handleAvatarSelected = (file: File | null) => {
		setAvatarFile(file);
	};

	// Get avatar entity for display
	const getAvatarEntity = (): AvatarEntity | undefined => {
		if (isEditMode && userData) {
			return {
				_id: userData._id,
				avatar: userData.avatar,
				fullName: userData.fullName,
			};
		}
		return undefined;
	};

	// Handle form submission
	const handleSubmit = async (values: FormValues) => {
		setLoading(true);
		setError(null);

		try {
			let avatarDocumentId: string | null = null;

			// Upload avatar first if provided
			if (avatarFile) {
				const uploadResponse = await documentService.uploadDocument(
					avatarFile,
					{
						documentType: "avatar",
						associatedEntityType: "user",
						isPublic: true,
					}
				);
				avatarDocumentId = uploadResponse.data._id;
			}

			if (isEditMode && userData) {
				// Update user - password changes are handled in user profile settings
				const updateData: UpdateUserBodyRequest = {
					_id: userData._id,
					fullName: values.fullName.trim(),
					email: values.email.trim(),
					role: values.role,
					cin: values.cin?.trim() || null,
					phoneNumber: values.phoneNumber?.trim() || null,
					avatar: avatarDocumentId || userData.avatar, // Use new avatar ID or keep existing
				};

				// Only include userAccess if user can manage it and it's provided
				if (canManageUserAccess(values.role) && values.userAccess) {
					// Spread with defaults to ensure all required fields are present
					updateData.userAccess = {
						dashboard: values.userAccess.dashboard ?? APP_ACCESS.NO_ACCESS,
						clients: values.userAccess.clients ?? APP_ACCESS.NO_ACCESS,
						users: values.userAccess.users ?? APP_ACCESS.NO_ACCESS,
						lawsuits: values.userAccess.lawsuits ?? APP_ACCESS.NO_ACCESS,
						payments: values.userAccess.payments ?? APP_ACCESS.NO_ACCESS,
						folders: values.userAccess.folders ?? APP_ACCESS.NO_ACCESS,
						events: values.userAccess.events ?? APP_ACCESS.NO_ACCESS,
						courts: values.userAccess.courts ?? APP_ACCESS.NO_ACCESS,
						lawsuitStages: values.userAccess.lawsuitStages ?? APP_ACCESS.NO_ACCESS,
						lawsuitTypes: values.userAccess.lawsuitTypes ?? APP_ACCESS.NO_ACCESS,
					};
				}

				await userService.update(updateData);
				message.success(t("users.update.success", { name: values.fullName }));
			} else {
				// Create new user
				if (!values.password) {
					message.error(t("users.create.passwordRequired"));
					return;
				}

				const createData: CreateUserBodyRequest = {
					fullName: values.fullName.trim(),
					email: values.email.trim(),
					password: values.password,
					role: values.role,
					cin: values.cin?.trim() || null,
					phoneNumber: values.phoneNumber?.trim() || null,
					avatar: avatarDocumentId, // Use uploaded avatar document ID
				};

				// Only include userAccess if user can manage it and it's provided
				if (canManageUserAccess(values.role) && values.userAccess) {
					// Spread with defaults to ensure all required fields are present
					createData.userAccess = {
						dashboard: values.userAccess.dashboard ?? APP_ACCESS.NO_ACCESS,
						clients: values.userAccess.clients ?? APP_ACCESS.NO_ACCESS,
						users: values.userAccess.users ?? APP_ACCESS.NO_ACCESS,
						lawsuits: values.userAccess.lawsuits ?? APP_ACCESS.NO_ACCESS,
						payments: values.userAccess.payments ?? APP_ACCESS.NO_ACCESS,
						folders: values.userAccess.folders ?? APP_ACCESS.NO_ACCESS,
						events: values.userAccess.events ?? APP_ACCESS.NO_ACCESS,
						courts: values.userAccess.courts ?? APP_ACCESS.NO_ACCESS,
						lawsuitStages: values.userAccess.lawsuitStages ?? APP_ACCESS.NO_ACCESS,
						lawsuitTypes: values.userAccess.lawsuitTypes ?? APP_ACCESS.NO_ACCESS,
					};
				}

				await userService.create(createData);
				message.success(t("users.create.success", { name: values.fullName }));
			}

			// Invalidate users cache
			queryClient.invalidateQueries(queryKeys.USERS);

			// Navigate back to users list
			navigate("/users");
		} catch (error) {
			console.error(
				`Error ${isEditMode ? "updating" : "creating"} user:`,
				error
			);
			const errorMessage = getErrorMessage(error, t("common.unexpectedError"));
			setError(errorMessage);
			message.error(
				isEditMode ? t("users.update.error") : t("users.create.error")
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle back navigation
	const handleBack = () => {
		navigate("/users");
	};

	// Password validation
	const validatePassword = (_: unknown, value: string) => {
		if (!isEditMode && !value) {
			return Promise.reject(new Error(t("users.form.password.required")));
		}
		if (value && value.length < 6) {
			return Promise.reject(new Error(t("users.form.password.minLength")));
		}
		return Promise.resolve();
	};

	// Confirm password validation
	const validateConfirmPassword = (_: unknown, value: string) => {
		const password = form.getFieldValue("password");
		if (password && !value) {
			return Promise.reject(
				new Error(t("users.form.confirmPassword.required"))
			);
		}
		if (password && value !== password) {
			return Promise.reject(
				new Error(t("users.form.confirmPassword.mismatch"))
			);
		}
		return Promise.resolve();
	};

	// Loading state for fetching user
	if (fetchingUser) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state for fetching user
	if (error && isEditMode) {
		return (
			<div className='space-y-6'>
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={handleBack}
					className='mb-4'
				>
					{t("ui.back")}
				</Button>
				<Alert
					message={t("users.error.fetchFailed")}
					description={error}
					type='error'
					showIcon
				/>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div
				className={cn(
					"flex items-center gap-4",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<Button icon={<ArrowLeftOutlined />} onClick={handleBack} size='large'>
					{t("ui.back")}
				</Button>
				<div>
					<Title level={2} className='!mb-1 text-card-foreground'>
						{isEditMode
							? t("users.edit.title", { name: userData?.fullName })
							: t("users.add.title")}
					</Title>
					<p className='text-muted-foreground'>
						{isEditMode ? t("users.edit.subtitle") : t("users.add.subtitle")}
					</p>
				</div>
			</div>

			{/* Form */}
			<Card className='border-border'>
				{error && (
					<Alert
						message={t("common.error")}
						description={error}
						type='error'
						showIcon
						className='mb-6'
					/>
				)}

				<Form
					form={form}
					layout='vertical'
					onFinish={handleSubmit}
					disabled={loading}
					className='space-y-6'
				>
					{/* Avatar and Basic Info Layout */}
					<div
						className={cn(
							"flex gap-8",
							isRTL ? "flex-row-reverse" : "flex-row",
							"flex-col lg:flex-row"
						)}
					>
						{/* Avatar Section */}
						<div
							className={cn(
								"flex flex-col gap-4",
								isRTL ? "lg:items-end" : "lg:items-start",
								"items-center lg:w-auto w-full"
							)}
						>
							<div className='text-center lg:text-left'>
								<h3 className='text-lg font-semibold text-card-foreground mb-2'>
									{t("users.form.avatar.title")}
								</h3>
								<p className='text-sm text-muted-foreground'>
									{t("users.form.avatar.subtitle")}
								</p>
							</div>
							<AvatarUpload
								entity={getAvatarEntity()}
								entityType='user'
								onAvatarSelected={handleAvatarSelected}
								disabled={loading}
								size='large'
								useTailwind={true}
							/>
						</div>

						{/* Form Fields */}
						<div className='flex-1 space-y-6'>
							{/* Personal Information */}
							<div>
								<h3 className='text-lg font-semibold text-card-foreground mb-4'>
									{t("users.form.personalInfo.title")}
								</h3>
								<Row gutter={16}>
									<Col xs={24} lg={12}>
										<Form.Item
											name='fullName'
											label={t("users.form.fullName.label")}
											rules={[
												{
													required: true,
													message: t("users.form.fullName.required"),
												},
												{ min: 2, message: t("users.form.fullName.minLength") },
											]}
										>
											<Input
												prefix={<UserOutlined />}
												placeholder={t("users.form.fullName.placeholder")}
												size='large'
											/>
										</Form.Item>
									</Col>
									<Col xs={24} lg={12}>
										<Form.Item
											name='email'
											label={t("users.form.email.label")}
											rules={[
												{
													required: true,
													message: t("users.form.email.required"),
												},
												{
													type: "email",
													message: t("users.form.email.invalid"),
												},
											]}
										>
											<Input
												type='email'
												placeholder={t("users.form.email.placeholder")}
												size='large'
											/>
										</Form.Item>
									</Col>
								</Row>

								<Row gutter={16}>
									<Col xs={24} lg={12}>
										<Form.Item
											name='phoneNumber'
											label={t("users.form.phoneNumber.label")}
											rules={[
												{
													pattern: /^[+]?[1-9][\d\s\-()]{6,20}$/,
													message: t("users.form.phoneNumber.invalid"),
												},
											]}
										>
											<Input
												placeholder={t("users.form.phoneNumber.placeholder")}
												size='large'
											/>
										</Form.Item>
									</Col>
									<Col xs={24} lg={12}>
										<Form.Item
											name='cin'
											label={t("users.form.cin.label")}
											rules={[
												{
													pattern: /^\d{8}$/,
													message: t("users.form.cin.invalid"),
												},
											]}
										>
											<Input
												placeholder={t("users.form.cin.placeholder")}
												maxLength={8}
												size='large'
											/>
										</Form.Item>
									</Col>
								</Row>

								<Row gutter={16}>
									<Col xs={24} lg={12}>
										<Form.Item
											name='role'
											label={t("users.form.role.label")}
											rules={[
												{
													required: true,
													message: t("users.form.role.required"),
												},
											]}
										>
											<Select
												placeholder={t("users.form.role.placeholder")}
												size='large'
												onChange={(value) => setSelectedRole(value as USER_ROLES)}
											>
												{getAvailableRoles().map((role) => (
													<Option key={role} value={role}>
														{t(
															`users.roles.${
																role === USER_ROLES.SUPER_ADMIN
																	? "superAdmin"
																	: role === USER_ROLES.USER_ADMIN
																	? "admin"
																	: "agent"
															}`
														)}
													</Option>
												))}
											</Select>
										</Form.Item>
									</Col>
								</Row>
							</div>

							{/* User Access Management - Only for USER_AGENT */}
							{canManageUserAccess(selectedRole) && (
								<div>
									<h3 className='text-lg font-semibold text-card-foreground mb-4'>
										{t("users.form.userAccess.title")}
									</h3>
									<p className='text-sm text-muted-foreground mb-4'>
										{t("users.form.userAccess.subtitle")}
									</p>
									<Row gutter={[16, 16]}>
										{(
											[
												"dashboard",
												"clients",
												"users",
												"lawsuits",
												"payments",
												"folders",
												"events",
												"courts",
												"lawsuitStages",
												"lawsuitTypes",
											] as Array<keyof UserAccessType>
										).map((module) => (
											<Col xs={24} sm={12} lg={8} key={module}>
												<Form.Item
													name={["userAccess", module]}
													label={t(`navigation.${module}`)}
													initialValue={
														userData?.userAccess?.[module] || APP_ACCESS.NO_ACCESS
													}
												>
													<Select size='large'>
														<Option value={APP_ACCESS.NO_ACCESS}>
															{t("access.levels.NO_ACCESS")}
														</Option>
														<Option value={APP_ACCESS.READ}>
															{t("access.levels.READ")}
														</Option>
														<Option value={APP_ACCESS.WRITE}>
															{t("access.levels.WRITE")}
														</Option>
													</Select>
												</Form.Item>
											</Col>
										))}
									</Row>
								</div>
							)}
						</div>
					</div>

					{/* Security Information - Only for new users */}
					{!isEditMode && (
						<div>
							<h3 className='text-lg font-semibold text-card-foreground mb-4'>
								{t("users.form.security.title")}
							</h3>
							<Row gutter={16}>
								<Col xs={24} lg={12}>
									<Form.Item
										name='password'
										label={t("users.form.password.label")}
										rules={[{ validator: validatePassword }]}
									>
										<Input.Password
											placeholder={t("users.form.password.placeholder")}
											size='large'
										/>
									</Form.Item>
								</Col>
								<Col xs={24} lg={12}>
									<Form.Item
										name='confirmPassword'
										label={t("users.form.confirmPassword.label")}
										dependencies={["password"]}
										rules={[{ validator: validateConfirmPassword }]}
									>
										<Input.Password
											placeholder={t(
												"users.form.confirmPassword.placeholder"
											)}
											size='large'
										/>
									</Form.Item>
								</Col>
							</Row>
						</div>
					)}

					{/* Action Buttons */}
					<div
						className={cn(
							"flex gap-4 pt-6 border-t border-border",
							isRTL ? "flex-row-reverse justify-end" : "flex-row justify-end"
						)}
					>
						<Button size='large' onClick={handleBack} disabled={loading}>
							{t("ui.cancel")}
						</Button>
						<Button
							type='primary'
							htmlType='submit'
							size='large'
							loading={loading}
							icon={<SaveOutlined />}
						>
							{isEditMode ? t("users.form.update") : t("users.form.create")}
						</Button>
					</div>
				</Form>
			</Card>
		</div>
	);
};
