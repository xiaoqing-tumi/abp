import { useState, useEffect, useMemo } from 'react';
import { Card, DatePicker, Row, Col, Statistic, message, Table } from 'antd';
import { BarChartOutlined, UserOutlined, ClockCircleOutlined, ArrowUpOutlined, LineChartOutlined, TeamOutlined, CalendarOutlined, SearchOutlined, FolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI, basicDataAPI } from '../utils/api';

const { RangePicker } = DatePicker;

const Statistics = ({ onPageChange }) => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [workHours, setWorkHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    basicDataAPI.getCurrentUser().then(response => {
      if (response.data.code === 200) {
        setUser(response.data.data);
      }
    });
    fetchWorkHours();
  }, [dateRange]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.getWorkHours({ personCode: currentUser.personCode });
      if (response.data.code === 200) {
        let result = response.data.data;
        if (dateRange && dateRange[0] && dateRange[1]) {
          const startDate = dateRange[0].format('YYYY-MM-DD');
          const endDate = dateRange[1].format('YYYY-MM-DD');
          result = result.filter(item => {
            const itemDate = dayjs(item.workDate).format('YYYY-MM-DD');
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        setWorkHours(result);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const personalStats = useMemo(() => {
    const filtered = workHours.filter(w => w.personCode === user?.personCode);
    const totalHours = filtered.reduce((sum, item) => sum + (item.workHours || 0), 0);
    const workDays = [...new Set(filtered.map(item => dayjs(item.workDate).format('YYYY-MM-DD')))].length;
    const normalHours = filtered.filter(w => !w.workType || w.workType === 'normal').reduce((sum, item) => sum + (item.workHours || 0), 0);
    const overtimeHours = filtered.filter(w => w.workType === 'overtime').reduce((sum, item) => sum + (item.workHours || 0), 0);
    
    const projectDistribution = {};
    filtered.forEach(item => {
      const projectName = item.projectName || item.projectCode;
      if (!projectDistribution[projectName]) {
        projectDistribution[projectName] = 0;
      }
      projectDistribution[projectName] += (item.workHours || 0);
    });
    
    const projectList = Object.entries(projectDistribution).map(([name, hours]) => ({
      projectName: name,
      hours,
    }));
    
    return {
      totalHours: totalHours.toFixed(1),
      normalHours: normalHours.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
      workDays,
      projectDistribution: projectList,
    };
  }, [workHours, user]);

  const projectColumns = [
    { title: '项目名称', dataIndex: 'projectName', key: 'projectName', ellipsis: true },
    { title: '工时(小时)', dataIndex: 'hours', key: 'hours' },
    { 
      title: '占比', 
      key: 'percentage',
      render: (_, record, index) => {
        const total = personalStats.projectDistribution.reduce((sum, p) => sum + parseFloat(p.hours), 0);
        return total > 0 ? `${((parseFloat(record.hours) / total) * 100).toFixed(1)}%` : '0%';
      }
    },
  ];

  return (
    <div>
      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchOutlined style={{ color: '#999' }} />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 280 }}
          />
        </div>
      </Card>

      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>个人工时统计</span>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={6}>
            <Card
              style={{
                borderRadius: 6,
                border: '1px solid #f0f0f0',
                boxShadow: 'none',
              }}
            >
              <Statistic
                title="总工时"
                value={personalStats.totalHours || 0}
                suffix="小时"
                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                borderRadius: 6,
                border: '1px solid #f0f0f0',
                boxShadow: 'none',
              }}
            >
              <Statistic
                title="正常工时"
                value={personalStats.normalHours || 0}
                suffix="小时"
                prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                borderRadius: 6,
                border: '1px solid #f0f0f0',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
              hoverable
              onClick={() => onPageChange && onPageChange('overtime')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Statistic
                    title="加班工时"
                    value={personalStats.overtimeHours || 0}
                    suffix="小时"
                    prefix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}
                    loading={loading}
                  />
                </div>
                <div style={{ color: '#fa8c16', fontSize: 12, marginRight: 8 }}>点击查看详情 →</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                borderRadius: 6,
                border: '1px solid #f0f0f0',
                boxShadow: 'none',
              }}
            >
              <Statistic
                title="工作天数"
                value={personalStats.workDays || 0}
                suffix="天"
                prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FolderOutlined style={{ color: '#722ed1' }} />
            <span style={{ fontWeight: 500 }}>项目工时分布</span>
          </div>
          <Table
            columns={projectColumns}
            dataSource={personalStats.projectDistribution}
            rowKey="projectName"
            bordered={false}
            pagination={false}
            size="small"
          />
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
