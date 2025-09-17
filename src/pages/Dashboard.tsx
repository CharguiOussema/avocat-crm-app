import React from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Statistic, List, Typography, Avatar } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export const Dashboard: React.FC = () => {
	const { t } = useTranslation();

	const stats = [
		{
			title: t("navigation.clients"),
			value: 127,
			icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
		},
		{
			title: t("navigation.cases"),
			value: 89,
			icon: <FileTextOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
		},
		{
			title: t("navigation.reports"),
			value: 34,
			icon: <BarChartOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
		},
		{
			title: t("navigation.calendar"),
			value: 12,
			icon: <CalendarOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
		},
	];

	const recentActivities = [
		{ id: 1, title: 'Case #1 updated', time: '2 hours ago' },
		{ id: 2, title: 'Case #2 updated', time: '4 hours ago' },
		{ id: 3, title: 'Case #3 updated', time: '6 hours ago' },
	];

	const upcomingAppointments = [
		{ id: 1, title: 'Client Meeting #1', time: 'Tomorrow at 10:00 AM' },
		{ id: 2, title: 'Client Meeting #2', time: 'Tomorrow at 2:00 PM' },
		{ id: 3, title: 'Client Meeting #3', time: 'Tomorrow at 4:00 PM' },
	];

	return (
		<div style={{ padding: '0' }}>
			{/* Page Header */}
			<div style={{ marginBottom: '24px' }}>
				<Title level={2} style={{ margin: 0 }}>
					{t("navigation.dashboard")}
				</Title>
				<Paragraph style={{ margin: '8px 0 0', color: '#666' }}>
					{t("app.welcome")}
				</Paragraph>
			</div>

			{/* Stats Grid */}
			<Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
				{stats.map((stat, index) => (
					<Col xs={24} sm={12} lg={6} key={index}>
						<Card>
							<Statistic
								title={stat.title}
								value={stat.value}
								prefix={stat.icon}
								valueStyle={{ fontSize: '28px', fontWeight: 'bold' }}
							/>
						</Card>
					</Col>
				))}
			</Row>

			{/* Content Area */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<Card title="Recent Activity" style={{ height: '400px' }}>
						<List
							itemLayout="horizontal"
							dataSource={recentActivities}
							renderItem={(item) => (
								<List.Item>
									<List.Item.Meta
										avatar={
											<Avatar
												style={{ backgroundColor: '#1890ff' }}
												icon={<ClockCircleOutlined />}
											/>
										}
										title={item.title}
										description={item.time}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title="Upcoming Appointments" style={{ height: '400px' }}>
						<List
							itemLayout="horizontal"
							dataSource={upcomingAppointments}
							renderItem={(item) => (
								<List.Item>
									<List.Item.Meta
										avatar={
											<Avatar
												style={{ backgroundColor: '#722ed1' }}
												icon={<CalendarOutlined />}
											/>
										}
										title={item.title}
										description={item.time}
									/>
								</List.Item>
							)}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};
