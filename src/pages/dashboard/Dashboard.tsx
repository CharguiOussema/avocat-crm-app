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
	FallOutlined,
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
	TooltipProps,
} from "recharts";
import { dashboardService } from "../../services";
import type { DashboardStats } from "../../services/DashboardService";
import { formatStorageSize, formatTND } from "../../utils/format.helpers";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

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
				<Spin size="large" tip="Loading dashboard..." />
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				message="Error"
				description="Failed to load dashboard data. Please try again later."
				type="error"
				showIcon
			/>
		);
	}

	if (!data) {
		return null;
	}

	const { kpis, upcomingEvents, clientProgress, paymentProgress, lawsuitProgress } = data;

	const getStatusColor = (status: string): string => {
		switch (status.toUpperCase()) {
			case "DONE":
				return "#52c41a";
			case "INPROGRESS":
				return "#1890ff";
			case "SCHEDULED":
				return "#faad14";
			case "CANCELLED":
				return "#ff4d4f";
			default:
				return "#d9d9d9";
		}
	};

	const getStatusLabel = (status: string): string => {
		switch (status.toUpperCase()) {
			case "DONE":
				return "Done";
			case "INPROGRESS":
				return "In Progress";
			case "SCHEDULED":
				return "Scheduled";
			case "CANCELLED":
				return "Cancelled";
			default:
				return status;
		}
	};

	// Custom tooltip for lawsuit chart
	const CustomLawsuitTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
		if (active && payload && payload.length > 0) {
			const data = payload[0].payload;
			return (
				<Card size="small" style={{ minWidth: "200px" }}>
					<Space direction="vertical" size="small">
						<Text strong>{moment(data.date).format("MMM DD, YYYY")}</Text>
						<Text>Total: {data.cumulativeCount} lawsuits</Text>
						<Text>New: {data.count} lawsuits</Text>
						<div style={{ marginTop: "8px" }}>
							<Text type="secondary" style={{ fontSize: "12px" }}>Status Breakdown:</Text>
							<div style={{ marginTop: "4px" }}>
								<Tag color="#52c41a">Done: {data.statusCounts.DONE}</Tag>
								<Tag color="#1890ff">In Progress: {data.statusCounts.INPROGRESS}</Tag>
								<Tag color="#faad14">Scheduled: {data.statusCounts.SCHEDULED}</Tag>
								<Tag color="#ff4d4f">Cancelled: {data.statusCounts.CANCELLED}</Tag>
							</div>
						</div>
					</Space>
				</Card>
			);
		}
		return null;
	};


	return (
		<div style={{ padding: "0" }}>
			{/* Page Header */}
			<div style={{ marginBottom: "24px" }}>
				<Title level={2} style={{ margin: 0 }}>
					{t("navigation.dashboard")}
				</Title>
				<Paragraph style={{ margin: "8px 0 0", color: "#666" }}>
					Overview of your law firm's performance and activities
				</Paragraph>
			</div>

			{/* KPI Cards - 5 Cards in One Row */}
			<Row gutter={[8, 16]} style={{ marginBottom: "24px" }}>
				{[
					{
						title: "Total Clients",
						value: kpis.totalClients,
						icon: <UserOutlined />,
						color: "#1890ff",
						valueType: "number" as const,
					},
					{
						title: "Total Lawsuits",
						value: kpis.totalLawsuits,
						icon: <FileTextOutlined />,
						color: "#52c41a",
						valueType: "number" as const,
					},
					{
						title: "Total Revenue",
						value: kpis.totalRevenue,
						icon: <DollarOutlined />,
						color: "#13c2c2",
						valueType: "currency" as const,
					},
					{
						title: "Money Not Paid",
						value: kpis.unpaidRevenue,
						icon: <ExclamationCircleOutlined />,
						color: "#ff4d4f",
						valueType: "currency" as const,
					},
					{
						title: "Total Storage",
						value: kpis.totalStorageBytes,
						icon: <DatabaseOutlined />,
						color: "#722ed1",
						valueType: "storage" as const,
					},
				].map((kpi, index) => (
					<Col
						key={index}
						xs={{ span: 24 / 5, flex: "1 1 20%" }}
						sm={{ span: 24 / 5, flex: "1 1 20%" }}
						md={{ span: 24 / 5, flex: "1 1 20%" }}
						lg={{ span: 24 / 5, flex: "1 1 20%" }}
						xl={{ span: 24 / 5, flex: "1 1 20%" }}
						style={{ minWidth: 0 }}
					>
						<Card
							hoverable
							style={{ height: "100%" }}
							bodyStyle={{ padding: "16px 12px" }}
						>
							<Statistic
								title={
									<Text
										ellipsis
										style={{
											fontSize: "clamp(10px, 1.2vw, 14px)",
											display: "block"
										}}
									>
										{kpi.title}
									</Text>
								}
								value={
									kpi.valueType === "currency"
										? formatTND(kpi.value as number)
										: kpi.valueType === "storage"
										? formatStorageSize(kpi.value as number)
										: kpi.value
								}
								prefix={
									<span style={{ color: kpi.color, fontSize: "clamp(16px, 2vw, 20px)" }}>
										{kpi.icon}
									</span>
								}
								valueStyle={{
									color: kpi.color,
									fontSize: "clamp(14px, 2vw, 24px)",
									fontWeight: "bold",
									lineHeight: 1.2,
								}}
							/>
						</Card>
					</Col>
				))}
			</Row>

			{/* Upcoming Events Section */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				<Col xs={24} lg={24} xl={24}>
					<Card
						title={
							<Space size="small">
								<CalendarOutlined style={{ color: "#1890ff" }} />
								<Text strong style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}>
									Upcoming Events (Top 10)
								</Text>
							</Space>
						}
						extra={<Tag color="blue">{upcomingEvents.length} Events</Tag>}
						bodyStyle={{ padding: "16px" }}
					>
						{upcomingEvents.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								<CalendarOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
								<Paragraph>No upcoming events scheduled</Paragraph>
							</div>
						) : (
							<List
								itemLayout="horizontal"
								dataSource={upcomingEvents}
								renderItem={(event) => (
									<List.Item>
										<List.Item.Meta
											avatar={
												<div
													style={{
														width: "clamp(40px, 5vw, 48px)",
														height: "clamp(40px, 5vw, 48px)",
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
													<div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: "bold" }}>
														{moment(event.startDate).format("MMM")}
													</div>
													<div style={{ fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: "bold" }}>
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
															fontSize: "clamp(12px, 1.3vw, 14px)",
															display: "block",
														}}
													>
														{event.name}
													</Text>
													{event.lawsuit && (
														<Tag color="blue" style={{ fontSize: "clamp(9px, 1vw, 11px)" }}>
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
															style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}
															ellipsis
														>
															{event.description}
														</Text>
													)}
													<Space wrap size="small">
														<Text
															type="secondary"
															style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}
														>
															<CalendarOutlined /> {moment(event.startDate).format("MMM DD, YYYY HH:mm")} -{" "}
															{moment(event.endDate).format("HH:mm")}
														</Text>
														{event.clients.length > 0 && (
															<Text
																type="secondary"
																style={{ fontSize: "clamp(10px, 1.1vw, 12px)" }}
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
						)}
					</Card>
				</Col>
			</Row>

			{/* Progress Charts */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				{/* Client Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={24} xl={24}>
					<Card
						title={
							<Space size="small">
								<UserOutlined style={{ color: "#1890ff" }} />
								<Text strong style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}>
									Client Progress (Last 30 Days)
								</Text>
							</Space>
						}
						extra={
							<Space>
								<Tag color="blue" icon={<RiseOutlined />}>
									Total: {clientProgress.length > 0 ? clientProgress[clientProgress.length - 1].cumulativeCount : 0}
								</Tag>
							</Space>
						}
						bodyStyle={{ padding: "16px" }}
					>
						{clientProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
								<Paragraph>No client data available for the last 30 days</Paragraph>
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
										style={{ fontSize: "clamp(10px, 1vw, 12px)" }}
									/>
									<YAxis style={{ fontSize: "clamp(10px, 1vw, 12px)" }} />
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length > 0) {
												const data = payload[0].payload;
												return (
													<Card size="small">
														<Space direction="vertical" size="small">
															<Text strong>{moment(data.date).format("MMM DD, YYYY")}</Text>
															<Text>New Clients: {data.count}</Text>
															<Text type="success">Total: {data.cumulativeCount}</Text>
														</Space>
													</Card>
												);
											}
											return null;
										}}
									/>
									<Legend wrapperStyle={{ fontSize: "clamp(11px, 1.1vw, 13px)" }} />
									<Area
										type="monotone"
										dataKey="cumulativeCount"
										stroke="#1890ff"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorClients)"
										name="Total Clients"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Col>

				{/* Payment Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						title={
							<Space size="small">
								<DollarOutlined style={{ color: "#13c2c2" }} />
								<Text strong style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}>
									Payment Progress (Last 30 Days)
								</Text>
							</Space>
						}
						extra={
							<Tag color="cyan">
								{formatTND(paymentProgress.length > 0 ? paymentProgress[paymentProgress.length - 1].cumulativeAmount : 0)}
							</Tag>
						}
						bodyStyle={{ padding: "16px" }}
					>
						{paymentProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
								<Paragraph>No payment data available for the last 30 days</Paragraph>
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
										style={{ fontSize: "clamp(10px, 1vw, 12px)" }}
									/>
									<YAxis
										tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
										style={{ fontSize: "clamp(10px, 1vw, 12px)" }}
									/>
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length > 0) {
												const data = payload[0].payload;
												return (
													<Card size="small">
														<Space direction="vertical" size="small">
															<Text strong>{moment(data.date).format("MMM DD, YYYY")}</Text>
															<Text>Daily: {formatTND(data.amount)}</Text>
															<Text>Payments: {data.paymentsCount}</Text>
															<Text type="success">Total: {formatTND(data.cumulativeAmount)}</Text>
														</Space>
													</Card>
												);
											}
											return null;
										}}
									/>
									<Legend wrapperStyle={{ fontSize: "clamp(11px, 1.1vw, 13px)" }} />
									<Area
										type="monotone"
										dataKey="cumulativeAmount"
										stroke="#13c2c2"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorPayments)"
										name="Total Revenue (TND)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Col>

				{/* Lawsuit Progress Chart */}
				<Col xs={24} sm={24} md={24} lg={12} xl={12}>
					<Card
						title={
							<Space size="small">
								<FileTextOutlined style={{ color: "#52c41a" }} />
								<Text strong style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}>
									Lawsuit Progress (Last 30 Days)
								</Text>
							</Space>
						}
						extra={
							<Tag color="green">
								Total: {lawsuitProgress.length > 0 ? lawsuitProgress[lawsuitProgress.length - 1].cumulativeCount : 0}
							</Tag>
						}
						bodyStyle={{ padding: "16px" }}
					>
						{lawsuitProgress.length === 0 ? (
							<div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
								<LineChartOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
								<Paragraph>No lawsuit data available for the last 30 days</Paragraph>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={lawsuitProgress}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="date"
										tickFormatter={(date) => moment(date).format("MMM DD")}
										style={{ fontSize: "clamp(10px, 1vw, 12px)" }}
									/>
									<YAxis style={{ fontSize: "clamp(10px, 1vw, 12px)" }} />
									<Tooltip content={CustomLawsuitTooltip} />
									<Legend wrapperStyle={{ fontSize: "clamp(11px, 1.1vw, 13px)" }} />
									<Line
										type="monotone"
										dataKey="cumulativeCount"
										stroke="#52c41a"
										strokeWidth={2}
										dot={{ fill: "#52c41a", r: 4 }}
										activeDot={{ r: 6 }}
										name="Total Lawsuits"
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
