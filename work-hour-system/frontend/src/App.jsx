import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import WorkHourForm from './pages/WorkHourForm';
import WorkHourList from './pages/WorkHourList';
import ApprovalList from './pages/ApprovalList';
import Statistics from './pages/Statistics';
import CustomLayout from './components/Layout';
import { useAuth } from './stores/authStore';
import './App.css';

function App() {
  const { isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = useState('workhour');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pathname = window.location.pathname;
    
    if (!token && pathname !== '/login') {
      setShowLogin(true);
    } else if (token && pathname === '/login') {
      window.location.href = '/';
    } else if (!token && pathname === '/login') {
      setShowLogin(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'workhour':
        return <WorkHourForm workDate={new Date()} onSubmit={() => {}} />;
      case 'history':
        return <WorkHourList />;
      case 'approval':
        return <ApprovalList />;
      case 'statistics':
        return <Statistics />;
      default:
        return <WorkHourForm workDate={new Date()} onSubmit={() => {}} />;
    }
  };

  if (showLogin || !isLoggedIn()) {
    return (
      <ConfigProvider locale={zhCN}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <CustomLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderContent()}
      </CustomLayout>
    </ConfigProvider>
  );
}

export default App;