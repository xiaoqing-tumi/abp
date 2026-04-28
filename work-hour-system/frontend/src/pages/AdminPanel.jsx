import { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, FolderOpenOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { basicDataAPI, workHourAPI } from '../utils/api';

const { Option } = Select;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const roles = [
    { value: 'Admin', label: '管理员' },
    { value: 'Director', label: '高管' },
    { value: 'DeptManager', label: '部门经理' },
    { value: 'PM', label: '项目经理' },
    { value: 'HRAttendance', label: 'HR专员' },
    { value: 'Employee', label: '普通员工' },
  ];

  const departments = [
    { value: 'TECH', label: '技术部' },
    { value: 'PROD', label: '产品部' },
    { value: 'MKT', label: '市场部' },
    { value: 'HR', label: '人力资源部' },
    { value: 'FIN', label: '财务部' },
  ];

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchProjects();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await basicDataAPI.getPersons();
      if (response.data.code === 200) {
        setUsers(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await basicDataAPI.getAllProjects();
      if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.name,
      departmentId: record.departmentId,
      role: record.role,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (personCode) => {
    try {
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSave = async (values) => {
    try {
      message.success('保存成功');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleSyncData = () => {
    message.success('数据同步完成');
    fetchUsers();
    fetchProjects();
  };

  const userColumns = [
    {
      title: '工号',
      dataIndex: 'personCode',
      key: 'personCode',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (text) => roles.find(r => r.value === text)?.label || text,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (text === 1 ? '在职' : '离职'),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
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
          >
            查看
          </Button>
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
            onClick={() => handleDelete(record.personCode)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const projectColumns = [
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
    },
    {
      title: '项目经理',
      dataIndex: 'managerName',
      key: 'managerName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (text === 1 ? '进行中' : '已结束'),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="text" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="text" danger size="small" icon={<DeleteOutlined />}>删除</Button>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={activeTab === 'users' ? 'primary' : 'default'}
            onClick={() => setActiveTab('users')}
            icon={<TeamOutlined />}
          >
            用户管理
          </Button>
          <Button
            type={activeTab === 'projects' ? 'primary' : 'default'}
            onClick={() => setActiveTab('projects')}
            icon={<FolderOpenOutlined />}
          >
            项目管理
          </Button>
        </div>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={handleSyncData}
        >
          同步数据
        </Button>
      </Row>

      {activeTab === 'users' && (
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="personCode"
          loading={loading}
          bordered={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      )}

      {activeTab === 'projects' && (
        <Table
          columns={projectColumns}
          dataSource={projects}
          rowKey="projectCode"
          loading={loading}
          bordered={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      )}

      <Modal
        title={editingItem ? '编辑用户' : '添加用户'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="部门"
            name="departmentId"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select>
              {departments.map((dept) => (
                <Option key={dept.value} value={dept.value}>
                  {dept.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value={1}>在职</Option>
              <Option value={0}>离职</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminPanel;