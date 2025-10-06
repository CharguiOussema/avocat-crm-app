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
	Select,
} from "antd";

const { TextArea } = Input;
import {
	ArrowLeftOutlined,
	SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { lawsuitService } from "../../services/LawsuitService";
import { clientService } from "../../services/ClientService";
import { courtService } from "../../services/CourtService";
import { lawsuitStageService } from "../../services/LawsuitStageService";
import { typeLawsuitService } from "../../services/TypeLawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import {
	CreateLawsuitBodyRequest,
	UpdateLawsuitBodyRequest,
	LawsuitItemResponseType,
} from "../../models/lawsuit";
import { LAWSUIT_STATUS } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";

const { Title } = Typography;

interface FormValues {
	lawsuitCode: string;
	description?: string;
	clients: string[];
	court?: string;
	lawsuitStage?: string;
	lawsuitType?: string;
	status: LAWSUIT_STATUS;
}

export const AddEditLawsuit: React.FC = () => {
	const { t } = useTranslation();

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
		return t("common.unexpectedError");
	};
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm<FormValues>();

	const [loading, setLoading] = useState(false);
	const [lawsuitData, setLawsuitData] = useState<LawsuitItemResponseType | null>(null);
	const [fetchingLawsuit, setFetchingLawsuit] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch lawsuit data for edit mode
	useEffect(() => {
		if (isEditMode && id) {
			setFetchingLawsuit(true);
			setError(null);

			lawsuitService
				.getById(id)
				.then((response) => {
					const lawsuit = response.data;
					setLawsuitData(lawsuit);

					// Pre-fill form with lawsuit data
					form.setFieldsValue({
						lawsuitCode: lawsuit.lawsuitCode,
						description: lawsuit.description,
						clients: lawsuit.clients.map((client) => client._id),
						court: lawsuit.court?._id,
						lawsuitStage: lawsuit.lawsuitStage?._id,
						lawsuitType: lawsuit.lawsuitType?._id,
						status: lawsuit.status,
					});
				})
				.catch((err) => {
					console.error("Error fetching lawsuit:", err);
					setError(getErrorMessage(err));
				})
				.finally(() => {
					setFetchingLawsuit(false);
				});
		} else {
			// Reset state when in create mode
			setLawsuitData(null);
			setError(null);
		}
	}, [isEditMode, id, form]);

	// Fetch clients filter options
	const { data: clientsOptions } = useQuery(
		[queryKeys.CLIENTS, "filter"],
		async () => {
			const response = await clientService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Fetch courts filter options
	const { data: courtsOptions } = useQuery(
		[queryKeys.COURTS, "filter"],
		async () => {
			const response = await courtService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Fetch lawsuit stages filter options
	const { data: lawsuitStagesOptions } = useQuery(
		[queryKeys.LAWSUIT_STAGES, "filter"],
		async () => {
			const response = await lawsuitStageService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Fetch lawsuit types filter options
	const { data: lawsuitTypesOptions } = useQuery(
		[queryKeys.LAWSUIT_TYPES, "filter"],
		async () => {
			const response = await typeLawsuitService.filter();
			return response.data;
		},
		{
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);

	// Status options
	const statusOptions = useMemo(() => [
		{ label: t("lawsuits.status.inprogress"), value: LAWSUIT_STATUS.INPROGRESS },
		{ label: t("lawsuits.status.scheduled"), value: LAWSUIT_STATUS.SCHEDULED },
		{ label: t("lawsuits.status.done"), value: LAWSUIT_STATUS.DONE },
		{ label: t("lawsuits.status.cancelled"), value: LAWSUIT_STATUS.CANCELLED },
	], [t]);

	// Handle form submission
	const handleSubmit = useCallback(
		async (values: FormValues) => {
			setLoading(true);
			setError(null);

			try {
				if (isEditMode && lawsuitData) {
					// Update lawsuit
					const updateData: UpdateLawsuitBodyRequest = {
						_id: lawsuitData._id,
						lawsuitCode: values.lawsuitCode.trim(),
						description: values.description?.trim(),
						clients: values.clients,
						court: values.court,
						lawsuitStage: values.lawsuitStage,
						lawsuitType: values.lawsuitType,
						status: values.status,
					};

					await lawsuitService.update(updateData);
					message.success(t("lawsuits.update.success", { code: values.lawsuitCode }));
				} else {
					// Create new lawsuit
					const createData: CreateLawsuitBodyRequest = {
						lawsuitCode: values.lawsuitCode.trim(),
						description: values.description?.trim(),
						clients: values.clients,
						court: values.court,
						lawsuitStage: values.lawsuitStage,
						lawsuitType: values.lawsuitType,
						status: values.status,
					};

					await lawsuitService.create(createData);
					message.success(t("lawsuits.create.success", { code: values.lawsuitCode }));
				}

				// Invalidate lawsuits cache
				await queryClient.invalidateQueries(queryKeys.LAWSUITS);

				// Navigate back to lawsuits list
				navigate("/lawsuits");
			} catch (err) {
				console.error(
					`Error ${isEditMode ? "updating" : "creating"} lawsuit:`,
					err
				);
				const errorMessage = getErrorMessage(err);
				setError(errorMessage);
				message.error(
					isEditMode ? t("lawsuits.update.error") : t("lawsuits.create.error")
				);
			} finally {
				setLoading(false);
			}
		},
		[lawsuitData, isEditMode, navigate, queryClient, t]
	);

	// Handle back navigation
	const handleBack = useCallback(() => {
		navigate("/lawsuits");
	}, [navigate]);

	// Loading state for fetching lawsuit
	if (fetchingLawsuit) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state for fetching lawsuit
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
					message={t("lawsuits.error.fetchTitle")}
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
						{isEditMode ? t("lawsuits.edit.title") : t("lawsuits.add.title")}
					</Title>
					<p className='text-muted-foreground'>
						{isEditMode ? t("lawsuits.edit.subtitle") : t("lawsuits.add.subtitle")}
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
				<Form
					form={form}
					layout='vertical'
					onFinish={handleSubmit}
					disabled={loading}
					initialValues={{
						status: LAWSUIT_STATUS.INPROGRESS,
					}}
				>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name='lawsuitCode'
								label={t("lawsuits.form.lawsuitCode")}
								rules={[
									{
										required: true,
										message: t("lawsuits.form.lawsuitCodeRequired"),
									},
									{
										min: 2,
										message: t("lawsuits.form.lawsuitCodeMinLength"),
									},
								]}
							>
								<Input
									placeholder={t("lawsuits.form.lawsuitCodePlaceholder")}
									size='large'
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name='status'
								label={t("lawsuits.form.status")}
								rules={[
									{
										required: true,
										message: t("lawsuits.form.statusRequired"),
									},
								]}
							>
								<Select
									placeholder={t("lawsuits.form.statusPlaceholder")}
									size='large'
									options={statusOptions}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24}>
							<Form.Item
								name='description'
								label={t("lawsuits.form.description")}
							>
								<TextArea
									placeholder={t("lawsuits.form.descriptionPlaceholder")}
									rows={4}
									size='large'
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name='clients'
								label={t("lawsuits.form.clients")}
								rules={[
									{
										required: true,
										message: t("lawsuits.form.clientsRequired"),
									},
								]}
							>
								<Select
									mode='multiple'
									placeholder={t("lawsuits.form.clientsPlaceholder")}
									size='large'
									options={clientsOptions}
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name='court'
								label={t("lawsuits.form.court")}
							>
								<Select
									placeholder={t("lawsuits.form.courtPlaceholder")}
									size='large'
									options={courtsOptions}
									showSearch
									allowClear
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name='lawsuitStage'
								label={t("lawsuits.form.lawsuitStage")}
							>
								<Select
									placeholder={t("lawsuits.form.lawsuitStagePlaceholder")}
									size='large'
									options={lawsuitStagesOptions}
									showSearch
									allowClear
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name='lawsuitType'
								label={t("lawsuits.form.lawsuitType")}
							>
								<Select
									placeholder={t("lawsuits.form.lawsuitTypePlaceholder")}
									size='large'
									options={lawsuitTypesOptions}
									showSearch
									allowClear
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
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
									? t("lawsuits.form.update")
									: t("lawsuits.form.create")}
							</Button>
							<Button size='large' onClick={handleBack} disabled={loading}>
								{t("ui.cancel")}
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};
