import { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, message, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const ApprovalList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const columns = [
    {
      title: '提交人',
      dataIndex: 'personName',
      key: 'personName',
      width: 100,
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
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
      width: 120,
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
    },
    {
      title: '工时(小时)',
      dataIndex: 'hours',
      key: 'hours',
      width: 120,
    },
    {
      title: '工作类型',
      dataIndex: 'workType',
      key: 'workType',
      width: 100,
      render: (text) => (text === 'normal' ? '正常工时' : '加班'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      width: 160,
    },
    {
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
    },
  ];

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
        <div style={{ color: '#faad14', fontWeight: 500 }}>
          待审批: {data.length} 条
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
        style={{ background: '#fff' }}
      />

      <Modal
        title="工时详情"
        visible={isModalVisible}
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
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工作日期</div>
                <div style={{ fontSize: 16 }}>
                  {dayjs(selectedItem.workDate).format('YYYY-MM-DD')}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工时</div>
                <div style={{ fontSize: 16, color: '#1890ff' }}>
                  {selectedItem.hours} 小时
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>项目</div>
                <div style={{ fontSize: 16 }}>{selectedItem.projectName}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工作类型</div>
                <div style={{ fontSize: 16 }}>
                  {selectedItem.workType === 'normal' ? '正常工时' : '加班'}
                </div>
              </Col>
            </Row>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>工作描述</div>
              <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                {selectedItem.description || '-'}
              </div>
            </div>
            <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>提交时间</div>
              <div style={{ fontSize: 14, color: '#999' }}>
                {dayjs(selectedItem.submitTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ApprovalList;