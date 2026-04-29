import { useState, useEffect, useMemo } from 'react';
import { Table, Button, DatePicker, Card, Row, Col, message, Tag, Tooltip, Modal } from 'antd';
import { ClockCircleOutlined, UserOutlined, CalendarOutlined, SearchOutlined, FilterOutlined, EditOutlined, AlertCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;
const { TextArea } = Modal;

const WorkHourList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editWorkHours, setEditWorkHours] = useState('');
  const [editWorkContent, setEditWorkContent] = useState('');

  const pageTitle = useMemo(() => {
    if (type === 'overtime') return '加班记录';
    if (type === 'normal') return '正常工时记录';
    return '工时记录';
  }, [type]);

  useEffect(() => {
    fetchWorkHours();
  }, [dateRange, type]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = { personCode: user.personCode };
      if (type === 'overtime') {
        params.workType = 'overtime';
      } else if (type === 'normal') {
        params.workType = 'normal';
      }
      const response = await workHourAPI.getWorkHours(params);
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
        setData(result);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditWorkHours(record.workHours.toString());
    setEditWorkContent(record.workContent);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    try {
      const response = await workHourAPI.updateWorkHour(editingItem.id, {
        workHours: parseFloat(editWorkHours),
        workContent: editWorkContent,
        status: 'Pending',
      });
      if (response.data.code === 200) {
        message.success('修改成功，待重新提交');
        setEditModalVisible(false);
        fetchWorkHours();
      }
    } catch (error) {
      message.error('修改失败');
    }
  };

  const handleSubmitAgain = async (record) => {
    try {
      const response = await workHourAPI.submitWorkHour(record.id);
      if (response.data.code === 200) {
        message.success('重新提交成功');
        fetchWorkHours();
      }
    } catch (error) {
      message.error('提交失败');
    }
  };

  const statusMap = {
    Pending: { label: '待提交', color: 'default', icon: <ClockCircleOutlined /> },
    Submitted: { label: '待审批', color: 'processing', icon: <AlertCircleOutlined /> },
    Approved: { label: '已审批', color: 'success', icon: <UserOutlined /> },
    Rejected: { label: '已驳回', color: 'error', icon: <AlertCircleOutlined /> },
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
        const status = statusMap[text] || { label: text, color: 'default', icon: null };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {status.icon && <span style={{ color: Tag.getColor(status.color) }}>{status.icon}</span>}
            <Tag color={status.color}>{status.label}</Tag>
          </div>
        );
      },
    },
    {
      title: '审批人',
      dataIndex: 'approverName',
      key: 'approverName',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '审批时间',
      dataIndex: 'approveTime',
      key: 'approveTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '驳回原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      width: 200,
      render: (text) => {
        if (!text) return '-';
        return (
          <Tooltip title={text}>
            <div style={{ color: '#ff4d4f', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '工作内容',
      dataIndex: 'workContent',
      key: 'workContent',
      ellipsis: true,
      width: 200,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (text, record) => {
        if (record.status === 'Rejected') {
          return (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                修改
              </Button>
            </div>
          );
        }
        return '-';
      },
    },
  ];

  const totalHours = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [data]);

  const normalHours = useMemo(() => {
    return data.filter(w => !w.workType || w.workType === 'normal').reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [data]);

  const overtimeHours = useMemo(() => {
    return data.filter(w => w.workType === 'overtime').reduce((sum, item) => sum + (item.workHours || 0), 0).toFixed(1);
  }, [data]);

  const approvedCount = useMemo(() => {
    return data.filter(item => item.status === 'Approved').length;
  }, [data]);

  const submittedCount = useMemo(() => {
    return data.filter(item => item.status === 'Submitted').length;
  }, [data]);

  const rejectedCount = useMemo(() => {
    return data.filter(item => item.status === 'Rejected').length;
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
          <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>{pageTitle}</span>
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
        {type !== 'overtime' && (
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
                  <div style={{ fontSize: 12, color: '#999' }}>正常工时</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{normalHours}小时</div>
                </div>
              </div>
            </Card>
          </Col>
        )}
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
                <SearchOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>加班工时</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16' }}>{overtimeHours}小时</div>
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
        {type !== 'overtime' && type !== 'normal' && (
          <>
            <Col span={6}>
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
            <Col span={6}>
              <Card
                style={{
                  borderRadius: 6,
                  border: '1px solid #f0f0f0',
                  boxShadow: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: '#fff2f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#999' }}>已驳回</div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>{rejectedCount}条</div>
                  </div>
                </div>
              </Card>
            </Col>
          </>
        )}
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
        title="修改工时记录"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveEdit}>
            保存修改
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>工时（小时）</label>
          <input
            type="number"
            value={editWorkHours}
            onChange={(e) => setEditWorkHours(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4 }}
            min="0"
            step="0.5"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>工作内容</label>
          <TextArea
            value={editWorkContent}
            onChange={(e) => setEditWorkContent(e.target.value)}
            rows={4}
            placeholder="请输入工作内容"
          />
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#fff7e6', borderRadius: 4 }}>
          <div style={{ fontSize: 12, color: '#fa8c16' }}>
            <AlertCircleOutlined style={{ marginRight: 4 }} />
            修改后状态将变为"待提交"，需要重新提交审批
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default WorkHourList;
