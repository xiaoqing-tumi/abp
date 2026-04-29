import { useState, useEffect, useMemo } from 'react';
import { Table, Button, DatePicker, Card, Row, Col, message, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined, CalendarOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;

const OvertimeList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);

  useEffect(() => {
    fetchOvertimeHours();
  }, [dateRange]);

  const fetchOvertimeHours = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.getWorkHours({
        personCode: user.personCode,
      });
      if (response.data.code === 200) {
        let result = response.data.data.filter(item => item.workType === 'overtime');
        if (dateRange && dateRange[0] && dateRange[1]) {
          const startDate = dateRange[0].format('YYYY-MM-DD');
          const endDate = dateRange[1].format('YYYY-MM-DD');
          result = result.filter(item => {
            const itemDate = dayjs(item.workDate).format('YYYY-MM-DD');
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        setData(result);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    Pending: { label: '待提交', color: 'default' },
    Submitted: { label: '已提交', color: 'processing' },
    Approved: { label: '已审批', color: 'success' },
    Rejected: { label: '已驳回', color: 'error' },
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 120,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          {dayjs(text).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      width: 180,
    },
    {
      title: '加班工时',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 120,
      render: (text) => (
        <div style={{ color: '#fa8c16', fontWeight: 600, fontSize: 15 }}>
          {text} 小时
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => {
        const status = statusMap[text] || { label: text, color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '工作内容',
      dataIndex: 'workContent',
      key: 'workContent',
      ellipsis: true,
      width: 250,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const totalOvertime = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [data]);

  const approvedCount = useMemo(() => {
    return data.filter(item => item.status === 'Approved').length;
  }, [data]);

  return (
    <Card
      style={{
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        boxShadow: 'none',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>加班记录列表</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#999' }} />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 280 }}
            />
          </div>
        </div>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#fff7e6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>总加班工时</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}>{totalOvertime}小时</div>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#f6ffed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>加班记录数</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{data.length}条</div>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>已审批</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>{approvedCount}条</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 'max-content' }}
        style={{ background: '#fff' }}
      />
    </Card>
  );
};

export default OvertimeList;
