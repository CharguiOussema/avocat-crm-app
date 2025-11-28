/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/27/2025
 */

import React, { useCallback, useMemo } from "react";
import {
	Typography,
	Card,
	Button,
	Space,
	Alert,
	Spin,
	Row,
	Col,
	Statistic,
	Avatar,
	Progress,
	Empty,
	Badge,
	Tag,
} from "antd";
import {
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
	MailOutlined,
	PhoneOutlined,
	EnvironmentOutlined,
	IdcardOutlined,
	UserOutlined,
	DollarOutlined,
	FileTextOutlined,
	CalendarOutlined,
	AuditOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	SyncOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useFetchClientById } from "../../hooks/useFetchClientById";
import { useFetchClientPaymentsByClient } from "../../hooks/useFetchClientPaymentsByClient";
import { useFetchLawsuitsByClient } from "../../hooks/useFetchLawsuitsByClient";
import { clientService } from "../../services/ClientService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { cn } from "../../utils/cn";
import { getErrorMessage, logError } from "../../utils/errorHandling";
import { Modal, message } from "antd";
import moment from "moment";
import { ClientPaymentItemResponseType } from "../../models/clientPayment";
import { LawsuitItemResponseType } from "../../models/lawsuit";
import { LAWSUIT_STATUS } from "../../models/consts";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const formatDate = (dateString: string): string => {
	return moment(dateString).format("DD MMM YYYY");
};

const formatDateTime = (dateString: string): string => {
	return moment(dateString).format("DD MMM YYYY HH:mm");
};

// Helper component for info items
interface InfoItemProps {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	href?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, href }) => {
	const content = (
		<div className="flex items-start gap-3">
			<div className="flex-shrink-0 text-primary text-lg mt-1">{icon}</div>
			<div className="flex-1 min-w-0">
				<Text type="secondary" className="text-xs block mb-1">
					{label}
				</Text>
				{href ? (
					<a href={href} className="text-card-foreground hover:text-primary transition-colors">
						<Text strong className="text-sm break-words">
							{value}
						</Text>
					</a>
				) : (
					<Text strong className="text-sm break-words block">
						{value}
					</Text>
				)}
			</div>
		</div>
	);

	return content;
};

// Helper function to get lawsuit status config
const getLawsuitStatusConfig = (status: LAWSUIT_STATUS, t: (key: string) => string) => {
	switch (status) {
		case LAWSUIT_STATUS.DONE:
			return {
				color: "success",
				icon: <CheckCircleOutlined />,
				label: t("lawsuits.status.done"),
			};
		case LAWSUIT_STATUS.INPROGRESS:
			return {
				color: "processing",
				icon: <SyncOutlined spin />,
				label: t("lawsuits.status.inprogress"),
			};
		case LAWSUIT_STATUS.SCHEDULED:
			return {
				color: "default",
				icon: <ClockCircleOutlined />,
				label: t("lawsuits.status.scheduled"),
			};
		case LAWSUIT_STATUS.CANCELLED:
			return {
				color: "error",
				icon: <CloseCircleOutlined />,
				label: t("lawsuits.status.cancelled"),
			};
		default:
			return {
				color: "default",
				icon: <ClockCircleOutlined />,
				label: status,
			};
	}
};

export const ClientDetails: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = useParams<{ id: string }>();

	const { response: clientResponse } = useFetchClientById(id);
	const { data: clientData, error: clientError, isLoading: isClientLoading } = clientResponse;

	const { response: paymentsResponse } = useFetchClientPaymentsByClient(id);
	const { data: paymentsData, isLoading: isPaymentsLoading } = paymentsResponse;

	const { response: lawsuitsResponse } = useFetchLawsuitsByClient(id);
	const { data: lawsuitsData, isLoading: isLawsuitsLoading } = lawsuitsResponse;

	const client = clientData?.data;

	// Memoize arrays to prevent unnecessary re-renders
	const clientPayments = useMemo(() => paymentsData?.data?.docs || [], [paymentsData?.data?.docs]);
	const lawsuits = useMemo(() => lawsuitsData?.data?.docs || [], [lawsuitsData?.data?.docs]);

	// Calculate payment statistics
	const paymentStats = useMemo(() => {
		const totalTarget = clientPayments.reduce((sum, cp) => sum + cp.targetPrice, 0);
		const totalPaid = clientPayments.reduce((sum, cp) => sum + cp.total, 0);
		const totalPayments = clientPayments.length;
		const completionRate = totalTarget > 0 ? (totalPaid / totalTarget) * 100 : 0;

		return {
			totalTarget,
			totalPaid,
			totalPayments,
			completionRate,
			remaining: totalTarget - totalPaid,
		};
	}, [clientPayments]);

	// Calculate lawsuit statistics
	const lawsuitStats = useMemo(() => {
		const total = lawsuits.length;
		const done = lawsuits.filter((l) => l.status === LAWSUIT_STATUS.DONE).length;
		const inProgress = lawsuits.filter((l) => l.status === LAWSUIT_STATUS.INPROGRESS).length;
		const scheduled = lawsuits.filter((l) => l.status === LAWSUIT_STATUS.SCHEDULED).length;
		const cancelled = lawsuits.filter((l) => l.status === LAWSUIT_STATUS.CANCELLED).length;

		return { total, done, inProgress, scheduled, cancelled };
	}, [lawsuits]);

	// Handle client deletion
	const handleDelete = useCallback(() => {
		if (!client) return;

		confirm({
			title: t("clients.delete.title"),
			icon: <DeleteOutlined />,
			content: t("clients.delete.confirm", { name: client.fullName }),
			okText: t("ui.delete"),
			okType: "danger",
			cancelText: t("ui.cancel"),
			onOk: async () => {
				try {
					await clientService.delete(client._id);
					message.success(t("clients.delete.success", { name: client.fullName }));
					queryClient.invalidateQueries(queryKeys.CLIENTS);
					navigate("/clients");
				} catch (error) {
					logError(error, "Error deleting client");
					message.error(t("clients.delete.error"));
				}
			},
		});
	}, [client, t, queryClient, navigate]);

	// Handle navigate to payment detail
	const handleNavigateToPayment = useCallback(
		(paymentId: string) => {
			navigate(`/payments/${paymentId}`);
		},
		[navigate]
	);

	// Handle navigate to lawsuit detail
	const handleNavigateToLawsuit = useCallback(
		(lawsuitId: string) => {
			navigate(`/lawsuits/${lawsuitId}/edit`);
		},
		[navigate]
	);

	// Loading state
	if (isClientLoading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	// Error state
	if (clientError || !client) {
		return (
			<Alert
				message={t("clients.error.title")}
				description={clientError ? getErrorMessage(clientError) : t("clients.error.notFound")}
				type="error"
				showIcon
				className="m-4"
			/>
		);
	}

	return (
		<div className="space-y-6 pb-8">
			{/* Header */}
			<div
				className={cn(
					"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
					isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
				)}
			>
				<div className={cn("flex items-center gap-3 sm:gap-4", isRTL ? "flex-row-reverse" : "flex-row")}>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate("/clients")}
						className="hover:bg-muted flex-shrink-0"
					/>
					<div className="min-w-0">
						<Title level={2} className="!mb-1 text-card-foreground truncate">
							{client.fullName}
						</Title>
						<p className="text-muted-foreground text-sm">{t("clients.details.subtitle")}</p>
					</div>
				</div>
				<Space wrap className="w-full sm:w-auto">
					<Button
						icon={<EditOutlined />}
						onClick={() => navigate(`/clients/${id}/edit`)}
						className="flex-1 sm:flex-none"
					>
						{t("ui.edit")}
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={handleDelete}
						className="flex-1 sm:flex-none"
					>
						{t("ui.delete")}
					</Button>
				</Space>
			</div>

			{/* Client Profile Card */}
			<Card className="border-border">
				<Row gutter={[24, 24]}>
					{/* Avatar Section */}
					<Col xs={24} md={8} lg={6}>
						<div className="flex flex-col items-center text-center space-y-4">
							<Avatar
								size={{ xs: 100, sm: 120, md: 140 }}
								src={client.avatar ? `/api/files/serve/client-avatar/${client._id}` : undefined}
								icon={!client.avatar ? <UserOutlined /> : undefined}
								className="bg-primary/10 text-primary shadow-md"
							>
								{!client.avatar && client.fullName?.charAt(0).toUpperCase()}
							</Avatar>
							<div className="w-full">
								<Title level={3} className="!mb-1 text-card-foreground">
									{client.fullName}
								</Title>
								<Text type="secondary" className="text-sm">
									{t("clients.details.clientSince")} {formatDate(client.createdAt)}
								</Text>
							</div>
						</div>
					</Col>

					{/* Contact Information Section */}
					<Col xs={24} md={16} lg={18}>
						<Title level={4} className="!mb-4 text-card-foreground">
							{t("clients.details.contactInformation")}
						</Title>
						<Row gutter={[16, 16]}>
							{client.email && (
								<Col xs={24} sm={12} lg={8}>
									<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
										<InfoItem
											icon={<MailOutlined />}
											label={t("clients.details.email")}
											value={client.email}
											href={`mailto:${client.email}`}
										/>
									</Card>
								</Col>
							)}
							{client.phoneNumber && (
								<Col xs={24} sm={12} lg={8}>
									<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
										<InfoItem
											icon={<PhoneOutlined />}
											label={t("clients.details.phone")}
											value={client.phoneNumber}
											href={`tel:${client.phoneNumber}`}
										/>
									</Card>
								</Col>
							)}
							{client.cin && (
								<Col xs={24} sm={12} lg={8}>
									<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
										<InfoItem
											icon={<IdcardOutlined />}
											label={t("clients.details.cin")}
											value={client.cin}
										/>
									</Card>
								</Col>
							)}
							{client.location && (
								<Col xs={24} sm={12} lg={8}>
									<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
										<InfoItem
											icon={<EnvironmentOutlined />}
											label={t("clients.details.location")}
											value={client.location}
										/>
									</Card>
								</Col>
							)}
							<Col xs={24} sm={12} lg={8}>
								<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
									<InfoItem
										icon={<CalendarOutlined />}
										label={t("clients.details.createdAt")}
										value={formatDateTime(client.createdAt)}
									/>
								</Card>
							</Col>
							<Col xs={24} sm={12} lg={8}>
								<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
									<InfoItem
										icon={<CalendarOutlined />}
										label={t("clients.details.updatedAt")}
										value={formatDateTime(client.updatedAt)}
									/>
								</Card>
							</Col>
							{client.createdBy && (
								<Col xs={24} sm={12} lg={8}>
									<Card size="small" className="h-full border-border/50 hover:border-primary/50 transition-colors">
										<InfoItem
											icon={<UserOutlined />}
											label={t("clients.details.createdBy")}
											value={client.createdBy.fullName}
										/>
									</Card>
								</Col>
							)}
						</Row>
					</Col>
				</Row>
			</Card>

			{/* Statistics Row */}
			<Row gutter={[16, 16]}>
				{/* Payment Statistics */}
				<Col xs={24} lg={12}>
					<Card className="border-border h-full" title={t("clients.details.paymentStatistics")}>
						<Row gutter={[16, 16]}>
							<Col xs={12} sm={6} lg={12}>
								<Statistic
									title={t("clients.details.totalPayments")}
									value={paymentStats.totalPayments}
									prefix={<FileTextOutlined />}
									valueStyle={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
								/>
							</Col>
							<Col xs={12} sm={6} lg={12}>
								<Statistic
									title={t("clients.details.targetAmount")}
									value={paymentStats.totalTarget}
									suffix={t("clients.details.currency")}
									prefix={<DollarOutlined />}
									valueStyle={{ color: "#1890ff", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
								/>
							</Col>
							<Col xs={12} sm={6} lg={12}>
								<Statistic
									title={t("clients.details.paidAmount")}
									value={paymentStats.totalPaid}
									suffix={t("clients.details.currency")}
									prefix={<DollarOutlined />}
									valueStyle={{ color: "#52c41a", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
								/>
							</Col>
							<Col xs={12} sm={6} lg={12}>
								<Statistic
									title={t("clients.details.remainingAmount")}
									value={paymentStats.remaining}
									suffix={t("clients.details.currency")}
									prefix={<DollarOutlined />}
									valueStyle={{
										color: paymentStats.remaining > 0 ? "#faad14" : "#52c41a",
										fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
									}}
								/>
							</Col>
						</Row>
						{paymentStats.totalTarget > 0 && (
							<div className="mt-6">
								<div className="flex items-center justify-between mb-2">
									<Text strong className="text-sm">{t("clients.details.paymentProgress")}</Text>
									<Text type="secondary" className="text-sm">{paymentStats.completionRate.toFixed(1)}%</Text>
								</div>
								<Progress
									percent={Number(paymentStats.completionRate.toFixed(1))}
									status={paymentStats.completionRate >= 100 ? "success" : "active"}
									strokeColor={{
										"0%": "#108ee9",
										"100%": "#52c41a",
									}}
								/>
							</div>
						)}
					</Card>
				</Col>

				{/* Lawsuit Statistics */}
				<Col xs={24} lg={12}>
					<Card className="border-border h-full" title={t("clients.details.lawsuitStatistics")}>
						{isLawsuitsLoading ? (
							<div className="flex justify-center items-center h-[200px]">
								<Spin />
							</div>
						) : (
							<>
								<Row gutter={[16, 16]}>
									<Col xs={12} sm={6} lg={12}>
										<Statistic
											title={t("clients.details.totalLawsuits")}
											value={lawsuitStats.total}
											prefix={<AuditOutlined />}
											valueStyle={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
										/>
									</Col>
									<Col xs={12} sm={6} lg={12}>
										<Statistic
											title={t("clients.details.completedLawsuits")}
											value={lawsuitStats.done}
											prefix={<CheckCircleOutlined />}
											valueStyle={{ color: "#52c41a", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
										/>
									</Col>
									<Col xs={12} sm={6} lg={12}>
										<Statistic
											title={t("clients.details.inProgressLawsuits")}
											value={lawsuitStats.inProgress}
											prefix={<SyncOutlined />}
											valueStyle={{ color: "#1890ff", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
										/>
									</Col>
									<Col xs={12} sm={6} lg={12}>
										<Statistic
											title={t("clients.details.scheduledLawsuits")}
											value={lawsuitStats.scheduled}
											prefix={<ClockCircleOutlined />}
											valueStyle={{ color: "#faad14", fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}
										/>
									</Col>
								</Row>
								{lawsuitStats.cancelled > 0 && (
									<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
										<Text type="secondary" className="text-sm">
											<CloseCircleOutlined className="mr-2 text-red-500" />
											{lawsuitStats.cancelled} {t("clients.details.cancelledLawsuits")}
										</Text>
									</div>
								)}
							</>
						)}
					</Card>
				</Col>
			</Row>

			{/* Lawsuits List */}
			<Card
				className="border-border"
				title={
					<div className="flex items-center justify-between flex-wrap gap-2">
						<span>{t("clients.details.lawsuits")}</span>
						{lawsuits.length > 0 && (
							<Badge count={lawsuits.length} showZero overflowCount={999} />
						)}
					</div>
				}
				extra={
					<Button
						type="default"
						icon={<AuditOutlined />}
						onClick={() => navigate("/lawsuits")}
						size="small"
					>
						{t("clients.details.viewAllLawsuits")}
					</Button>
				}
			>
				{isLawsuitsLoading ? (
					<div className="flex justify-center items-center min-h-[200px]">
						<Spin size="large" />
					</div>
				) : lawsuits.length === 0 ? (
					<Empty
						description={t("clients.details.noLawsuits")}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<Row gutter={[16, 16]}>
						{lawsuits.map((lawsuit: LawsuitItemResponseType) => {
							const statusConfig = getLawsuitStatusConfig(lawsuit.status, t);

							return (
								<Col xs={24} sm={12} lg={8} xl={6} key={lawsuit._id}>
									<Card
										hoverable
										className="h-full border-border transition-all duration-200 hover:shadow-lg cursor-pointer"
										onClick={() => handleNavigateToLawsuit(lawsuit._id)}
									>
										<div className="space-y-3">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<Title level={5} className="!mb-1 text-card-foreground truncate">
														{lawsuit.lawsuitCode}
													</Title>
													<Tag color={statusConfig.color} icon={statusConfig.icon} className="mt-1">
														{statusConfig.label}
													</Tag>
												</div>
											</div>

											{lawsuit.description && (
												<Paragraph
													ellipsis={{ rows: 2, tooltip: true }}
													className="!mb-0 text-sm text-muted-foreground"
												>
													{lawsuit.description}
												</Paragraph>
											)}

											<div className="space-y-2 pt-2 border-t border-border">
												{lawsuit.lawsuitType && typeof lawsuit.lawsuitType === 'object' && (
													<div className="flex items-center justify-between text-xs">
														<Text type="secondary">{t("clients.details.lawsuitType")}</Text>
														<Text strong className="text-right truncate ml-2">
															{(lawsuit.lawsuitType as { name: string }).name}
														</Text>
													</div>
												)}
												{lawsuit.lawsuitStage && typeof lawsuit.lawsuitStage === 'object' && (
													<div className="flex items-center justify-between text-xs">
														<Text type="secondary">{t("clients.details.lawsuitStage")}</Text>
														<Text strong className="text-right truncate ml-2">
															{(lawsuit.lawsuitStage as { name: string }).name}
														</Text>
													</div>
												)}
												{lawsuit.court && typeof lawsuit.court === 'object' && (
													<div className="flex items-center justify-between text-xs">
														<Text type="secondary">{t("clients.details.court")}</Text>
														<Text strong className="text-right truncate ml-2">
															{(lawsuit.court as { name: string }).name}
														</Text>
													</div>
												)}
												<div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
													<Text type="secondary">{t("clients.details.createdAt")}</Text>
													<Text type="secondary">{formatDate(lawsuit.createdAt)}</Text>
												</div>
											</div>
										</div>
									</Card>
								</Col>
							);
						})}
					</Row>
				)}
			</Card>

			{/* Client Payments List */}
			<Card
				className="border-border"
				title={
					<div className="flex items-center justify-between flex-wrap gap-2">
						<span>{t("clients.details.clientPayments")}</span>
						{clientPayments.length > 0 && (
							<Badge count={clientPayments.length} showZero overflowCount={999} />
						)}
					</div>
				}
				extra={
					<Button
						type="primary"
						icon={<FileTextOutlined />}
						onClick={() => navigate("/payments")}
						size="small"
					>
						{t("clients.details.viewAllPayments")}
					</Button>
				}
			>
				{isPaymentsLoading ? (
					<div className="flex justify-center items-center min-h-[200px]">
						<Spin size="large" />
					</div>
				) : clientPayments.length === 0 ? (
					<Empty
						description={t("clients.details.noPayments")}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<Row gutter={[16, 16]}>
						{clientPayments.map((payment: ClientPaymentItemResponseType) => {
							const progress =
								payment.targetPrice > 0
									? (payment.total / payment.targetPrice) * 100
									: 0;
							const isComplete = progress >= 100;

							return (
								<Col xs={24} sm={12} lg={8} xl={6} key={payment._id}>
									<Card
										hoverable
										className="h-full border-border transition-all duration-200 hover:shadow-lg cursor-pointer"
										onClick={() => handleNavigateToPayment(payment._id)}
									>
										<div className="space-y-3">
											<div>
												<Title level={5} className="!mb-1 text-card-foreground">
													{payment.title}
												</Title>
												{payment.description && (
													<Paragraph
														ellipsis={{ rows: 2, tooltip: true }}
														className="!mb-0 text-sm text-muted-foreground"
													>
														{payment.description}
													</Paragraph>
												)}
											</div>

											<div className="space-y-2">
												<div className="flex justify-between items-center">
													<Text type="secondary" className="text-xs">
														{t("clients.details.targetPrice")}
													</Text>
													<Text strong className="text-blue-600">
														{payment.targetPrice.toLocaleString()} {t("clients.details.currency")}
													</Text>
												</div>
												<div className="flex justify-between items-center">
													<Text type="secondary" className="text-xs">
														{t("clients.details.paidAmount")}
													</Text>
													<Text strong className="text-green-600">
														{payment.total.toLocaleString()} {t("clients.details.currency")}
													</Text>
												</div>
											</div>

											<Progress
												percent={Number(progress.toFixed(1))}
												status={isComplete ? "success" : "active"}
												size="small"
											/>

											<div className="flex justify-between items-center pt-2 border-t border-border">
												<Text type="secondary" className="text-xs">
													{t("clients.details.payments")}: {payment.payments.length}
												</Text>
												<Text type="secondary" className="text-xs">
													{formatDate(payment.createdAt)}
												</Text>
											</div>
										</div>
									</Card>
								</Col>
							);
						})}
					</Row>
				)}
			</Card>
		</div>
	);
};
