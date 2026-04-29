import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Card, Row, Col, message, Modal, Checkbox, Dropdown, Select, Tag } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, SearchOutlined, ColumnWidthOutlined, FilterOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI, mockProjects } from '../utils/api';

const { Option } = Select;
const { TextArea } = Modal;

const ApprovalList = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
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
    approverName: true,
    approveTime: true,
    rejectReason: true,
    actions: true,
  });

  useEffect(() => {
    fetchWorkHours();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter(item => item.status === statusFilter);
      setFilteredData(filtered);
    }
  }, [statusFilter, allData]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.getWorkHours({});
      if (response.data.code === 200) {
        setAllData(response.data.data);
        
        if (user.role === 'PM') {
          const pmPending = response.data.data.filter(w => {
            const project = mockProjects.find(p => p.projectCode === w.projectCode);
            return project && project.managerCode === user.personCode && w.status === 'Submitted';
          });
          setFilteredData(pmPending);
        } else if (user.role === 'DeptManager') {
          const deptPending = response.data.data.filter(w => w.status === 'Submitted' || w.status === 'PMApproved');
          setFilteredData(deptPending);
        } else {
          setFilteredData(response.data.data);
        }
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.approveWorkHour(id, user.name, user.role);
      if (response.data.code === 200) {
        message.success(response.data.message);
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.rejectWorkHour(id, user.name, rejectReason);
      if (response.data.code === 200) {
        message.success('已驳回');
        setRejectModalVisible(false);
        setRejectReason('');
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

  const handleOpenRejectModal = (record) => {
    setSelectedItem(record);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const statusMap = {
    Pending: { label: '待提交', color: 'default' },
    Submitted: { label: '待审批', color: 'processing' },
    PMApproved: { label: '项目经理已审批', color: 'warning' },
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
    { key: 'approverName', title: '审批人' },
    { key: 'approveTime', title: '审批时间' },
    { key: 'rejectReason', title: '驳回原因' },
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
            <Tag color={status.color}>
              {status.label}
            </Tag>
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
    if (visibleColumns.approverName) {
      result.push({
        title: '审批人',
        dataIndex: 'approverName',
        key: 'approverName',
        width: 100,
        render: (text) => text || '-',
      });
    }
    if (visibleColumns.approveTime) {
      result.push({
        title: '审批时间',
        dataIndex: 'approveTime',
        key: 'approveTime',
        width: 160,
        render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
      });
    }
    if (visibleColumns.rejectReason) {
      result.push({
        title: '驳回原因',
        dataIndex: 'rejectReason',
        key: 'rejectReason',
        width: 200,
        render: (text) => {
          if (!text) return '-';
          return (
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>
              {text}
            </span>
          );
        },
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
            {(record.status === 'Submitted' || record.status === 'PMApproved') && currentUser?.role !== 'Admin' && (
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
                  onClick={() => handleOpenRejectModal(record)}
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
    const submitted = allData.filter(item => item.status === 'Submitted').length;
    const approved = allData.filter(item => item.status === 'Approved').length;
    const rejected = allData.filter(item => item.status === 'Rejected').length;
    const pending = allData.filter(item => item.status === 'Pending').length;
    return { submitted, approved, rejected, pending, total: allData.length };
  }, [allData]);

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
            style={{ 
              borderRadius: 6, 
              border: '1px solid #f0f0f0', 
              boxShadow: 'none',
              cursor: 'pointer',
              borderColor: statusFilter === 'Submitted' ? '#faad14' : '#f0f0f0',
            }}
            onClick={() => setStatusFilter('Submitted')}
            hoverable
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
            style={{ 
              borderRadius: 6, 
              border: '1px solid #f0f0f0', 
              boxShadow: 'none',
              cursor: 'pointer',
              borderColor: statusFilter === 'Approved' ? '#52c41a' : '#f0f0f0',
            }}
            onClick={() => setStatusFilter('Approved')}
            hoverable
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
            style={{ 
              borderRadius: 6, 
              border: '1px solid #f0f0f0', 
              boxShadow: 'none',
              cursor: 'pointer',
              borderColor: statusFilter === 'Rejected' ? '#ff4d4f' : '#f0f0f0',
            }}
            onClick={() => setStatusFilter('Rejected')}
            hoverable
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
            style={{ 
              borderRadius: 6, 
              border: '1px solid #f0f0f0', 
              boxShadow: 'none',
              cursor: 'pointer',
              borderColor: statusFilter === 'all' ? '#1890ff' : '#f0f0f0',
            }}
            onClick={() => setStatusFilter('all')}
            hoverable
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
                <div style={{ fontSize: 16 }}>
                  <Tag color={statusMap[selectedItem.status]?.color}>
                    {statusMap[selectedItem.status]?.label || selectedItem.status}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>提交时间</div>
                <div style={{ fontSize: 16 }}>{selectedItem.submitTime ? dayjs(selectedItem.submitTime).format('YYYY-MM-DD HH:mm') : '-'}</div>
              </Col>
            </Row>
            {selectedItem.status === 'Approved' || selectedItem.status === 'Rejected' ? (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>审批人</div>
                  <div style={{ fontSize: 16 }}>{selectedItem.approverName || '-'}</div>
                </Col>
                <Col span={12}>
                  <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>审批时间</div>
                  <div style={{ fontSize: 16 }}>{selectedItem.approveTime ? dayjs(selectedItem.approveTime).format('YYYY-MM-DD HH:mm') : '-'}</div>
                </Col>
              </Row>
            ) : null}
            {selectedItem.rejectReason ? (
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ fontWeight: 500, color: '#666', marginBottom: 4 }}>驳回原因</div>
                  <div style={{ fontSize: 16, color: '#ff4d4f' }}>{selectedItem.rejectReason}</div>
                </Col>
              </Row>
            ) : null}
          </div>
        )}
      </Modal>

      <Modal
        title="驳回申请"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        footer={[
          <Button key="back" onClick={() => {
            setRejectModalVisible(false);
            setRejectReason('');
          }}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger 
            onClick={() => selectedItem && handleReject(selectedItem.id)}
            disabled={!rejectReason.trim()}
          >
            确认驳回
          </Button>,
        ]}
      >
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, color: '#666', marginBottom: 8 }}>
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
              请填写驳回原因
            </div>
            <TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="请输入驳回原因，员工将根据此原因修改工时记录"
            />
          </div>
          {selectedItem && (
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#666' }}>
                <span style={{ fontWeight: 500 }}>驳回对象：</span>
                {selectedItem.personName} - {selectedItem.projectName} - {dayjs(selectedItem.workDate).format('YYYY-MM-DD')}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default ApprovalList;
