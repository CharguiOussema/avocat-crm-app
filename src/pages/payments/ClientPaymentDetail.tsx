/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/29/2025
 */

import React, { useCallback, useState } from "react";
import {
	Typography,
	Card,
	Button,
	Space,
	Alert,
	Spin,
	Modal,
	message,
	Form,
	Input,
	Select,
	InputNumber,
	Progress,
	Tag,
	Row,
	Col,
	Tooltip,
} from "antd";
import {
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	DollarOutlined,
	CalendarOutlined,
	FileTextOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useFetchClientPaymentById } from "../../hooks/useFetchClientPaymentById";
import { clientPaymentService } from "../../services/ClientPaymentService";
import { paymentService } from "../../services/PaymentService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import moment from "moment";
import { PAYMENT_TYPE } from "../../models/consts";
import { PaymentItemResponseType } from "../../models/payment";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const formatDate = (dateString: string): string => {
	return moment(dateString).format("DD/MM/YYYY HH:mm");
};

const getPaymentTypeColor = (type: PAYMENT_TYPE): string => {
	switch (type) {
		case PAYMENT_TYPE.CASH:
			return "green";
		case PAYMENT_TYPE.CHECK:
			return "blue";
		case PAYMENT_TYPE.BANK_TRANSFER:
			return "orange";
		default:
			return "default";
	}
};

// Helper component for info items
interface InfoItemProps {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
	return (
		<div className="flex items-start gap-3">
			<div className="flex-shrink-0 text-primary text-lg mt-1">{icon}</div>
			<div className="flex-1 min-w-0">
				<Text type="secondary" className="text-xs block mb-1">
					{label}
				</Text>
				<Text strong className="text-sm break-words block">
					{value}
				</Text>
			</div>
		</div>
	);
};

export const ClientPaymentDetail: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();
	const [form] = Form.useForm();

	const [isAddPaymentModalVisible, setIsAddPaymentModalVisible] = useState(false);
	const [isAddingPayment, setIsAddingPayment] = useState(false);

	const { response } = useFetchClientPaymentById(id);
	const { data, error, isLoading } = response;

	const clientPayment = data?.data;

	// Handle delete client payment
	const handleDelete = useCallback(() => {
		if (!clientPayment) return;

		confirm({
			title: t("payments.deleteClientPayment.title"),
			icon: <DeleteOutlined />,
			content: t("payments.deleteClientPayment.confirm", { title: clientPayment.title }),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await clientPaymentService.delete(clientPayment._id);
					message.success(t("payments.deleteClientPayment.success", { title: clientPayment.title }));
					queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);
					navigate("/payments");
				} catch (error) {
					logError(error, "Error deleting client payment");
					message.error(t("clientPayments.delete.error"));
				}
			},
		});
	}, [clientPayment, t, queryClient, navigate]);

	// Handle delete payment
	const handleDeletePayment = useCallback(
		(paymentId: string, description: string) => {
			confirm({
				title: t("payments.delete.title"),
				icon: <DeleteOutlined />,
				content: t("payments.delete.confirm", { description }),
				okText: t("ui.delete"),
				okType: "danger",
				cancelText: t("ui.cancel"),
				onOk: async () => {
					try {
						await paymentService.delete(paymentId);
						message.success(t("payments.delete.success", { description }));
						queryClient.invalidateQueries([queryKeys.CLIENT_PAYMENT_DETAILS, id]);
						queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);
					} catch (error) {
						logError(error, "Error deleting payment");
						message.error(t("payments.delete.error"));
					}
				},
			});
		},
		[t, queryClient, id]
	);

	// Handle add payment
	const handleAddPayment = useCallback(() => {
		setIsAddPaymentModalVisible(true);
		form.resetFields();
	}, [form]);

	// Handle submit new payment
	const handleSubmitPayment = useCallback(
		async (values: { description: string; type: PAYMENT_TYPE; price: number }) => {
			if (!id) return;

			setIsAddingPayment(true);
			try {
				await paymentService.create({
					description: values.description,
					type: values.type,
					price: values.price,
					clientPayment: id,
				});
				message.success(t("payments.create.success"));
				setIsAddPaymentModalVisible(false);
				form.resetFields();
				queryClient.invalidateQueries([queryKeys.CLIENT_PAYMENT_DETAILS, id]);
				queryClient.invalidateQueries(queryKeys.CLIENT_PAYMENTS);
			} catch (error) {
				logError(error, "Error creating payment");
				message.error(t("payments.create.error"));
			} finally {
				setIsAddingPayment(false);
			}
		},
		[id, t, queryClient, form]
	);

	// Loading state
	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<Spin size='large' />
			</div>
		);
	}

	// Error state
	if (error || !clientPayment) {
		return (
			<Alert
				message={t("payments.error.title")}
				description={error ? getErrorMessage(error) : t("payments.error.notFound")}
				type='error'
				showIcon
				className='m-4'
			/>
		);
	}

	const percentage = clientPayment.targetPrice > 0
		? Math.min((clientPayment.total / clientPayment.targetPrice) * 100, 100)
		: 0;

	return (
		<div className='space-y-6 pb-8'>
			{/* Header */}
			<div
				className={cn(
					"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
					isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
				)}
			>
				<div className={cn("flex items-center gap-3 sm:gap-4", isRTL ? "flex-row-reverse" : "flex-row")}>
					<Tooltip title={t("payments.detail.backTooltip")}>
						<Button
							icon={<ArrowLeftOutlined />}
							onClick={() => navigate("/payments")}
							className='hover:bg-muted flex-shrink-0'
						/>
					</Tooltip>
					<div className="min-w-0">
						<Title level={2} className='!mb-1 text-card-foreground truncate'>
							{clientPayment.title}
						</Title>
						<p className='text-muted-foreground text-sm'>{t("payments.detail.subtitle")}</p>
					</div>
				</div>
				<Space wrap className="w-full sm:w-auto">
					<Tooltip title={t("payments.card.editTooltip")}>
						<Button
							icon={<EditOutlined />}
							onClick={() => navigate(`/payments/${id}/edit`)}
							className="flex-1 sm:flex-none"
						>
							{t("ui.edit")}
						</Button>
					</Tooltip>
					<Tooltip title={t("payments.card.deleteTooltip")}>
						<Button
							danger
							icon={<DeleteOutlined />}
							onClick={handleDelete}
							className="flex-1 sm:flex-none"
						>
							{t("ui.delete")}
						</Button>
					</Tooltip>
				</Space>
			</div>

			{/* Summary Cards */}
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={8}>
					<Card className='border-border h-full'>
						<div className='text-center'>
							<DollarOutlined className='text-4xl text-blue-600 mb-2' />
							<Text type='secondary' className='block text-sm mb-1'>
								{t("payments.detail.targetPrice")}
							</Text>
							<Title level={3} className='!mb-0 text-blue-600'>
								{clientPayment.targetPrice.toLocaleString()} {t("payments.currency")}
							</Title>
						</div>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={8}>
					<Card className='border-border h-full'>
						<div className='text-center'>
							<DollarOutlined className='text-4xl text-green-600 mb-2' />
							<Text type='secondary' className='block text-sm mb-1'>
								{t("payments.detail.total")}
							</Text>
							<Title level={3} className='!mb-0 text-green-600'>
								{clientPayment.total.toLocaleString()} {t("payments.currency")}
							</Title>
						</div>
					</Card>
				</Col>
				<Col xs={24} sm={24} lg={8}>
					<Card className='border-border h-full'>
						<div className='text-center'>
							<Text type='secondary' className='block text-sm mb-3'>
								{t("payments.detail.progress")}
							</Text>
							<Progress
								type='circle'
								percent={Number(percentage.toFixed(1))}
								status={percentage >= 100 ? "success" : "active"}
								width={100}
							/>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Client Payment Information */}
			<Card className='border-border'>
				<Title level={4} className='!mb-4 text-card-foreground'>
					{t("payments.detail.information")}
				</Title>
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} lg={8}>
						<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
							<InfoItem
								icon={<FileTextOutlined />}
								label={t("payments.detail.title")}
								value={clientPayment.title}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={8}>
						<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
							<InfoItem
								icon={<UserOutlined />}
								label={t("payments.detail.client")}
								value={clientPayment.client.fullName}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={8}>
						<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
							<InfoItem
								icon={<CalendarOutlined />}
								label={t("payments.detail.createdAt")}
								value={formatDate(clientPayment.createdAt)}
							/>
						</Card>
					</Col>
					{clientPayment.description && (
						<Col xs={24} sm={12} lg={8}>
							<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
								<InfoItem
									icon={<FileTextOutlined />}
									label={t("payments.detail.description")}
									value={clientPayment.description}
								/>
							</Card>
						</Col>
					)}
					{clientPayment.createdBy && (
						<Col xs={24} sm={12} lg={8}>
							<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
								<InfoItem
									icon={<UserOutlined />}
									label={t("payments.detail.createdBy")}
									value={clientPayment.createdBy.fullName}
								/>
							</Card>
						</Col>
					)}
					<Col xs={24} sm={12} lg={8}>
						<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
							<InfoItem
								icon={<CalendarOutlined />}
								label={t("payments.detail.updatedAt")}
								value={formatDate(clientPayment.updatedAt)}
							/>
						</Card>
					</Col>
				</Row>
			</Card>

			{/* Payments List */}
			<Card className='border-border'>
				<div
					className={cn(
						"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4",
						isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
					)}
				>
					<Title level={4} className='!mb-0 text-card-foreground'>
						{t("payments.detail.paymentsList")} ({clientPayment.payments.length})
					</Title>
					<Tooltip title={t("payments.add.subtitle")}>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleAddPayment}
						>
							{t("payments.add.button")}
						</Button>
					</Tooltip>
				</div>

				{clientPayment.payments.length === 0 ? (
					<div className='text-center py-12'>
						<div className='text-6xl mb-4 text-muted-foreground'>💰</div>
						<Title level={5} className="!mb-2 text-card-foreground">
							{t("payments.detail.emptyPayments")}
						</Title>
						<Text type='secondary'>{t("payments.detail.emptyPaymentsDescription")}</Text>
					</div>
				) : (
					<Row gutter={[16, 16]} className='mt-4'>
						{clientPayment.payments.map((payment: PaymentItemResponseType) => (
							<Col xs={24} sm={12} lg={8} key={payment._id}>
								<Card
									className='border-border hover:shadow-lg transition-all duration-200 h-full'
									styles={{ body: { padding: "16px" } }}
								>
									<div className='space-y-3'>
										{/* Payment Type Tag */}
										<div className={cn("flex justify-between items-start", isRTL ? "flex-row-reverse" : "flex-row")}>
											<Tag color={getPaymentTypeColor(payment.type)} className='mb-2'>
												{t(`payments.type.${payment.type}`)}
											</Tag>
											<Tooltip title={t("payments.delete.title")}>
												<Button
													type="text"
													danger
													size='small'
													icon={<DeleteOutlined />}
													onClick={() => handleDeletePayment(payment._id, payment.description)}
												/>
											</Tooltip>
										</div>

										{/* Description */}
										<div>
											<Text type='secondary' className='text-xs block mb-1'>
												<FileTextOutlined className='mr-1' />
												{t("payments.form.description.label")}
											</Text>
											<Paragraph
												className='!mb-0 text-sm'
												ellipsis={{ rows: 2, tooltip: true }}
											>
												{payment.description}
											</Paragraph>
										</div>

										{/* Price */}
										<div>
											<Text type='secondary' className='text-xs block mb-1'>
												<DollarOutlined className='mr-1' />
												{t("payments.form.price.label")}
											</Text>
											<Text className='text-lg font-bold text-green-600'>
												{payment.price.toLocaleString()} {t("payments.currency")}
											</Text>
										</div>

										{/* Created Date */}
										<div>
											<Text type='secondary' className='text-xs block mb-1'>
												<CalendarOutlined className='mr-1' />
												{t("payments.table.createdAt")}
											</Text>
											<Text className='text-xs'>
												{formatDate(payment.createdAt)}
											</Text>
										</div>

										{/* Created By */}
										{payment.createdBy && (
											<div className='pt-2 border-t border-border'>
												<Text type='secondary' className='text-xs'>
													{t("payments.card.createdBy")}: {payment.createdBy.fullName}
												</Text>
											</div>
										)}
									</div>
								</Card>
							</Col>
						))}
					</Row>
				)}
			</Card>

			{/* Add Payment Modal */}
			<Modal
				title={t("payments.add.title")}
				open={isAddPaymentModalVisible}
				onCancel={() => setIsAddPaymentModalVisible(false)}
				footer={null}
				destroyOnClose
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmitPayment}
				>
					<Form.Item
						label={t("payments.form.description.label")}
						name="description"
						rules={[
							{ required: true, message: t("payments.form.description.required") },
							{ min: 2, message: t("payments.form.description.minLength") },
						]}
					>
						<Input.TextArea rows={3} placeholder={t("payments.form.description.placeholder")} />
					</Form.Item>

					<Form.Item
						label={t("payments.form.type.label")}
						name="type"
						rules={[{ required: true, message: t("payments.form.type.required") }]}
					>
						<Select placeholder={t("payments.form.type.placeholder")} size='large'>
							<Select.Option value={PAYMENT_TYPE.CASH}>{t("payments.type.cash")}</Select.Option>
							<Select.Option value={PAYMENT_TYPE.CHECK}>{t("payments.type.check")}</Select.Option>
							<Select.Option value={PAYMENT_TYPE.BANK_TRANSFER}>{t("payments.type.bank_transfer")}</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item
						label={t("payments.form.price.label")}
						name="price"
						rules={[
							{ required: true, message: t("payments.form.price.required") },
							{ type: "number", min: 0, message: t("payments.form.price.min") },
						]}
					>
						<InputNumber
							className="w-full"
							size='large'
							min={0}
							step={10}
							placeholder={t("payments.form.price.placeholder")}
							addonAfter={t("payments.currency")}
						/>
					</Form.Item>

					<Form.Item className="mb-0 flex justify-end">
						<Space>
							<Button onClick={() => setIsAddPaymentModalVisible(false)}>
								{t("ui.cancel")}
							</Button>
							<Button type="primary" htmlType="submit" loading={isAddingPayment}>
								{t("ui.create")}
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
