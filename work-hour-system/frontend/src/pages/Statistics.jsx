import { useState, useEffect } from 'react';
import { Card, DatePicker, Row, Col, Statistic, message } from 'antd';
import { BarChartOutlined, UserOutlined, ClockCircleOutlined, ArrowUpOutlined, LineChartOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { statisticsAPI, basicDataAPI } from '../utils/api';

const { RangePicker } = DatePicker;

const Statistics = () => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [personalStats, setPersonalStats] = useState(null);
  const [deptStats, setDeptStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [personalRes, deptRes] = await Promise.all([
        statisticsAPI.getPersonalStatistics({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        }),
        basicDataAPI.getCurrentUser(),
      ]);

      if (personalRes.data.code === 200) {
        setPersonalStats(personalRes.data.data);
      }

      if (deptRes.data.code === 200) {
        const deptId = deptRes.data.data.departmentId;
        const deptResponse = await statisticsAPI.getDepartmentStatistics({
          departmentId: deptId,
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        });
        if (deptResponse.data.code === 200) {
          setDeptStats(deptResponse.data.data);
        }
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #722ed1 0%, #531dab 100%)', borderRadius: 2 }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>统计分析</span>
          </div>
        }
        style={{ marginBottom: 20, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
      >
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          style={{ width: 320 }}
        />
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 600 }}>个人工时统计</span>
          </div>
        }
        style={{ marginBottom: 20, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)' }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="总工时"
                value={personalStats?.totalHours || 0}
                suffix="小时"
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="正常工时"
                value={personalStats?.normalHours || 0}
                suffix="小时"
                prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="加班工时"
                value={personalStats?.overtimeHours || 0}
                suffix="小时"
                prefix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="工作天数"
                value={personalStats?.workDays || 0}
                suffix="天"
                prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 600 }}>部门工时统计</span>
          </div>
        }
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)' }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="部门总工时"
                value={deptStats?.totalHours || 0}
                suffix="小时"
                prefix={<LineChartOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="正常工时"
                value={deptStats?.normalHours || 0}
                suffix="小时"
                prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="加班工时"
                value={deptStats?.overtimeHours || 0}
                suffix="小时"
                prefix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card hoverable style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Statistic
                title="部门人数"
                value={deptStats?.employeeCount || 0}
                suffix="人"
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Statistics;