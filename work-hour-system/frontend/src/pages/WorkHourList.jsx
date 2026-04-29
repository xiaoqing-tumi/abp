import { useState, useEffect } from 'react';
import { Table, Card, message, Tag } from 'antd';
import { workHourAPI } from '../utils/api';

const WorkHourList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkHours();
  }, [type]);

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
        const color = text === 'Approved' ? 'success' : text === 'Rejected' ? 'error' : 'processing';
        return <Tag color={color}>{text === 'Approved' ? '已审批' : text === 'Rejected' ? '已驳回' : '待审批'}</Tag>;
      }
    },
    { title: '审批人', dataIndex: 'approverName', key: 'approverName', render: (text) => text || '-' },
    { title: '驳回原因', dataIndex: 'rejectReason', key: 'rejectReason', render: (text) => text || '-' },
    { title: '工作内容', dataIndex: 'workContent', key: 'workContent' },
  ];

  return (
    <Card title="工时记录">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default WorkHourList;
