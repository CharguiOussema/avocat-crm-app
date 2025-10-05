/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 3/10/2025
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Typography,
	Card,
	Form,
	Input,
	Button,
	message,
	Row,
	Col,
	Spin,
	Alert,
	Space,
} from "antd";
import {
	ArrowLeftOutlined,
	SaveOutlined,
	UserOutlined,
	MailOutlined,
	PhoneOutlined,
	IdcardOutlined,
	EnvironmentOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { AvatarUpload } from "../../components/common/AvatarUpload";
import { clientService } from "../../services/ClientService";
import { documentService } from "../../services/DocumentService";
import { queryKeys } from "../../services/QueryClientManager";
import {
	CreateClientBodyRequest,
	UpdateClientBodyRequest,
	ClientItemResponseType,
} from "../../models/client";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import type { AvatarEntity } from "../../services/AvatarService";

const { Title } = Typography;

interface FormValues {
	fullName: string;
	email?: string;
	phoneNumber?: string;
	cin?: string;
	location?: string;
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

export const AddEditClient: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm<FormValues>();

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [clientData, setClientData] = useState<ClientItemResponseType | null>(null);
	const [fetchingClient, setFetchingClient] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch client data for edit mode
	useEffect(() => {
		if (isEditMode && id) {
			setFetchingClient(true);
			setError(null);

			clientService
				.getById(id)
				.then((response) => {
					const client = response.data;
					setClientData(client);

					// Pre-fill form with client data
					form.setFieldsValue({
						fullName: client.fullName,
						email: client.email || "",
						phoneNumber: client.phoneNumber || "",
						cin: client.cin || "",
						location: client.location || "",
					});
				})
				.catch((err) => {
					console.error("Error fetching client:", err);
					setError(getErrorMessage(err));
				})
				.finally(() => {
					setFetchingClient(false);
				});
		} else {
			// Reset state when in create mode
			setClientData(null);
			setError(null);
		}
	}, [isEditMode, id, form]);

	// Handle avatar selection
	const handleAvatarSelected = useCallback((file: File | null) => {
		setAvatarFile(file);
	}, []);

	// Get avatar entity for display - memoized to prevent unnecessary re-renders
	const avatarEntity = useMemo((): AvatarEntity | undefined => {
		if (isEditMode && clientData) {
			return {
				_id: clientData._id,
				avatar: clientData.avatar,
				fullName: clientData.fullName,
			};
		}
		return undefined;
	}, [isEditMode, clientData]);

	// Handle form submission
	const handleSubmit = useCallback(
		async (values: FormValues) => {
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
							associatedEntityType: "client",
							isPublic: true,
						}
					);
					avatarDocumentId = uploadResponse.data._id;
				}

				if (isEditMode && clientData) {
					// Update client
					const updateData: UpdateClientBodyRequest = {
						_id: clientData._id,
						fullName: values.fullName.trim(),
						email: values.email?.trim() || null,
						phoneNumber: values.phoneNumber?.trim() || null,
						cin: values.cin?.trim() || null,
						location: values.location?.trim() || null,
						avatar: avatarDocumentId || clientData.avatar,
					};

					await clientService.update(updateData);
					message.success(t("clients.update.success", { name: values.fullName }));
				} else {
					// Create new client
					const createData: CreateClientBodyRequest = {
						fullName: values.fullName.trim(),
						email: values.email?.trim() || null,
						phoneNumber: values.phoneNumber?.trim() || null,
						cin: values.cin?.trim() || null,
						location: values.location?.trim() || null,
						avatar: avatarDocumentId,
					};

					await clientService.create(createData);
					message.success(t("clients.create.success", { name: values.fullName }));
				}

				// Invalidate clients cache
				await queryClient.invalidateQueries(queryKeys.CLIENTS);

				// Navigate back to clients list
				navigate("/clients");
			} catch (err) {
				console.error(
					`Error ${isEditMode ? "updating" : "creating"} client:`,
					err
				);
				const errorMessage = getErrorMessage(err);
				setError(errorMessage);
				message.error(
					isEditMode ? t("clients.update.error") : t("clients.create.error")
				);
			} finally {
				setLoading(false);
			}
		},
		[avatarFile, clientData, isEditMode, navigate, queryClient, t]
	);

	// Handle back navigation
	const handleBack = useCallback(() => {
		navigate("/clients");
	}, [navigate]);

	// Loading state
	if (fetchingClient) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state for edit mode
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
					message={t("clients.error.fetchTitle")}
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
				<Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
					{t("ui.back")}
				</Button>
				<div>
					<Title level={2} className='!mb-2 text-card-foreground'>
						{isEditMode ? t("clients.edit.title") : t("clients.add.title")}
					</Title>
					<p className='text-muted-foreground'>
						{isEditMode ? t("clients.edit.subtitle") : t("clients.add.subtitle")}
					</p>
				</div>
			</div>

			{error && (
				<Alert
					message={t("common.error")}
					description={error}
					type='error'
					closable
					onClose={() => setError(null)}
				/>
			)}

			<Card className='border-border'>
				<div
					className={cn(
						"flex gap-8 mb-8",
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
							<h4 className='text-base font-semibold text-card-foreground mb-2'>
								{t("clients.form.avatar")}
							</h4>
							<p className='text-sm text-muted-foreground'>
								{t("clients.form.avatarSubtitle")}
							</p>
						</div>
						<AvatarUpload
							entity={avatarEntity}
							entityType='client'
							onAvatarSelected={handleAvatarSelected}
							disabled={loading}
							size='large'
							useTailwind={true}
						/>
					</div>

					{/* Form Fields */}
					<div className='flex-1'>
						<Form
							form={form}
							layout='vertical'
							onFinish={handleSubmit}
							disabled={loading}
						>
							<Row gutter={16}>
								<Col xs={24} md={12}>
									<Form.Item
										name='fullName'
										label={t("clients.form.fullName")}
										rules={[
											{
												required: true,
												message: t("clients.form.fullNameRequired"),
											},
											{
												min: 2,
												message: t("clients.form.fullNameMinLength"),
											},
										]}
									>
										<Input
											prefix={<UserOutlined />}
											placeholder={t("clients.form.fullNamePlaceholder")}
											size='large'
										/>
									</Form.Item>
								</Col>

								<Col xs={24} md={12}>
									<Form.Item
										name='email'
										label={t("clients.form.email")}
										rules={[
											{
												type: "email",
												message: t("clients.form.emailInvalid"),
											},
										]}
									>
										<Input
											prefix={<MailOutlined />}
											placeholder={t("clients.form.emailPlaceholder")}
											size='large'
										/>
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col xs={24} md={12}>
									<Form.Item
										name='phoneNumber'
										label={t("clients.form.phoneNumber")}
										rules={[
											{
												pattern: /^[+]?[1-9][\d\s\-()]{6,20}$/,
												message: t("clients.form.phoneNumberInvalid"),
											},
										]}
									>
										<Input
											prefix={<PhoneOutlined />}
											placeholder={t("clients.form.phoneNumberPlaceholder")}
											size='large'
										/>
									</Form.Item>
								</Col>

								<Col xs={24} md={12}>
									<Form.Item
										name='cin'
										label={t("clients.form.cin")}
										rules={[
											{
												min: 3,
												message: t("clients.form.cinMinLength"),
											},
										]}
									>
										<Input
											prefix={<IdcardOutlined />}
											placeholder={t("clients.form.cinPlaceholder")}
											size='large'
										/>
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col xs={24}>
									<Form.Item
										name='location'
										label={t("clients.form.location")}
									>
										<Input
											prefix={<EnvironmentOutlined />}
											placeholder={t("clients.form.locationPlaceholder")}
											size='large'
										/>
									</Form.Item>
								</Col>
							</Row>

							<Form.Item className='!mb-0'>
								<Space>
									<Button
										type='primary'
										htmlType='submit'
										loading={loading}
										icon={<SaveOutlined />}
										size='large'
									>
										{isEditMode
											? t("clients.form.update")
											: t("clients.form.create")}
									</Button>
									<Button size='large' onClick={handleBack} disabled={loading}>
										{t("ui.cancel")}
									</Button>
								</Space>
							</Form.Item>
						</Form>
					</div>
				</div>
			</Card>
		</div>
	);
};
