import React, { useState, useEffect } from 'react';
import { Table, Card, message, Tag, Button, Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
import { workHourAPI, projectAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const WorkHourList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWorkHours();
    fetchProjects();
  }, [type, statusFilter]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error('请先登录');
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      if (!user.personCode) {
        message.error('用户信息无效');
        setLoading(false);
        return;
      }
      const params = { personCode: user.personCode };
      if (type === 'overtime') {
        params.workType = 'overtime';
      } else if (type === 'normal') {
        params.workType = 'normal';
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await workHourAPI.getWorkHours(params);
      if (response.data.code === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error('加载失败: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      workDate: dayjs(record.workDate),
      projectCode: record.projectCode,
      workType: record.workType,
      workHours: record.workHours,
      workContent: record.workContent,
    });
    setEditModalVisible(true);
  };

  const handleSubmitEdit = async () => {
    try {
      const values = await form.validateFields();
      const response = await workHourAPI.updateWorkHour(editingRecord.id, {
        workDate: values.workDate.format('YYYY-MM-DD'),
        projectCode: values.projectCode,
        workType: values.workType,
        workHours: values.workHours,
        workContent: values.workContent,
        status: 'Pending',
      });
      if (response.data.code === 200) {
        message.success('修改成功！请重新提交');
        setEditModalVisible(false);
        fetchWorkHours();
      }
    } catch (error) {
      message.error('修改失败: ' + (error.message || error));
    }
  };

  const handleResubmit = async (record) => {
    try {
      const response = await workHourAPI.submitWorkHour(record.id);
      if (response.data.code === 200) {
        message.success('重新提交成功！');
        fetchWorkHours();
      }
    } catch (error) {
      message.error('提交失败: ' + (error.message || error));
    }
  };

  const columns = [
    { title: '日期', dataIndex: 'workDate', key: 'workDate' },
    { title: '项目', dataIndex: 'projectName', key: 'projectName' },
    { title: '工时', dataIndex: 'workHours', key: 'workHours' },
    { 
      title: '类型', 
      dataIndex: 'workType', 
      key: 'workType',
      render: (text) => (
        <Tag color={text === 'overtime' ? 'orange' : 'green'}>
          {text === 'overtime' ? '加班' : '正常'}
        </Tag>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (text) => {
        let color = 'default';
        let label = text;
        if (text === 'Approved') {
          color = 'success';
          label = '已审批';
        } else if (text === 'Rejected') {
          color = 'error';
          label = '已驳回';
        } else if (text === 'Submitted') {
          color = 'processing';
          label = '待审批';
        } else if (text === 'Pending') {
          color = 'warning';
          label = '待提交';
        } else if (text === 'PMApproved') {
          color = 'orange';
          label = '项目经理已审批';
        }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    { title: '审批人', dataIndex: 'approverName', key: 'approverName', render: (text) => text || '-' },
    { title: '驳回原因', dataIndex: 'rejectReason', key: 'rejectReason', render: (text) => text || '-' },
    { title: '工作内容', dataIndex: 'workContent', key: 'workContent' },
    { 
      title: '操作', 
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {record.status === 'Rejected' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                修改
              </Button>
            </>
          )}
          {(record.status === 'Pending' || record.status === 'Rejected') && (
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={() => handleResubmit(record)}
            >
              提交
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <>
      <Card title="工时记录">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button
            type={statusFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('all')}
          >
            全部
          </Button>
          <Button
            type={statusFilter === 'Pending' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('Pending')}
          >
            待提交
          </Button>
          <Button
            type={statusFilter === 'Submitted' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('Submitted')}
          >
            待审批
          </Button>
          <Button
            type={statusFilter === 'Approved' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('Approved')}
          >
            已审批
          </Button>
          <Button
            type={statusFilter === 'Rejected' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('Rejected')}
          >
            已驳回
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="修改工时记录"
        open={editModalVisible}
        onOk={handleSubmitEdit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="workDate"
            label="工作日期"
            rules={[{ required: true, message: '请选择工作日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="projectCode"
            label="项目"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目">
              {projects.map((project) => (
                <Option key={project.projectCode} value={project.projectCode}>
                  {project.projectName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="workType"
            label="工时类型"
            rules={[{ required: true, message: '请选择工时类型' }]}
          >
            <Select placeholder="请选择工时类型">
              <Option value="normal">正常工时</Option>
              <Option value="overtime">加班</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="workHours"
            label="工时（小时）"
            rules={[
              { required: true, message: '请输入工时' },
              { type: 'number', min: 0.5, max: 24, message: '工时必须在0.5-24小时之间' }
            ]}
          >
            <InputNumber min={0.5} max={24} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="workContent"
            label="工作内容"
            rules={[{ required: true, message: '请输入工作内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述您的工作内容" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkHourList;
