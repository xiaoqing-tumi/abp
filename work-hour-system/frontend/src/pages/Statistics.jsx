import { useState, useEffect } from 'react';
import { Card, DatePicker, Row, Col, Statistic, message } from 'antd';
import { BarChartOutlined, UsersOutlined, ClockCircleOutlined, TrendingUpOutlined } from '@ant-design/icons';
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
      <div style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
        />
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="个人总工时"
              value={personalStats?.totalHours || 0}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常工时"
              value={personalStats?.normalHours || 0}
              suffix="小时"
              prefix={<BarChartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="加班工时"
              value={personalStats?.overtimeHours || 0}
              suffix="小时"
              prefix={<TrendingUpOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作天数"
              value={personalStats?.workDays || 0}
              suffix="天"
              prefix={<UsersOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card title="部门总工时">
            <Statistic
              value={deptStats?.totalHours || 0}
              suffix="小时"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="部门正常工时">
            <Statistic
              value={deptStats?.normalHours || 0}
              suffix="小时"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="部门加班工时">
            <Statistic
              value={deptStats?.overtimeHours || 0}
              suffix="小时"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="部门人数">
            <Statistic
              value={deptStats?.employeeCount || 0}
              suffix="人"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;