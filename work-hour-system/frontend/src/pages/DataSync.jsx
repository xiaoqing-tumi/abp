import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Statistic, message, Tag, Progress } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, DatabaseOutlined, TeamOutlined, FolderOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { syncAPI } from '../utils/api';

const DataSync = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchSyncStatus();
    fetchSyncLogs();
    fetchStatistics();
    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await syncAPI.getStatus();
      if (response.data.code === 200) {
        setSyncStatus(response.data.data);
      }
    } catch (error) {
      console.error('获取同步状态失败', error);
    }
  };

  const fetchSyncLogs = async () => {
    setLoading(true);
    try {
      const response = await syncAPI.getLogs({ limit: 20 });
      if (response.data.code === 200) {
        setSyncLogs(response.data.data);
      }
    } catch (error) {
      message.error('获取同步日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await syncAPI.getStatistics();
      if (response.data.code === 200) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await syncAPI.manualSync();
      if (response.data.code === 200) {
        message.success('手动同步成功');
        fetchSyncStatus();
        fetchSyncLogs();
        fetchStatistics();
      } else {
        message.error(response.data.message || '同步失败');
      }
    } catch (error) {
      message.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const logColumns = [
    {
      title: '同步时间',
      dataIndex: 'syncTime',
      key: 'syncTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '同步类型',
      dataIndex: 'syncType',
      key: 'syncType',
      width: 100,
      render: (text) => (
        <Tag color={text === '手动同步' ? 'blue' : 'green'}>{text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text) => (
        <Tag color={text === '成功' ? 'success' : 'error'} icon={text === '成功' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 80,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SyncOutlined spin={syncStatus?.isRunning} />
                <span>同步状态</span>
              </div>
            }
            extra={
              <Button
                type="primary"
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleManualSync}
                loading={syncing}
                disabled={syncStatus?.isRunning}
              >
                手动同步
              </Button>
            }
            style={{ borderRadius: 8 }}
          >
            <Row gutter={24}>
              <Col span={6}>
                <Statistic
                  title="上次同步时间"
                  value={syncStatus?.lastSyncTime || '暂无'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="下次同步时间"
                  value={syncStatus?.nextSyncTime || '等待中'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="同步状态"
                  value={syncStatus?.isRunning ? '同步中' : '空闲'}
                  valueStyle={{ color: syncStatus?.isRunning ? '#1890ff' : '#52c41a' }}
                  prefix={syncStatus?.isRunning ? <SyncOutlined spin /> : <CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总记录数"
                  value={syncStatus?.totalRecords || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="同步统计" style={{ borderRadius: 8 }}>
            {statistics && (
              <Row gutter={24}>
                <Col span={12}>
                  <Statistic
                    title="总同步次数"
                    value={statistics.totalSyncs}
                    suffix="次"
                  />
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Statistic
                        title="成功"
                        value={statistics.successCount}
                        valueStyle={{ color: '#52c41a', fontSize: 16 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="失败"
                        value={statistics.failedCount}
                        valueStyle={{ color: '#ff4d4f', fontSize: 16 }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <Progress
                      percent={statistics.totalSyncs > 0 ? (statistics.successCount / statistics.totalSyncs * 100) : 0}
                      status="active"
                      format={() => `成功率 ${statistics.totalSyncs > 0 ? (statistics.successCount / statistics.totalSyncs * 100).toFixed(0) : 0}%`}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总记录数"
                    value={statistics.totalRecords}
                    suffix="条"
                  />
                  <Statistic
                    title="平均耗时"
                    value={statistics.avgDuration}
                    style={{ marginTop: 16 }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="同步日志" style={{ borderRadius: 8 }}>
            <Table
              columns={logColumns}
              dataSource={syncLogs}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataSync;
