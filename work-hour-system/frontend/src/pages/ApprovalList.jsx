import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Card, Row, Col, message, Modal, Checkbox, Dropdown } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const ApprovalList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    personName: true,
    departmentName: true,
    projectName: true,
    workDate: true,
    hours: true,
    workType: true,
    description: true,
    submitTime: true,
    actions: true,
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await workHourAPI.getPendingApprovals();
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
        fetchPendingApprovals();
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
        fetchPendingApprovals();
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

  const allColumns = [
    { key: 'personName', title: '提交人' },
    { key: 'departmentName', title: '部门' },
    { key: 'projectName', title: '项目' },
    { key: 'workDate', title: '日期' },
    { key: 'hours', title: '工时(小时)' },
    { key: 'workType', title: '工作类型' },
    { key: 'description', title: '描述' },
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
    if (visibleColumns.hours) {
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
    if (visibleColumns.description) {
      result.push({
        title: '描述',
        dataIndex: 'workContent',
        key: 'workContent',
        ellipsis: true,
        width: 150,
      });
    }
    if (visibleColumns.submitTime) {
      result.push({
        title: '提交时间',
        dataIndex: 'submitTime',
        key: 'submitTime',
        render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
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
          <span style={{ fontWeight: 600, fontSize: 16 }}>待审批列表</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#faad14', fontWeight: 500 }}>
            待审批: {data.length} 条
          </div>
          <Dropdown menu={{ items: columnMenuItems }} trigger={['click']}>
            <Button type="default" icon={<ColumnWidthOutlined />}>
              列设置
            </Button>
          </Dropdown>
        </div>
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
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>提交时间</div>
                <div style={{ fontSize: 16 }}>{dayjs(selectedItem.submitTime).format('YYYY-MM-DD HH:mm')}</div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ApprovalList;
