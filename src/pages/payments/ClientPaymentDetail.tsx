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
	Descriptions,
	Table,
	Tag,
	Form,
	Input,
	Select,
	InputNumber,
	Progress,
} from "antd";
import {
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
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
import type { ColumnsType } from "antd/es/table";
import { PaymentItemResponseType } from "../../models/payment";

const { Title } = Typography;
const { confirm } = Modal;

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
					message.success(t("payments.delete.success", { title: clientPayment.title }));
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

	// Payment table columns
	const paymentColumns: ColumnsType<PaymentItemResponseType> = [
		{
			title: t("payments.table.description"),
			dataIndex: "description",
			key: "description",
		},
		{
			title: t("payments.table.type"),
			dataIndex: "type",
			key: "type",
			render: (type: PAYMENT_TYPE) => {
				const colorMap = {
					[PAYMENT_TYPE.CASH]: "green",
					[PAYMENT_TYPE.CHECK]: "blue",
					[PAYMENT_TYPE.BANK_TRANSFER]: "purple",
				};
				return <Tag color={colorMap[type]}>{t(`payments.type.${type.toLowerCase()}`)}</Tag>;
			},
		},
		{
			title: t("payments.table.price"),
			dataIndex: "price",
			key: "price",
			render: (price: number) => (
				<span className="font-medium text-green-600">{price.toLocaleString()} TND</span>
			),
		},
		{
			title: t("payments.table.createdAt"),
			dataIndex: "createdAt",
			key: "createdAt",
			render: (createdAt: string) => moment(createdAt).format("DD/MM/YYYY HH:mm"),
		},
		{
			title: t("common.table.actions"),
			key: "actions",
			width: 100,
			render: (_: unknown, record: PaymentItemResponseType) => (
				<Button
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={() => handleDeletePayment(record._id, record.description)}
				/>
			),
		},
	];

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
						onClick={() => navigate("/payments")}
						className='hover:bg-muted'
					/>
					<div>
						<Title level={2} className='!mb-2 text-card-foreground'>
							{clientPayment.title}
						</Title>
						<p className='text-muted-foreground'>
							{t("payments.detail.subtitle")}
						</p>
					</div>
				</div>
				<Space>
					<Button
						icon={<EditOutlined />}
						onClick={() => navigate(`/payments/${id}/edit`)}
					>
						{t("ui.edit")}
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={handleDelete}
					>
						{t("ui.delete")}
					</Button>
				</Space>
			</div>

			{/* Client Payment Information */}
			<Card className='border-border' title={t("payments.detail.information")}>
				<Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
					<Descriptions.Item label={t("payments.detail.title")}>
						<strong>{clientPayment.title}</strong>
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.client")}>
						{clientPayment.client.fullName}
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.createdAt")}>
						{moment(clientPayment.createdAt).format("DD/MM/YYYY HH:mm")}
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.description")} span={3}>
						{clientPayment.description || t("common.noData")}
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.targetPrice")}>
						<span className="text-blue-600 font-bold">{clientPayment.targetPrice.toLocaleString()} TND</span>
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.total")}>
						<span className="text-green-600 font-bold">{clientPayment.total.toLocaleString()} TND</span>
					</Descriptions.Item>
					<Descriptions.Item label={t("payments.detail.progress")}>
						<Progress percent={Number(percentage.toFixed(1))} status={percentage >= 100 ? "success" : "active"} />
					</Descriptions.Item>
				</Descriptions>
			</Card>

			{/* Payments List */}
			<Card
				className='border-border'
				title={t("payments.detail.paymentsList")}
				extra={
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={handleAddPayment}
					>
						{t("payments.add.button")}
					</Button>
				}
			>
				<Table
					columns={paymentColumns}
					dataSource={clientPayment.payments}
					rowKey='_id'
					pagination={false}
					locale={{
						emptyText: t("payments.empty"),
					}}
				/>
			</Card>

			{/* Add Payment Modal */}
			<Modal
				title={t("payments.add.title")}
				open={isAddPaymentModalVisible}
				onCancel={() => setIsAddPaymentModalVisible(false)}
				footer={null}
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
						<Select placeholder={t("payments.form.type.placeholder")}>
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
							min={0}
							step={10}
							placeholder={t("payments.form.price.placeholder")}
							addonAfter="TND"
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
