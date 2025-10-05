import React from 'react';
import { Typography, Card, Row, Col, Statistic, Progress, Table, Button } from 'antd';
import { DownloadOutlined, FileTextOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export const Reports: React.FC = () => {
  const { t } = useTranslation();

  const caseStats = [
    { title: t('reports.totalCases'), value: 89, change: 12, isIncrease: true },
    { title: t('reports.activeCases'), value: 56, change: 5, isIncrease: true },
    { title: t('reports.closedCases'), value: 33, change: 7, isIncrease: true },
    { title: t('reports.winRate'), value: 85, suffix: '%', change: 3, isIncrease: true },
  ];

  const monthlyData = [
    { month: 'January', cases: 12, revenue: 45000, winRate: 83 },
    { month: 'February', cases: 15, revenue: 52000, winRate: 87 },
    { month: 'March', cases: 18, revenue: 48000, winRate: 82 },
    { month: 'April', cases: 22, revenue: 65000, winRate: 89 },
    { month: 'May', cases: 20, revenue: 58000, winRate: 85 },
    { month: 'June', cases: 25, revenue: 72000, winRate: 88 },
  ];

  const reportColumns = [
    {
      title: t('reports.month'),
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: t('reports.cases'),
      dataIndex: 'cases',
      key: 'cases',
    },
    {
      title: t('reports.revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: t('reports.winRate'),
      dataIndex: 'winRate',
      key: 'winRate',
      render: (value: number) => (
        <Progress percent={value} size="small" />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('navigation.reports')}
        </Title>
        <Button type="primary" icon={<DownloadOutlined />}>
          {t('reports.export')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {caseStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: stat.isIncrease ? '#3f8600' : '#cf1322' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: stat.isIncrease ? '#3f8600' : '#cf1322' }}>
                {stat.isIncrease ? <RiseOutlined /> : <FallOutlined />}
                {' '}
                {stat.change}% from last month
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Monthly Performance */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={t('reports.monthlyPerformance')}>
            <Table
              dataSource={monthlyData}
              columns={reportColumns}
              rowKey="month"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t('reports.quickStats')} style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>{t('reports.caseCompletion')}</div>
              <Progress percent={75} status="active" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>{t('reports.clientSatisfaction')}</div>
              <Progress percent={92} strokeColor="#52c41a" />
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}>{t('reports.billableHours')}</div>
              <Progress percent={68} strokeColor="#1890ff" />
            </div>
          </Card>

          <Card title={t('reports.caseTypes')}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Contract Law</span>
                <span>35%</span>
              </div>
              <Progress percent={35} showInfo={false} strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Personal Injury</span>
                <span>28%</span>
              </div>
              <Progress percent={28} showInfo={false} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Property Law</span>
                <span>22%</span>
              </div>
              <Progress percent={22} showInfo={false} strokeColor="#faad14" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Others</span>
                <span>15%</span>
              </div>
              <Progress percent={15} showInfo={false} strokeColor="#722ed1" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};