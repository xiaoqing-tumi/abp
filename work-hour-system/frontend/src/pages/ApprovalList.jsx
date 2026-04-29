import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Card, Row, Col, message, Modal, Checkbox, Dropdown, Select } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined, ColumnWidthOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { Option } = Select;

const ApprovalList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState({
    personName: true,
    departmentName: true,
    projectName: true,
    workDate: true,
    workHours: true,
    workType: true,
    workContent: true,
    status: true,
    submitTime: true,
    actions: true,
  });

  useEffect(() => {
    fetchWorkHours();
  }, [statusFilter]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter === 'Submitted') {
        response = await workHourAPI.getPendingApprovals();
      } else {
        const params = statusFilter === 'all' ? {} : { status: statusFilter };
        response = await workHourAPI.getWorkHours(params);
      }
      if (response.data.code === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await workHourAPI.approveWorkHour(id);
      if (response.data.code === 200) {
        message.success('审批通过');
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '审批失败');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await workHourAPI.rejectWorkHour(id);
      if (response.data.code === 200) {
        message.success('已驳回');
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '驳回失败');
    }
  };

  const handleView = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const statusMap = {
    Pending: { label: '待提交', color: 'default' },
    Submitted: { label: '待审批', color: 'processing' },
    Approved: { label: '已审批', color: 'success' },
    Rejected: { label: '已驳回', color: 'error' },
  };

  const allColumns = [
    { key: 'personName', title: '提交人' },
    { key: 'departmentName', title: '部门' },
    { key: 'projectName', title: '项目' },
    { key: 'workDate', title: '日期' },
    { key: 'workHours', title: '工时(小时)' },
    { key: 'workType', title: '工作类型' },
    { key: 'workContent', title: '描述' },
    { key: 'status', title: '状态' },
    { key: 'submitTime', title: '提交时间' },
    { key: 'actions', title: '操作' },
  ];

  const columns = useMemo(() => {
    const result = [];
    if (visibleColumns.personName) {
      result.push({
        title: '提交人',
        dataIndex: 'personName',
        key: 'personName',
        width: 100,
      });
    }
    if (visibleColumns.departmentName) {
      result.push({
        title: '部门',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: 120,
      });
    }
    if (visibleColumns.projectName) {
      result.push({
        title: '项目',
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: true,
        width: 150,
      });
    }
    if (visibleColumns.workDate) {
      result.push({
        title: '日期',
        dataIndex: 'workDate',
        key: 'workDate',
        render: (text) => dayjs(text).format('YYYY-MM-DD'),
        width: 120,
      });
    }
    if (visibleColumns.workHours) {
      result.push({
        title: '工时(小时)',
        dataIndex: 'workHours',
        key: 'workHours',
        width: 120,
      });
    }
    if (visibleColumns.workType) {
      result.push({
        title: '工作类型',
        dataIndex: 'workType',
        key: 'workType',
        width: 100,
        render: (text) => (text === 'normal' ? '正常工时' : '加班'),
      });
    }
    if (visibleColumns.workContent) {
      result.push({
        title: '描述',
        dataIndex: 'workContent',
        key: 'workContent',
        ellipsis: true,
        width: 150,
      });
    }
    if (visibleColumns.status) {
      result.push({
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (text) => {
          const status = statusMap[text] || { label: text, color: 'default' };
          return (
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: status.color === 'success' ? '#f6ffed' :
                  status.color === 'error' ? '#fff2f0' :
                  status.color === 'processing' ? '#fffbe6' : '#f5f5f5',
                color: status.color === 'success' ? '#52c41a' :
                  status.color === 'error' ? '#ff4d4f' :
                  status.color === 'processing' ? '#faad14' : '#666',
              }}
            >
              {status.label}
            </span>
          );
        },
      });
    }
    if (visibleColumns.submitTime) {
      result.push({
        title: '提交时间',
        dataIndex: 'submitTime',
        key: 'submitTime',
        render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
        width: 160,
      });
    }
    if (visibleColumns.actions) {
      result.push({
        title: '操作',
        key: 'actions',
        width: 180,
        render: (_, record) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              详情
            </Button>
            {record.status === 'Submitted' && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                >
                  通过
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record.id)}
                >
                  驳回
                </Button>
              </>
            )}
          </div>
        ),
      });
    }
    return result;
  }, [visibleColumns]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const columnMenuItems = allColumns.map((col) => ({
    key: col.key,
    label: (
      <Checkbox
        checked={visibleColumns[col.key]}
        onChange={() => handleColumnToggle(col.key)}
      >
        {col.title}
      </Checkbox>
    ),
  }));

  const stats = useMemo(() => {
    const submitted = data.filter(item => item.status === 'Submitted').length;
    const approved = data.filter(item => item.status === 'Approved').length;
    const rejected = data.filter(item => item.status === 'Rejected').length;
    const pending = data.filter(item => item.status === 'Pending').length;
    return { submitted, approved, rejected, pending, total: data.length };
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
          <SearchOutlined style={{ color: '#999' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>工时审批管理</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#999' }} />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">全部</Option>
              <Option value="Pending">待提交</Option>
              <Option value="Submitted">待审批</Option>
              <Option value="Approved">已审批</Option>
              <Option value="Rejected">已驳回</Option>
            </Select>
          </div>
          <Dropdown menu={{ items: columnMenuItems }} trigger={['click']}>
            <Button type="default" icon={<ColumnWidthOutlined />}>
              列设置
            </Button>
          </Dropdown>
        </div>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#fffbe6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOutlined style={{ color: '#faad14', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>待审批</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>{stats.submitted}条</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#f6ffed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>已审批</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{stats.approved}条</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#fff2f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>已驳回</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{stats.rejected}条</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#e6f7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>总记录</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>{stats.total}条</div>
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

      <Modal
        title="工时详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedItem && (
          <div style={{ padding: 16 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>提交人</div>
                <div style={{ fontSize: 16 }}>{selectedItem.personName}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>部门</div>
                <div style={{ fontSize: 16 }}>{selectedItem.departmentName}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>项目</div>
                <div style={{ fontSize: 16 }}>{selectedItem.projectName}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>日期</div>
                <div style={{ fontSize: 16 }}>{dayjs(selectedItem.workDate).format('YYYY-MM-DD')}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工时</div>
                <div style={{ fontSize: 16 }}>{selectedItem.workHours} 小时</div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工作类型</div>
                <div style={{ fontSize: 16 }}>{selectedItem.workType === 'normal' ? '正常工时' : '加班'}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工作描述</div>
                <div style={{ fontSize: 16 }}>{selectedItem.workContent || '无'}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>状态</div>
                <div style={{ fontSize: 16 }}>{statusMap[selectedItem.status]?.label || selectedItem.status}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>提交时间</div>
                <div style={{ fontSize: 16 }}>{selectedItem.submitTime ? dayjs(selectedItem.submitTime).format('YYYY-MM-DD HH:mm') : '-'}</div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ApprovalList;
