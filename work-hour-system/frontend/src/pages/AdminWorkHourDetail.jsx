import { useState, useEffect, useMemo } from 'react';
import { Table, Button, DatePicker, Card, Row, Col, message, Tag, Select, Input } from 'antd';
import { ClockCircleOutlined, UserOutlined, CalendarOutlined, SearchOutlined, FilterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminWorkHourDetail = ({ filterType, filterValue, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [workTypeFilter, setWorkTypeFilter] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchWorkHours();
  }, [dateRange, filterType, filterValue]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const response = await workHourAPI.getAllWorkHours();
      if (response.data.code === 200) {
        let result = response.data.data;
        
        // Apply filters
        if (filterType === 'person' && filterValue) {
          result = result.filter(item => item.personName === filterValue);
        } else if (filterType === 'department' && filterValue) {
          result = result.filter(item => item.departmentName === filterValue);
        } else if (filterType === 'project' && filterValue) {
          result = result.filter(item => item.projectName === filterValue);
        }
        
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

  const filteredData = useMemo(() => {
    let result = [...data];
    
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter);
    }
    
    if (workTypeFilter) {
      result = result.filter(item => item.workType === workTypeFilter);
    }
    
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(item => 
        item.personName?.toLowerCase().includes(search) ||
        item.projectName?.toLowerCase().includes(search) ||
        item.workContent?.toLowerCase().includes(search)
      );
    }
    
    return result;
  }, [data, statusFilter, workTypeFilter, searchText]);

  const statusMap = {
    Pending: { label: '待提交', color: 'default' },
    Submitted: { label: '已提交', color: 'processing' },
    Approved: { label: '已审批', color: 'success' },
    Rejected: { label: '已驳回', color: 'error' },
  };

  const pageTitle = useMemo(() => {
    if (filterType === 'person') return `员工工时详情 - ${filterValue}`;
    if (filterType === 'department') return `部门工时详情 - ${filterValue}`;
    if (filterType === 'project') return `项目工时详情 - ${filterValue}`;
    return '工时详情';
  }, [filterType, filterValue]);

  const columns = [
    {
      title: '员工',
      dataIndex: 'personName',
      key: 'personName',
      width: 120,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          {text}
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
    },
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 120,
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      width: 180,
    },
    {
      title: '工时',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 100,
      render: (text, record) => (
        <div style={{ color: record.workType === 'overtime' ? '#fa8c16' : '#52c41a', fontWeight: 600, fontSize: 15 }}>
          {text} 小时
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'workType',
      key: 'workType',
      width: 100,
      render: (text) => (
        <Tag color={text === 'overtime' ? 'orange' : 'green'}>
          {text === 'overtime' ? '加班' : '正常'}
        </Tag>
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

  const totalHours = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [filteredData]);

  const normalHours = useMemo(() => {
    return filteredData.filter(w => !w.workType || w.workType === 'normal').reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [filteredData]);

  const overtimeHours = useMemo(() => {
    return filteredData.filter(w => w.workType === 'overtime').reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [filteredData]);

  const approvedCount = useMemo(() => {
    return filteredData.filter(item => item.status === 'Approved').length;
  }, [filteredData]);

  const submittedCount = useMemo(() => {
    return filteredData.filter(item => item.status === 'Submitted').length;
  }, [filteredData]);

  return (
    <Card
      style={{
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        boxShadow: 'none',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
          >
            返回
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>{pageTitle}</span>
          </div>
        </div>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterOutlined style={{ color: '#999' }} />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 280 }}
          />
        </div>
        <Select
          placeholder="状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="Pending">待提交</Option>
          <Option value="Submitted">已提交</Option>
          <Option value="Approved">已审批</Option>
          <Option value="Rejected">已驳回</Option>
        </Select>
        <Select
          placeholder="类型筛选"
          value={workTypeFilter}
          onChange={setWorkTypeFilter}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="normal">正常</Option>
          <Option value="overtime">加班</Option>
        </Select>
        <Input
          placeholder="搜索员工、项目或工作内容"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>总工时</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>{totalHours}小时</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
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
                <div style={{ fontSize: 12, color: '#999' }}>正常工时</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{normalHours}小时</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#fff7e6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>加班工时</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}>{overtimeHours}小时</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#f9f0ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOutlined style={{ color: '#722ed1', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>已审批</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#722ed1' }}>{approvedCount}条</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#fffbe6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>待审批</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>{submittedCount}条</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FilterOutlined style={{ color: '#666', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>总记录</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#666' }}>{filteredData.length}条</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
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

export default AdminWorkHourDetail;
