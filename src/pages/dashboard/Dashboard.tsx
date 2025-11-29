import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import {
	Row,
	Col,
	Card,
	Statistic,
	List,
	Typography,
	Spin,
	Alert,
	Tag,
	Space,
} from "antd";
import {
	UserOutlined,
	FileTextOutlined,
	DatabaseOutlined,
	DollarOutlined,
	CalendarOutlined,
	TeamOutlined,
	ExclamationCircleOutlined,
	LineChartOutlined,
	RiseOutlined,
} from "@ant-design/icons";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { dashboardService } from "../../services";
import type { DashboardStats } from "../../services/DashboardService";
import { formatStorageSize, formatTND } from "../../utils/format.helpers";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

// Type definition for KPI configuration
interface KpiConfig {
	title: string;
	value: number;
	icon: React.ReactElement;
	color: string;
	valueType: "number" | "currency" | "storage";
}

// Type definition for lawsuit progress data
interface LawsuitProgressData {
	date: string;
	cumulativeCount: number;
	count: number;
	statusCounts: {
		DONE: number;
		INPROGRESS: number;
		SCHEDULED: number;
		CANCELLED: number;
	};
}

export const Dashboard: React.FC = () => {
	const { t } = useTranslation();

	const { data, isLoading, error } = useQuery<DashboardStats>(
		["dashboard-stats"],
		async () => {
			const response = await dashboardService.getStats();
			return response.data;
		},
		{
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000,
		}
	);

	if (isLoading) {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
				<Spin size="large" tip={t("dashboard.loading")} />
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				message={t("dashboard.error.title")}
				description={t("dashboard.error.description")}
				type="error"
				showIcon
			/>
		);
	}

	if (!data) {
		return null;
	}

	const { kpis, upcomingEvents, clientProgress, paymentProgress, lawsuitProgress } = data;

	// KPI Cards configuration
	const kpiConfigs: KpiConfig[] = [
		{
			title: t("dashboard.kpi.totalClients"),
			value: kpis.totalClients,
			icon: <UserOutlined />,
			color: "#1890ff",
			valueType: "number",
		},
		{
			title: t("dashboard.kpi.totalLawsuits"),
			value: kpis.totalLawsuits,
			icon: <FileTextOutlined />,
			color: "#52c41a",
			valueType: "number",
		},
		{
			title: t("dashboard.kpi.totalRevenue"),
			value: kpis.totalRevenue,
			icon: <DollarOutlined />,
			color: "#13c2c2",
			valueType: "currency",
		},
		{
			title: t("dashboard.kpi.moneyNotPaid"),
			value: kpis.unpaidRevenue,
			icon: <ExclamationCircleOutlined />,
			color: "#ff4d4f",
			valueType: "currency",
		},
		{
			title: t("dashboard.kpi.totalStorage"),
			value: kpis.totalStorageBytes,
			icon: <DatabaseOutlined />,
			color: "#722ed1",
			valueType: "storage",
		},
	];

	// Custom tooltip for lawsuit chart
	const CustomLawsuitTooltip = (props: {
		active?: boolean;
		payload?: ReadonlyArray<{ payload: LawsuitProgressData }>;
	}) => {
		const { active, payload } = props;
		if (active && payload && payload.length > 0) {
			const data = payload[0].payload;
			return (
				<Card size="small" className="shadow-md" style={{ minWidth: "200px" }}>
					<Space direction="vertical" size="small">
						<Text strong>{moment(data.date).format("MMM DD, YYYY")}</Text>
						<Text>{t("dashboard.lawsuitProgress.tooltip.total")}: {data.cumulativeCount} {t("dashboard.lawsuitProgress.tooltip.totalLawsuits")}</Text>
						<Text>{t("dashboard.lawsuitProgress.tooltip.new")}: {data.count} {t("dashboard.lawsuitProgress.tooltip.newLawsuits")}</Text>
						<div style={{ marginTop: "8px" }}>
							<Text type="secondary" style={{ fontSize: "12px" }}>{t("dashboard.lawsuitProgress.tooltip.statusBreakdown")}:</Text>
							<div style={{ marginTop: "4px" }}>
								<Tag color="#52c41a">{t("dashboard.lawsuitProgress.tooltip.done")}: {data.statusCounts.DONE}</Tag>
								<Tag color="#1890ff">{t("dashboard.lawsuitProgress.tooltip.inProgress")}: {data.statusCounts.INPROGRESS}</Tag>
								<Tag color="#faad14">{t("dashboard.lawsuitProgress.tooltip.scheduled")}: {data.statusCounts.SCHEDULED}</Tag>
								<Tag color="#ff4d4f">{t("dashboard.lawsuitProgress.tooltip.cancelled")}: {data.statusCounts.CANCELLED}</Tag>
							</div>
						</div>
					</Space>
				</Card>
			);
		}
		return null;
	};

	// Responsive card title component
	const CardTitle: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
		<Space size="small" style={{ flexWrap: "wrap" }}>
			{React.cloneElement(icon as React.ReactElement, { style: { color } })}
			<Text strong style={{ fontSize: "clamp(12px, 3vw, 16px)" }}>
				{title}
			</Text>
		</Space>
	);

	return (
		<div style={{ padding: "0" }}>
			{/* Page Header */}
			<div style={{ marginBottom: "24px" }}>
				<Title level={2} style={{ margin: 0, fontSize: "clamp(20px, 4vw, 30px)" }}>
					{t("navigation.dashboard")}
				</Title>
				<Paragraph style={{ margin: "8px 0 0", color: "#666", fontSize: "clamp(12px, 2.5vw, 14px)" }}>
					{t("dashboard.overview")}
				</Paragraph>
			</div>

			{/* KPI Cards - Dynamic Responsive Grid */}
			<Row gutter={[8, 8]} style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap" }}>
				{kpiConfigs.map((kpi) => (
					<Col
						key={`kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}
						xs={{ flex: "1 1 calc(50% - 8px)", span: 12 }}
						sm={{ flex: "1 1 calc(50% - 8px)", span: 12 }}
						md={{ flex: "1 1 calc(33.33% - 8px)", span: 8 }}
						lg={{ flex: "1 1 calc(20% - 8px)" }}
						xl={{ flex: "1 1 calc(20% - 8px)" }}
						style={{ minWidth: 0, display: "flex" }}
					>
						<Card
							hoverable
							className="shadow-md"
							style={{
								height: "100%",
								width: "100%",
								transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
								transform: "translateY(0)",
							}}
							bodyStyle={{
								padding: "clamp(8px, 2vw, 12px)",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Statistic
								title={
									<Text
										ellipsis
										title={kpi.title}
										style={{
											fontSize: "clamp(10px, 2.5vw, 14px)",
											display: "block",
											wordBreak: "break-word",
											textAlign: "center",
											marginBottom: "4px",
										}}
									>
										{kpi.title}
									</Text>
								}
								value={
									kpi.valueType === "currency"
										? formatTND(kpi.value)
										: kpi.valueType === "storage"
										? formatStorageSize(kpi.value)
										: kpi.value
								}
								prefix={
									<span style={{
										color: kpi.color,
										fontSize: "clamp(14px, 4vw, 20px)",
										marginRight: "4px",
									}}>
										{kpi.icon}
									</span>
								}
								valueStyle={{
									color: kpi.color,
									fontSize: "clamp(16px, 4vw, 24px)",
									fontWeight: "bold",
									lineHeight: 1.2,
									wordBreak: "break-word",
									textAlign: "center",
								}}
							/>
						</Card>
					</Col>
				))}
			</Row>

			{/* Client Progress and Upcoming Events - Same Row */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				{/* Client Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						className="shadow-md"
						title={<CardTitle icon={<UserOutlined />} title={t("dashboard.clientProgress.title")} color="#1890ff" />}
						extra={
							<Tag color="blue" icon={<RiseOutlined />} style={{ fontSize: "clamp(10px, 2vw, 12px)", margin: 0 }}>
								{t("dashboard.clientProgress.total")}: {clientProgress.length > 0 ? clientProgress[clientProgress.length - 1].cumulativeCount : 0}
							</Tag>
						}
						bodyStyle={{ padding: "16px 8px" }}
						style={{ height: "100%" }}
						headStyle={{ flexWrap: "wrap", padding: "12px 16px" }}
					>
						{clientProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "16px" }} />
								<Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
									{t("dashboard.clientProgress.noData")}
								</Paragraph>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={clientProgress}>
									<defs>
										<linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="date"
										tickFormatter={(date) => moment(date).format("MMM DD")}
										style={{ fontSize: "clamp(9px, 2vw, 12px)" }}
									/>
									<YAxis style={{ fontSize: "clamp(9px, 2vw, 12px)" }} />
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length > 0) {
												const data = payload[0].payload;
												return (
													<Card size="small" className="shadow-md">
														<Space direction="vertical" size="small">
															<Text strong style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>
																{moment(data.date).format("MMM DD, YYYY")}
															</Text>
															<Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
																{t("dashboard.clientProgress.tooltip.newClients")}: {data.count}
															</Text>
															<Text type="success" style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
																{t("dashboard.clientProgress.tooltip.total")}: {data.cumulativeCount}
															</Text>
														</Space>
													</Card>
												);
											}
											return null;
										}}
									/>
									<Legend wrapperStyle={{ fontSize: "clamp(10px, 2vw, 13px)" }} />
									<Area
										type="monotone"
										dataKey="cumulativeCount"
										stroke="#1890ff"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorClients)"
										name={t("dashboard.kpi.totalClients")}
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Col>

				{/* Upcoming Events Section */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						className="shadow-md"
						title={<CardTitle icon={<CalendarOutlined />} title={t("dashboard.upcomingEvents.title")} color="#1890ff" />}
						extra={
							<Tag color="blue" style={{ fontSize: "clamp(10px, 2vw, 12px)", margin: 0 }}>
								{upcomingEvents.length} {t("dashboard.upcomingEvents.events")}
							</Tag>
						}
						bodyStyle={{ padding: "16px 8px" }}
						style={{ height: "100%" }}
						headStyle={{ flexWrap: "wrap", padding: "12px 16px" }}
					>
						{upcomingEvents.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								<CalendarOutlined style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "16px" }} />
								<Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
									{t("dashboard.upcomingEvents.noEvents")}
								</Paragraph>
							</div>
						) : (
							<div style={{ maxHeight: "400px", overflowY: "auto" }}>
								<List
									itemLayout="horizontal"
									dataSource={upcomingEvents}
									renderItem={(event) => (
										<List.Item style={{ padding: "12px 8px" }}>
											<List.Item.Meta
												avatar={
													<div
														style={{
															width: "clamp(36px, 8vw, 48px)",
															height: "clamp(36px, 8vw, 48px)",
															borderRadius: "8px",
															background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															justifyContent: "center",
															color: "white",
															flexShrink: 0,
														}}
													>
														<div style={{ fontSize: "clamp(9px, 2vw, 12px)", fontWeight: "bold" }}>
															{moment(event.startDate).format("MMM")}
														</div>
														<div style={{ fontSize: "clamp(12px, 3vw, 16px)", fontWeight: "bold" }}>
															{moment(event.startDate).format("DD")}
														</div>
													</div>
												}
												title={
													<Space direction="vertical" size={0} style={{ width: "100%" }}>
														<Text
															strong
															ellipsis
															style={{
																fontSize: "clamp(11px, 2.5vw, 14px)",
																display: "block",
															}}
														>
															{event.name}
														</Text>
														{event.lawsuit && (
															<Tag color="blue" style={{ fontSize: "clamp(9px, 2vw, 11px)", marginTop: "4px" }}>
																{event.lawsuit.lawsuitCode}
															</Tag>
														)}
													</Space>
												}
												description={
													<Space direction="vertical" size={4} style={{ width: "100%" }}>
														{event.description && (
															<Text
																type="secondary"
																style={{ fontSize: "clamp(10px, 2vw, 12px)" }}
																ellipsis
															>
																{event.description}
															</Text>
														)}
														<Space wrap size="small" style={{ width: "100%" }}>
															<Text
																type="secondary"
																style={{ fontSize: "clamp(9px, 2vw, 11px)" }}
															>
																<CalendarOutlined /> {moment(event.startDate).format("MMM DD, YYYY HH:mm")} -{" "}
																{moment(event.endDate).format("HH:mm")}
															</Text>
															{event.clients.length > 0 && (
																<Text
																	type="secondary"
																	style={{ fontSize: "clamp(9px, 2vw, 11px)" }}
																	ellipsis
																>
																	<TeamOutlined /> {event.clients.map((c) => c.fullName).join(", ")}
																</Text>
															)}
														</Space>
													</Space>
												}
											/>
										</List.Item>
									)}
								/>
							</div>
						)}
					</Card>
				</Col>
			</Row>

			{/* Payment and Lawsuit Progress Charts - Same Row */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				{/* Payment Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						className="shadow-md"
						title={<CardTitle icon={<DollarOutlined />} title={t("dashboard.paymentProgress.title")} color="#13c2c2" />}
						extra={
							<Tag color="cyan" style={{ fontSize: "clamp(10px, 2vw, 12px)", margin: 0 }}>
								{formatTND(paymentProgress.length > 0 ? paymentProgress[paymentProgress.length - 1].cumulativeAmount : 0)}
							</Tag>
						}
						bodyStyle={{ padding: "16px 8px" }}
						style={{ height: "100%" }}
						headStyle={{ flexWrap: "wrap", padding: "12px 16px" }}
					>
						{paymentProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "16px" }} />
								<Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
									{t("dashboard.paymentProgress.noData")}
								</Paragraph>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={paymentProgress}>
									<defs>
										<linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#13c2c2" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#13c2c2" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="date"
										tickFormatter={(date) => moment(date).format("MMM DD")}
										style={{ fontSize: "clamp(9px, 2vw, 12px)" }}
									/>
									<YAxis
										tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
										style={{ fontSize: "clamp(9px, 2vw, 12px)" }}
									/>
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length > 0) {
												const data = payload[0].payload;
												return (
													<Card size="small" className="shadow-md">
														<Space direction="vertical" size="small">
															<Text strong style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>
																{moment(data.date).format("MMM DD, YYYY")}
															</Text>
															<Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
																{t("dashboard.paymentProgress.tooltip.daily")}: {formatTND(data.amount)}
															</Text>
															<Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
																{t("dashboard.paymentProgress.tooltip.payments")}: {data.paymentsCount}
															</Text>
															<Text type="success" style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
																{t("dashboard.paymentProgress.tooltip.total")}: {formatTND(data.cumulativeAmount)}
															</Text>
														</Space>
													</Card>
												);
											}
											return null;
										}}
									/>
									<Legend wrapperStyle={{ fontSize: "clamp(10px, 2vw, 13px)" }} />
									<Area
										type="monotone"
										dataKey="cumulativeAmount"
										stroke="#13c2c2"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorPayments)"
										name={t("dashboard.paymentProgress.chartLabel")}
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Col>

				{/* Lawsuit Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						className="shadow-md"
						title={<CardTitle icon={<FileTextOutlined />} title={t("dashboard.lawsuitProgress.title")} color="#52c41a" />}
						extra={
							<Tag color="green" style={{ fontSize: "clamp(10px, 2vw, 12px)", margin: 0 }}>
								{t("dashboard.lawsuitProgress.total")}: {lawsuitProgress.length > 0 ? lawsuitProgress[lawsuitProgress.length - 1].cumulativeCount : 0}
							</Tag>
						}
						bodyStyle={{ padding: "16px 8px" }}
						style={{ height: "100%" }}
						headStyle={{ flexWrap: "wrap", padding: "12px 16px" }}
					>
						{lawsuitProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "clamp(36px, 8vw, 48px)", marginBottom: "16px" }} />
								<Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
									{t("dashboard.lawsuitProgress.noData")}
								</Paragraph>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={lawsuitProgress}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="date"
										tickFormatter={(date) => moment(date).format("MMM DD")}
										style={{ fontSize: "clamp(9px, 2vw, 12px)" }}
									/>
									<YAxis style={{ fontSize: "clamp(9px, 2vw, 12px)" }} />
									<Tooltip content={CustomLawsuitTooltip} />
									<Legend wrapperStyle={{ fontSize: "clamp(10px, 2vw, 13px)" }} />
									<Line
										type="monotone"
										dataKey="cumulativeCount"
										stroke="#52c41a"
										strokeWidth={2}
										dot={{ fill: "#52c41a", r: 4 }}
										activeDot={{ r: 6 }}
										name={t("dashboard.lawsuitProgress.chartLabel")}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Col>
			</Row>
		</div>
	);
};
