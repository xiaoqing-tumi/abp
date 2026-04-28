import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  MoreOutlined,
  HomeOutlined,
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
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
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
    { key: 'workhour', label: '工时填报', icon: <ClockCircleOutlined /> },
    { key: 'history', label: '工时历史', icon: <FileTextOutlined /> },
    { key: 'approval', label: '工时审批', icon: <CheckSquareOutlined /> },
    { key: 'statistics', label: '统计分析', icon: <BarChartOutlined /> },
  ],
};

const getPageTitle = (page) => {
  const titles = {
    workhour: '工时填报',
    history: '工时历史',
    approval: '审批管理',
    statistics: '统计分析',
  };
  return titles[page] || '工时填报';
};

const CustomLayout = ({ currentPage, onPageChange, children }) => {
  const { logout, getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        window.location.href = '/login';
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: '#0a1628',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#1890ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>工时填报系统</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Work Hour System</div>
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => onPageChange(key)}
          style={{
            borderRight: 'none',
            marginTop: 16,
            background: 'transparent',
          }}
          theme="dark"
        >
          {(roleMenus[user?.role] || roleMenus.Employee).map((item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{
                margin: '4px 8px',
                borderRadius: 8,
                color: '#fff',
                transition: 'all 0.3s',
              }}
            >
              <span>{item.label}</span>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'fixed',
            right: 0,
            left: 220,
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HomeOutlined style={{ color: '#999' }} />
            <span style={{ color: '#999' }}>/</span>
            <span style={{ color: '#1890ff', fontWeight: 500 }}>{getPageTitle(currentPage)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {user?.role === 'Admin' && '管理员'}
                {user?.role === 'Director' && '高管'}
                {user?.role === 'DeptManager' && '部门经理'}
                {user?.role === 'PM' && '项目经理'}
                {user?.role === 'HRAttendance' && 'HR专员'}
                {user?.role === 'Employee' && '普通员工'}
              </div>
            </div>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e8e8e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                <Avatar size={28} icon={<UserOutlined />} />
                <MoreOutlined style={{ fontSize: 14, color: '#999' }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            padding: '24px',
            background: '#f5f7fa',
            minHeight: '100vh',
            marginTop: 64,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;