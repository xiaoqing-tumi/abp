import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../utils/api';

const { Option } = Select;

const Login = ({ onLoginSuccess, onLogin }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    authAPI.getUsers().then((response) => {
      if (response.data.code === 200) {
        setUsers(response.data.data);
      }
    });
  }, []);

  const handleSubmit = async (values) => {
    const personCode = selectedUser || values.personCode;
    if (!personCode) {
      message.error('请选择或输入工号');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(personCode);
      if (response.data.code === 200) {
        const data = response.data.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        message.success('登录成功');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (value) => {
    setSelectedUser(value);
    form.setFieldsValue({ personCode: '' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card
        style={{ width: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        title={
          <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
            人员工时填报系统
          </div>
        }
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="选择用户（模拟登录）">
            <Select
              placeholder="选择一个用户进行模拟登录"
              style={{ width: '100%' }}
              value={selectedUser}
              onChange={handleUserSelect}
            >
              <Option value="">请选择用户</Option>
              {users.map((user) => (
                <Option key={user.personCode} value={user.personCode}>
                  {user.name} ({user.personCode}) - {user.departmentName} - {user.role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="或手动输入工号">
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入工号"
              name="personCode"
              disabled={selectedUser !== ''}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              icon={<LockOutlined />}
            >
              {loading ? <Spin size="small" /> : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px solid #e8e8e8' }}>
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
            提示：选择任意用户即可登录体验系统功能
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;