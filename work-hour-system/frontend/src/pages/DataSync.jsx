import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Statistic, message, Spin, Tag, Progress, Descriptions } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, DatabaseOutlined, TeamOutlined, FolderOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { basicDataAPI } from '../utils/api';

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
      const response = await fetch('/api/v1/sync/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('获取同步状态失败', error);
    }
  };

  const fetchSyncLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/sync/logs?page=1&pageSize=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setSyncLogs(data.data.list);
      }
    } catch (error) {
      message.error('获取同步日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/v1/sync/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/v1/sync/manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        message.success('手动同步成功');
        fetchSyncStatus();
        fetchSyncLogs();
        fetchStatistics();
      } else {
        message.error(data.message || '同步失败');
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
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
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
      title: '消息',
      dataIndex: 'message',
      key: 'message',
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
                <SyncOutlined spin={syncStatus?.isSyncing} />
                <span>同步状态</span>
              </div>
            }
            extra={
              <Button
                type="primary"
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleManualSync}
                loading={syncing}
                disabled={syncStatus?.isSyncing}
              >
                手动同步
              </Button>
            }
            style={{ borderRadius: 8 }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Statistic
                  title="上次同步时间"
                  value={syncStatus?.lastSyncTime || '暂无'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="下次同步时间"
                  value={syncStatus?.nextSyncTime || '等待中'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="同步状态"
                  value={syncStatus?.isSyncing ? '同步中' : '空闲'}
                  valueStyle={{ color: syncStatus?.isSyncing ? '#1890ff' : '#52c41a' }}
                  prefix={syncStatus?.isSyncing ? <SyncOutlined spin /> : <CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="数据统计" style={{ borderRadius: 8 }}>
            {statistics && (
              <Row gutter={24}>
                <Col span={4}>
                  <Statistic
                    title="人员数据"
                    value={statistics.dataCounts.persons}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Statistic
                    title="项目数据"
                    value={statistics.dataCounts.projects}
                    prefix={<FolderOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Statistic
                    title="项目成员关系"
                    value={statistics.dataCounts.projectMembers}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Statistic
                    title="考勤数据"
                    value={statistics.dataCounts.attendances}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Statistic
                    title="工时记录"
                    value={statistics.dataCounts.workHours}
                    prefix={<DatabaseOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Statistic
                    title="OA流程快照"
                    value={statistics.dataCounts.oaProcesses}
                    prefix={<DatabaseOutlined />}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="同步统计" style={{ borderRadius: 8 }}>
            {statistics && (
              <Row gutter={24}>
                <Col span={12}>
                  <Statistic
                    title="今日同步次数"
                    value={statistics.todaySyncCount}
                    suffix={`次`}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Progress
                      percent={statistics.todaySyncCount > 0 ? (statistics.todaySuccessCount / statistics.todaySyncCount * 100) : 0}
                      status="active"
                      format={() => `成功率 ${statistics.todaySyncCount > 0 ? (statistics.todaySuccessCount / statistics.todaySyncCount * 100).toFixed(0) : 0}%`}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总同步次数"
                    value={statistics.totalSyncCount}
                    suffix={`次`}
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
                        value={statistics.failCount}
                        valueStyle={{ color: '#ff4d4f', fontSize: 16 }}
                      />
                    </Col>
                  </Row>
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
