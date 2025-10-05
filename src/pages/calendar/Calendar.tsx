import React, { useState } from 'react';
import { Typography, Card, Calendar as AntdCalendar, Badge, List, Button } from 'antd';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'court' | 'consultation';
  client?: string;
}

export const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const [, setSelectedDate] = useState<Dayjs | null>(null);

  const mockEvents: Event[] = [
    { id: '1', title: 'Client Meeting', date: '2024-01-15', time: '10:00', type: 'meeting', client: 'John Doe' },
    { id: '2', title: 'Court Hearing', date: '2024-01-20', time: '14:00', type: 'court', client: 'Jane Smith' },
    { id: '3', title: 'Document Deadline', date: '2024-01-25', time: '17:00', type: 'deadline' },
    { id: '4', title: 'Consultation', date: '2024-01-30', time: '11:00', type: 'consultation', client: 'Bob Johnson' },
  ];

  const getEventBadgeStatus = (type: string) => {
    switch (type) {
      case 'meeting': return 'processing';
      case 'deadline': return 'error';
      case 'court': return 'warning';
      case 'consultation': return 'success';
      default: return 'default';
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayEvents = mockEvents.filter(event => event.date === dateStr);

    return (
      <div>
        {dayEvents.map(event => (
          <Badge
            key={event.id}
            status={getEventBadgeStatus(event.type)}
            text={event.title}
            style={{ display: 'block', fontSize: '12px', marginBottom: '2px' }}
          />
        ))}
      </div>
    );
  };

  const todayEvents = mockEvents.filter(event => {
    const today = new Date().toISOString().split('T')[0];
    return event.date === today;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('navigation.calendar')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('calendar.addEvent')}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <Card>
          <AntdCalendar
            dateCellRender={dateCellRender}
            onSelect={setSelectedDate}
          />
        </Card>

        <div>
          <Card title={t('calendar.todayEvents')} style={{ marginBottom: '16px' }}>
            {todayEvents.length > 0 ? (
              <List
                dataSource={todayEvents}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ClockCircleOutlined />}
                      title={`${event.time} - ${event.title}`}
                      description={event.client}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                {t('calendar.noEvents')}
              </p>
            )}
          </Card>

          <Card title={t('calendar.upcomingEvents')}>
            <List
              dataSource={mockEvents.slice(0, 5)}
              renderItem={(event) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={getEventBadgeStatus(event.type)}
                        text=""
                      />
                    }
                    title={event.title}
                    description={`${event.date} at ${event.time}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};