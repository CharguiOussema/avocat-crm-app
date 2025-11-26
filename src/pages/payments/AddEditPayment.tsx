/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/22/2025
 */

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
} from "antd";
import {
	ArrowLeftOutlined,
	SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { paymentService } from "../../services/PaymentService";
import { clientPaymentService } from "../../services/ClientPaymentService";
import { queryKeys } from "../../services/QueryClientManager";
import {
	CreatePaymentBodyRequest,
	UpdatePaymentBodyRequest,
} from "../../models/payment";
import { PAYMENT_TYPE } from "../../models/consts";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage } from "../../utils/errorHandling";

const { Title } = Typography;
const { TextArea } = Input;

interface FormValues {
	description: string;
	type: PAYMENT_TYPE;
	price: number;
	clientPayment: string;
}

export const AddEditPayment: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm<FormValues>();

	const [loading, setLoading] = useState(false);
	const [fetchingPayment, setFetchingPayment] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!id;

	// Fetch client payments for dropdown
	const { data: clientPaymentsData, isLoading: isLoadingClientPayments } = useQuery(
		[queryKeys.CLIENT_PAYMENTS, "all"],
		() => clientPaymentService.getAll({ limit: 1000, page: 1 }),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	const clientPayments = clientPaymentsData?.data?.docs || [];

	// Fetch payment data for edit mode
	useEffect(() => {
		if (isEditMode && id) {
			setFetchingPayment(true);
			setError(null);

			paymentService
				.getById(id)
				.then((response) => {
					const payment = response.data;

					// Pre-fill form with payment data
					form.setFieldsValue({
						description: payment.description,
						type: payment.type,
						price: payment.price,
						clientPayment: payment.clientPayment,
					});
				})
				.catch((err) => {
					console.error("Error fetching payment:", err);
					setError(getErrorMessage(err));
				})
				.finally(() => {
					setFetchingPayment(false);
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
				const paymentData: CreatePaymentBodyRequest | UpdatePaymentBodyRequest = {
					description: values.description,
					type: values.type,
					price: values.price,
					clientPayment: values.clientPayment,
				};

				if (isEditMode && id) {
					// Update existing payment
					await paymentService.update({
						_id: id,
						...paymentData,
					});
					message.success(t("payments.update.success"));
				} else {
					// Create new payment
					await paymentService.create(paymentData);
					message.success(t("payments.create.success"));
				}

				// Invalidate payments cache to refresh the list
				queryClient.invalidateQueries(queryKeys.PAYMENTS);

				// Navigate back to payments list
				navigate("/payments");
			} catch (err) {
				console.error("Error saving payment:", err);
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

	// Loading state while fetching payment data
	if (fetchingPayment) {
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
								? t("payments.edit.title")
								: t("payments.add.title")}
						</Title>
						<p className='text-muted-foreground'>
							{isEditMode
								? t("payments.edit.subtitle")
								: t("payments.add.subtitle")}
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
						{/* Description */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.description.label")}
								name='description'
								rules={[
									{
										required: true,
										message: t("payments.form.description.required"),
									},
									{
										min: 2,
										message: t("payments.form.description.minLength"),
									},
								]}
							>
								<TextArea
									placeholder={t("payments.form.description.placeholder")}
									rows={3}
								/>
							</Form.Item>
						</Col>

						{/* Payment Type */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.type.label")}
								name='type'
								rules={[
									{
										required: true,
										message: t("payments.form.type.required"),
									},
								]}
							>
								<Select placeholder={t("payments.form.type.placeholder")}>
									<Select.Option value={PAYMENT_TYPE.CASH}>
										{t("payments.type.cash")}
									</Select.Option>
									<Select.Option value={PAYMENT_TYPE.CHECK}>
										{t("payments.type.check")}
									</Select.Option>
									<Select.Option value={PAYMENT_TYPE.BANK_TRANSFER}>
										{t("payments.type.bank_transfer")}
									</Select.Option>
								</Select>
							</Form.Item>
						</Col>

						{/* Price */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.price.label")}
								name='price'
								rules={[
									{
										required: true,
										message: t("payments.form.price.required"),
									},
									{
										type: "number",
										min: 0,
										message: t("payments.form.price.min"),
									},
								]}
							>
								<Input
									type='number'
									placeholder={t("payments.form.price.placeholder")}
									min={0}
									step='0.01'
								/>
							</Form.Item>
						</Col>

						{/* Client Payment */}
						<Col xs={24} lg={12}>
							<Form.Item
								label={t("payments.form.clientPayment.label")}
								name='clientPayment'
								rules={[
									{
										required: true,
										message: t("payments.form.clientPayment.required"),
									},
								]}
							>
								<Select
									placeholder={t("payments.form.clientPayment.placeholder")}
									loading={isLoadingClientPayments}
									showSearch
									filterOption={(input, option) => {
										const title = clientPayments.find((cp) => cp._id === option?.value)?.title || "";
										const clientName = clientPayments.find((cp) => cp._id === option?.value)?.client.fullName || "";
										const searchText = `${title} ${clientName}`.toLowerCase();
										return searchText.includes(input.toLowerCase());
									}}
									disabled={isLoadingClientPayments}
								>
									{clientPayments.map((cp) => (
										<Select.Option key={cp._id} value={cp._id}>
											{cp.title} - {cp.client.fullName}
										</Select.Option>
									))}
								</Select>
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
