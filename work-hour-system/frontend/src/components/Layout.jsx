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
  SettingOutlined,
  SyncOutlined,
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
    { key: 'statistics', label: '个人统计', icon: <BarChartOutlined /> },
    { key: 'adminStats', label: '全公司统计', icon: <BarChartOutlined /> },
    { key: 'admin', label: '系统管理', icon: <SettingOutlined /> },
    { key: 'sync', label: '数据同步', icon: <SyncOutlined /> },
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
    statistics: '个人统计',
    adminStats: '全公司统计',
    admin: '系统管理',
    sync: '数据同步',
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

  const menuItems = (roleMenus[user?.role] || roleMenus.Employee).map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider
        width={200}
        style={{
          background: '#fff',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#1890ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f' }}>工时填报系统</div>
              <div style={{ fontSize: 10, color: '#999' }}>Work Hour System</div>
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => onPageChange(key)}
          items={menuItems}
          style={{
            borderRight: 'none',
            marginTop: 8,
            background: 'transparent',
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'fixed',
            right: 0,
            left: 200,
            top: 0,
            zIndex: 99,
            height: 56,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HomeOutlined style={{ color: '#999', fontSize: 16 }} />
            <span style={{ color: '#999' }}>/</span>
            <span style={{ color: '#1890ff', fontWeight: 500 }}>{getPageTitle(currentPage)}</span>
          </div>

          <Dropdown
            menu={{ 
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1f1f1f', marginBottom: 4 }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {user?.role === 'Admin' && '管理员'}
                        {user?.role === 'Director' && '高管'}
                        {user?.role === 'DeptManager' && '部门经理'}
                        {user?.role === 'PM' && '项目经理'}
                        {user?.role === 'HRAttendance' && 'HR专员'}
                        {user?.role === 'Employee' && '普通员工'}
                      </div>
                      <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
                        {user?.email}
                      </div>
                    </div>
                  ),
                  onClick: () => {},
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout();
                    window.location.href = '/login';
                  },
                },
              ]
            }}
            placement="bottomRight"
            overlayStyle={{
              width: 280,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              border: 'none',
              padding: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '6px 12px',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Avatar 
                size={32} 
                icon={<UserOutlined style={{ fontSize: 16 }} />}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {user?.role === 'Admin' && '管理员'}
                  {user?.role === 'Director' && '高管'}
                  {user?.role === 'DeptManager' && '部门经理'}
                  {user?.role === 'PM' && '项目经理'}
                  {user?.role === 'HRAttendance' && 'HR专员'}
                  {user?.role === 'Employee' && '普通员工'}
                </div>
              </div>
              <MoreOutlined style={{ fontSize: 14, color: '#bfbfbf' }} />
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: '20px',
            background: '#f0f2f5',
            minHeight: '100vh',
            marginTop: 56,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
