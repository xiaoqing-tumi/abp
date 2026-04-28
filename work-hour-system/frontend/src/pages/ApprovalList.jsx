import { useState, useEffect } from 'react';
import { Table, Button, Tag, message, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const ApprovalList = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await workHourAPI.getPendingApprovals();
      if (response.data.code === 200) {
        setApprovals(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await workHourAPI.approveWorkHour(id);
      if (response.data.code === 200) {
        message.success('审批通过');
        fetchApprovals();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '审批失败');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await workHourAPI.rejectWorkHour(id);
      if (response.data.code === 200) {
        message.success('已驳回');
        fetchApprovals();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '驳回失败');
    }
  };

  const workTypeMap = {
    normal: '正常',
    overtime: '加班',
    leave: '请假',
    trip: '出差',
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'personName',
      key: 'personName',
    },
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours) => `${hours}小时`,
    },
    {
      title: '类型',
      dataIndex: 'workType',
      key: 'workType',
      render: (type) => workTypeMap[type] || type,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EyeOutlined />} size="small" />
          <Popconfirm
            title="确定通过？"
            onConfirm={() => handleApprove(record.id)}
          >
            <Button icon={<CheckOutlined />} size="small" type="primary" />
          </Popconfirm>
          <Popconfirm
            title="确定驳回？"
            onConfirm={() => handleReject(record.id)}
          >
            <Button icon={<CloseOutlined />} size="small" danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>待审批工时列表</h3>
        <Button onClick={fetchApprovals} loading={loading}>
          刷新
        </Button>
      </div>
      <Table
        dataSource={approvals}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ApprovalList;