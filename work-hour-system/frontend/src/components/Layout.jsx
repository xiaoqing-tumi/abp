import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../stores/authStore';

const { Sider, Header, Content } = Layout;

const roleMenus = {
  Employee: [
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
  PM: [
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'approval', label: '工时审批', icon: <CheckSquareOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
  DeptManager: [
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'approval', label: '工时审批', icon: <CheckSquareOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
  HRAttendance: [
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'approval', label: '工时审批', icon: <CheckSquareOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
  Admin: [
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'approval', label: '工时审批', icon: <CheckSquareOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
  Director: [
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
};

const CustomLayout = ({ currentPage, onPageChange, children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menus = roleMenus[user?.role] || roleMenus.Employee;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
          退出登录
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: '#001529' }}
      >
        <div className="logo" style={{ padding: 16, color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          {collapsed ? '工时' : '工时填报系统'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => onPageChange(key)}
          style={{ backgroundColor: '#001529', color: '#fff' }}
        >
          {menus.map((menu) => (
            <Menu.Item key={menu.key} icon={menu.icon}>
              {menu.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0 }}>{getPageTitle(currentPage)}</h2>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '0 24px' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: '#fff' }}>
                {user?.name} ({user?.role})
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

function getPageTitle(page) {
  const titles = {
    workhour: '工时填报',
    history: '工时历史',
    approval: '工时审批',
    statistics: '统计分析',
  };
  return titles[page] || '工时填报系统';
}

export default CustomLayout;