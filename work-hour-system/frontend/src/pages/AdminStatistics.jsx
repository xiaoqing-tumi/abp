import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, message, Table } from 'antd';
import { BarChartOutlined, UserOutlined, ClockCircleOutlined, ArrowUpOutlined, TeamOutlined, FolderOutlined, BankOutlined } from '@ant-design/icons';
import { statisticsAPI } from '../utils/api';

const AdminStatistics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanyStatistics();
  }, []);

  const fetchCompanyStatistics = async () => {
    setLoading(true);
    try {
      const response = await statisticsAPI.getCompanyStatistics();
      if (response.data.code === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const personColumns = [
    { title: '员工姓名', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '总工时(小时)', dataIndex: 'totalHours', key: 'totalHours' },
    { title: '正常工时', dataIndex: 'normalHours', key: 'normalHours' },
    { title: '加班工时', dataIndex: 'overtimeHours', key: 'overtimeHours' },
    { title: '记录数', dataIndex: 'count', key: 'count' },
  ];

  const departmentColumns = [
    { title: '部门名称', dataIndex: 'name', key: 'name' },
    { title: '总工时(小时)', dataIndex: 'totalHours', key: 'totalHours' },
  ];

  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '总工时(小时)', dataIndex: 'totalHours', key: 'totalHours' },
    { title: '记录数', dataIndex: 'count', key: 'count' },
  ];

  if (!data) {
    return (
      <Card loading={loading}>
        <div>加载中...</div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChartOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>全公司工时统计</span>
        </div>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="总工时"
              value={data.totalHours || 0}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="正常工时"
              value={data.normalHours || 0}
              suffix="小时"
              prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="加班工时"
              value={data.overtimeHours || 0}
              suffix="小时"
              prefix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="员工人数"
              value={data.employeeCount || 0}
              suffix="人"
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="总记录数"
              value={data.totalRecords || 0}
              suffix="条"
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="已审批"
              value={data.approvedCount || 0}
              suffix="条"
              prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{ borderRadius: 6, border: '1px solid #f0f0f0', boxShadow: 'none' }}
          >
            <Statistic
              title="待审批"
              value={data.submittedCount || 0}
              suffix="条"
              prefix={<ArrowUpOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 500 }}>员工工时排行</span>
          </div>
        </div>
        <Table
          columns={personColumns}
          dataSource={data.personList}
          rowKey="name"
          bordered={false}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BankOutlined style={{ color: '#722ed1' }} />
                <span style={{ fontWeight: 500 }}>部门工时统计</span>
              </div>
            </div>
            <Table
              columns={departmentColumns}
              dataSource={data.departmentList}
              rowKey="name"
              bordered={false}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderOutlined style={{ color: '#fa8c16' }} />
                <span style={{ fontWeight: 500 }}>项目工时统计</span>
              </div>
            </div>
            <Table
              columns={projectColumns}
              dataSource={data.projectList}
              rowKey="name"
              bordered={false}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminStatistics;
