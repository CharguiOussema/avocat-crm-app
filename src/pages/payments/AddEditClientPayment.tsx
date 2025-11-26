import { useCallback, useEffect, useState } from "react";
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
	InputNumber,
} from "antd";
import {
	ArrowLeftOutlined,
	SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { clientPaymentService } from "../../services/ClientPaymentService";
import { clientService } from "../../services/ClientService";
import { lawsuitService } from "../../services/LawsuitService";
import { queryKeys } from "../../services/QueryClientManager";
import {
	CreateClientPaymentBodyRequest,
	UpdateClientPaymentBodyRequest,
} from "../../models/clientPayment";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage } from "../../utils/errorHandling";

const { Title } = Typography;
const { TextArea } = Input;

interface FormValues {
	title: string;
	description?: string;
	lawsuit?: string;
	client: string;
	targetPrice?: number;
}

export const AddEditClientPayment: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm<FormValues>();

	const [loading, setLoading] = useState(false);
	const [fetchingClientPayment, setFetchingClientPayment] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch clients for dropdown
	const { data: clientsData, isLoading: isLoadingClients } = useQuery(
		[queryKeys.CLIENTS, "filter"],
		() => clientService.filter(),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	// Fetch lawsuits for dropdown
	const { data: lawsuitsData, isLoading: isLoadingLawsuits } = useQuery(
		[queryKeys.LAWSUITS, "filter"],
		() => lawsuitService.filter(),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	const clients = clientsData?.data || [];
	const lawsuits = lawsuitsData?.data || [];

	// Fetch client payment data for edit mode
	useEffect(() => {
		if (isEditMode && id) {
			setFetchingClientPayment(true);
			setError(null);

			clientPaymentService
				.getById(id)
				.then((response) => {
					const clientPayment = response.data;

					// Pre-fill form with client payment data
					form.setFieldsValue({
						title: clientPayment.title,
						description: clientPayment.description || undefined,
						lawsuit: clientPayment.lawsuit || undefined,
						client: clientPayment.client._id,
						targetPrice: clientPayment.targetPrice,
					});
				})
				.catch((err) => {
					console.error("Error fetching client payment:", err);
					setError(getErrorMessage(err));
				})
				.finally(() => {
					setFetchingClientPayment(false);
				});
		} else {
			// Reset state when in create mode
			setError(null);
		}
	}, [isEditMode, id, form]);

	// Handle form submission
	const handleSubmit = useCallback(
		async (values: FormValues) => {
			setLoading(true);
			setError(null);

			try {
				const clientPaymentData: CreateClientPaymentBodyRequest | UpdateClientPaymentBodyRequest = {
					title: values.title,
					description: values.description || null,
					lawsuit: values.lawsuit || null,
					client: values.client,
					targetPrice: values.targetPrice || 0,
				};

				if (isEditMode && id) {
					// Update existing client payment
					await clientPaymentService.update({
						_id: id,
						...clientPaymentData,
					});
					message.success(t("clientPayments.update.success"));
				} else {
					// Create new client payment
					const response = await clientPaymentService.create(clientPaymentData);
					message.success(t("payments.create.success"));

					// Navigate to the detail page of the newly created client payment
					navigate(`/payments/${response.data._id}`);
					return;
				}

				// Invalidate client payments cache to refresh the list
				queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);

				// Navigate back to payments list
				navigate("/payments");
			} catch (err) {
				console.error("Error saving client payment:", err);
				const errorMessage = getErrorMessage(err);
				setError(errorMessage);
				message.error(
					isEditMode ? t("payments.update.error") : t("payments.create.error")
				);
			} finally {
				setLoading(false);
			}
		},
		[isEditMode, id, t, queryClient, navigate]
	);

	// Handle cancel/back
	const handleCancel = useCallback(() => {
		navigate("/payments");
	}, [navigate]);

	// Loading state while fetching client payment data
	if (fetchingClientPayment) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state
	if (error && !loading) {
		return (
			<Alert
				message={t("payments.error.title")}
				description={error}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div
				className={cn(
					"flex items-center justify-between",
					isRTL ? "flex-row-reverse" : "flex-row"
				)}
			>
				<div className='flex items-center space-x-4'>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={handleCancel}
						className='hover:bg-muted'
					/>
					<div>
						<Title level={2} className='!mb-2 text-card-foreground'>
							{isEditMode
								? t("payments.editClientPayment.title")
								: t("payments.addClientPayment.title")}
						</Title>
						<p className='text-muted-foreground'>
							{isEditMode
								? t("payments.editClientPayment.subtitle")
								: t("payments.addClientPayment.subtitle")}
						</p>
					</div>
				</div>
			</div>

			{/* Form */}
			<Card className='border-border'>
				<Form
					form={form}
					layout='vertical'
					onFinish={handleSubmit}
					disabled={loading}
					requiredMark='optional'
				>
					<Row gutter={16}>
						{/* Title */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.title.label")}
								name='title'
								rules={[
									{
										required: true,
										message: t("payments.form.title.required"),
									},
									{
										min: 2,
										message: t("payments.form.title.minLength"),
									},
								]}
							>
								<Input
									placeholder={t("payments.form.title.placeholder")}
								/>
							</Form.Item>
						</Col>

						{/* Client */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.client.label")}
								name='client'
								rules={[
									{
										required: true,
										message: t("payments.form.client.required"),
									},
								]}
							>
								<Select
									placeholder={t("payments.form.client.placeholder")}
									loading={isLoadingClients}
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={clients}
									disabled={isLoadingClients}
								/>
							</Form.Item>
						</Col>

						{/* Description */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.description.label")}
								name='description'
							>
								<TextArea
									placeholder={t("payments.form.description.placeholder")}
									rows={3}
								/>
							</Form.Item>
						</Col>

						{/* Target Price */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.targetPrice.label")}
								name='targetPrice'
								rules={[
									{
										type: "number",
										min: 0,
										message: t("payments.form.targetPrice.min"),
									},
								]}
							>
								<InputNumber
									className="w-full"
									placeholder={t("payments.form.targetPrice.placeholder")}
									min={0}
									step={10}
									addonAfter="TND"
								/>
							</Form.Item>
						</Col>

						{/* Lawsuit (Optional) */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.lawsuit.label")}
								name='lawsuit'
							>
								<Select
									placeholder={t("payments.form.lawsuit.placeholder")}
									loading={isLoadingLawsuits}
									showSearch
									allowClear
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={lawsuits}
									disabled={isLoadingLawsuits}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Action Buttons */}
					<Row>
						<Col span={24}>
							<Space className='w-full justify-end'>
								<Button onClick={handleCancel} disabled={loading}>
									{t("ui.cancel")}
								</Button>
								<Button
									type='primary'
									htmlType='submit'
									loading={loading}
									icon={<SaveOutlined />}
								>
									{isEditMode ? t("ui.update") : t("ui.create")}
								</Button>
							</Space>
						</Col>
					</Row>
				</Form>
			</Card>
		</div>
	);
};
