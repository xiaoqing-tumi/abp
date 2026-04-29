import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import WorkHourForm from './pages/WorkHourForm';
import WorkHourList from './pages/WorkHourList';
import ApprovalList from './pages/ApprovalList';
import Statistics from './pages/Statistics';
import AdminPanel from './pages/AdminPanel';
import DataSync from './pages/DataSync';
import CustomLayout from './components/Layout';
import { useAuth } from './stores/authStore';
import './App.css';

function App() {
  const { isLoggedIn, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('workhour');
  const [listType, setListType] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handlePageChange = (page) => {
    if (page === 'overtime') {
      setListType('overtime');
      setCurrentPage('history');
    } else if (page === 'history') {
      setListType(null);
      setCurrentPage('history');
    } else {
      setListType(null);
      setCurrentPage(page);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'workhour':
        return <WorkHourForm workDate={new Date()} onSubmit={() => {}} />;
      case 'history':
        return <WorkHourList type={listType} />;
      case 'approval':
        return <ApprovalList />;
      case 'statistics':
        return <Statistics onPageChange={handlePageChange} />;
      case 'admin':
        return <AdminPanel />;
      case 'sync':
        return <DataSync />;
      default:
        return <WorkHourForm workDate={new Date()} onSubmit={() => {}} />;
    }
  };

  if (showLogin) {
    return (
      <ConfigProvider locale={zhCN}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <CustomLayout 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      >
        {renderContent()}
      </CustomLayout>
    </ConfigProvider>
  );
}

export default App;
