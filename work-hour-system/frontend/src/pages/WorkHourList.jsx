import { useState, useEffect, useMemo } from 'react';
import { Table, Button, DatePicker, Select, Card, Row, Col, message, Modal, Form, Input, InputNumber, Checkbox, Dropdown, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SendOutlined, EyeOutlined, SearchOutlined, FilterOutlined, ColumnWidthOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const WorkHourList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [visibleColumns, setVisibleColumns] = useState({
    workDate: true,
    projectName: true,
    workHours: true,
    status: true,
    workContent: true,
    actions: true,
  });

  useEffect(() => {
    fetchWorkHours();
  }, [dateRange, statusFilter]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.getWorkHours({
        personCode: user.personCode,
        status: statusFilter || undefined,
      });
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
    if (record.status !== 'Pending') {
      message.warning('只能编辑待提交状态的工时记录');
      return;
    }
    setEditingItem(record);
    form.setFieldsValue({
      workHours: record.workHours,
      workContent: record.workContent,
    });
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      workHours: record.workHours,
      workContent: record.workContent,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await workHourAPI.deleteWorkHour(id);
      if (response.data.code === 200) {
        message.success('删除成功');
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleSubmit = async (id) => {
    try {
      const response = await workHourAPI.submitWorkHour(id);
      if (response.data.code === 200) {
        message.success('提交成功');
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '提交失败');
    }
  };

  const handleSaveEdit = async (values) => {
    try {
      const response = await workHourAPI.updateWorkHour(editingItem.id, {
        workHours: values.workHours,
        workContent: values.workContent,
      });
      if (response.data.code === 200) {
        message.success('修改成功');
        setIsModalVisible(false);
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '修改失败');
    }
  };

  const allColumns = [
    { key: 'workDate', title: '日期' },
    { key: 'projectName', title: '项目' },
    { key: 'workHours', title: '工时(小时)' },
    { key: 'status', title: '状态' },
    { key: 'workContent', title: '工作内容' },
    { key: 'actions', title: '操作' },
  ];

  const statusMap = {
    Pending: { label: '待提交', color: 'default' },
    Submitted: { label: '已提交', color: 'processing' },
    Approved: { label: '已审批', color: 'success' },
    Rejected: { label: '已驳回', color: 'error' },
  };

  const columns = useMemo(() => {
    const result = [];
    if (visibleColumns.workDate) {
      result.push({
        title: '日期',
        dataIndex: 'workDate',
        key: 'workDate',
        width: 120,
        render: (text) => dayjs(text).format('YYYY-MM-DD'),
      });
    }
    if (visibleColumns.projectName) {
      result.push({
        title: '项目',
        dataIndex: 'projectName',
        key: 'projectName',
        ellipsis: true,
        width: 180,
      });
    }
    if (visibleColumns.workHours) {
      result.push({
        title: '工时(小时)',
        dataIndex: 'workHours',
        key: 'workHours',
        width: 100,
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
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      });
    }
    if (visibleColumns.workContent) {
      result.push({
        title: '工作内容',
        dataIndex: 'workContent',
        key: 'workContent',
        ellipsis: true,
        width: 200,
      });
    }
    if (visibleColumns.actions) {
      result.push({
        title: '操作',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <div style={{ display: 'flex', gap: 8 }}>
            {record.status === 'Pending' && (
              <>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                >
                  编辑
                </Button>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                >
                  删除
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSubmit(record.id)}
                >
                  提交
                </Button>
              </>
            )}
            {record.status !== 'Pending' && (
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              >
                查看
              </Button>
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

  return (
    <Card
      style={{
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        boxShadow: 'none',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchOutlined style={{ color: '#999' }} />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 280 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#999' }} />
            <Select
              placeholder="全部"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
            >
              <Option value="">全部</Option>
              <Option value="Pending">待提交</Option>
              <Option value="Submitted">已提交</Option>
              <Option value="Approved">已审批</Option>
              <Option value="Rejected">已驳回</Option>
            </Select>
          </div>
        </div>
        <Dropdown menu={{ items: columnMenuItems }} trigger={['click']}>
          <Button type="default" icon={<ColumnWidthOutlined />}>
            列设置
          </Button>
        </Dropdown>
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
        title={editingItem?.status === 'Pending' ? '编辑工时' : '查看工时'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={editingItem?.status === 'Pending' ? null : <Button onClick={() => setIsModalVisible(false)}>关闭</Button>}
      >
        <Form
          form={form}
          onFinish={handleSaveEdit}
          layout="vertical"
        >
          <Form.Item
            label="工时"
            name="workHours"
            rules={[{ required: true, message: '请输入工时' }]}
          >
            <InputNumber
              min={0.5}
              max={8}
              step={0.5}
              style={{ width: '100%' }}
              suffix="小时"
              disabled={editingItem?.status !== 'Pending'}
            />
          </Form.Item>
          <Form.Item label="工作内容" name="workContent">
            <TextArea rows={3} disabled={editingItem?.status !== 'Pending'} />
          </Form.Item>
          {editingItem?.status === 'Pending' && (
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                保存修改
              </Button>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkHourList;
