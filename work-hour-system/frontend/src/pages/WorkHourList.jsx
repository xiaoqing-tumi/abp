import { useState, useEffect } from 'react';
import { Table, Button, DatePicker, Select, Card, Row, Col, message, Modal, Form, Input, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const WorkHourList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWorkHours();
  }, [dateRange, statusFilter]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const response = await workHourAPI.getWorkHours({
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        status: statusFilter || undefined,
      });
      if (response.data.code === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    if (record.status !== 'draft') {
      message.warning('只能编辑草稿状态的工时记录');
      return;
    }
    setEditingItem(record);
    form.setFieldsValue({
      hours: record.hours,
      description: record.description,
      workType: record.workType,
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
        hours: values.hours,
        description: values.description,
        workType: values.workType,
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

  const columns = [
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
      render: (text) => (
        <span className={text === 'overtime' ? 'text-warning' : ''}>
          {text === 'normal' ? '正常工时' : '加班'}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => {
        const statusMap = {
          draft: { label: '草稿', color: 'default' },
          submitted: { label: '已提交', color: 'processing' },
          approved: { label: '已审批', color: 'success' },
        };
        const status = statusMap[text] || { label: text, color: 'default' };
        return (
          <span className={`ant-tag ant-tag-${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (text) => (text === 'auto' ? '系统自动' : '手动填报'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {record.status === 'draft' && (
            <>
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Button
                danger
                ghost
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
          {record.status !== 'draft' && (
            <Button
              ghost
              size="small"
              icon={<EyeOutlined />}
            >
              查看
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)', borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>工时历史</span>
        </div>
      }
      style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
    >
      <Row gutter={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </Col>
        <Col>
          <Select
            placeholder="状态筛选"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
          >
            <Option value="">全部</Option>
            <Option value="draft">草稿</Option>
            <Option value="submitted">已提交</Option>
            <Option value="approved">已审批</Option>
          </Select>
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
        style={{ background: '#fff' }}
      />

      <Modal
        title="编辑工时"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSaveEdit}
          layout="vertical"
        >
          <Form.Item
            label="工时"
            name="hours"
            rules={[{ required: true, message: '请输入工时' }]}
          >
            <InputNumber
              min={0.5}
              max={8}
              step={0.5}
              style={{ width: '100%' }}
              suffix="小时"
            />
          </Form.Item>
          <Form.Item label="工作类型" name="workType">
            <Select defaultValue="normal" style={{ width: '100%' }}>
              <Option value="normal">正常工时</Option>
              <Option value="overtime">加班</Option>
            </Select>
          </Form.Item>
          <Form.Item label="工作描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkHourList;