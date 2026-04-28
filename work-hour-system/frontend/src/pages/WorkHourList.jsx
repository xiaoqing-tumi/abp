import { useState, useEffect } from 'react';
import { Table, Button, DatePicker, Tag, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI } from '../utils/api';

const { RangePicker } = DatePicker;

const WorkHourList = ({ onRefresh }) => {
  const [workHours, setWorkHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  useEffect(() => {
    fetchWorkHours();
  }, [dateRange]);

  const fetchWorkHours = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      };
      const response = await workHourAPI.getWorkHours(params);
      if (response.data.code === 200) {
        setWorkHours(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await workHourAPI.deleteWorkHour(id);
      if (response.data.code === 200) {
        message.success('删除成功');
        fetchWorkHours();
        if (onRefresh) onRefresh();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleSubmit = async (id) => {
    try {
      const response = await workHourAPI.submitWorkHour(id);
      if (response.data.code === 200) {
        message.success('提交成功');
        fetchWorkHours();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '提交失败');
    }
  };

  const statusMap = {
    draft: { label: '草稿', color: 'orange' },
    submitted: { label: '待审批', color: 'blue' },
    approved: { label: '已审批', color: 'green' },
    rejected: { label: '已驳回', color: 'red' },
  };

  const workTypeMap = {
    normal: '正常',
    overtime: '加班',
    leave: '请假',
    trip: '出差',
  };

  const columns = [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {record.status === 'draft' && (
            <>
              <Button icon={<EditOutlined />} size="small" />
              <Popconfirm
                title="确定删除？"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
              <Button
                icon={<SendOutlined />}
                size="small"
                type="primary"
                onClick={() => handleSubmit(record.id)}
              >
                提交
              </Button>
            </>
          )}
          {record.status !== 'draft' && (
            <Button icon={<EyeOutlined />} size="small" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
        />
        <Button onClick={fetchWorkHours} loading={loading}>
          刷新
        </Button>
      </div>
      <Table
        dataSource={workHours}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default WorkHourList;