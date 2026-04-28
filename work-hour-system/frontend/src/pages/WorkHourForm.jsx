import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Card, Row, Col, message, Statistic } from 'antd';
import { PlusOutlined, SaveOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI, basicDataAPI } from '../utils/api';

const { Option } = Select;

const WorkHourForm = ({ workDate, onSubmit }) => {
  const [projects, setProjects] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [lockedDate, setLockedDate] = useState(null);
  const [pendingProcesses, setPendingProcesses] = useState([]);

  const maxHours = 8;
  const remainingHours = maxHours - todayHours;

  useEffect(() => {
    basicDataAPI.getMyProjects().then((response) => {
      if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    });

    basicDataAPI.getPendingOaProcesses().then((response) => {
      if (response.data.code === 200) {
        const pending = response.data.data || [];
        setPendingProcesses(pending);
        const today = dayjs().format('YYYY-MM-DD');
        const todayPending = pending.find(p => dayjs(p.processDate).format('YYYY-MM-DD') === today);
        if (todayPending) {
          setLockedDate(todayPending);
        }
      }
    });

    fetchTodayHours();
  }, []);

  const fetchTodayHours = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const response = await workHourAPI.getWorkHours({ startDate: today, endDate: today });
      if (response.data.code === 200) {
        const hours = response.data.data.reduce((sum, item) => sum + (item.hours || 0), 0);
        setTodayHours(hours);
      }
    } catch (error) {
      console.error('Failed to fetch today hours:', error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ workDate: dayjs(workDate) });
  }, [workDate, form]);

  const handleSubmit = async (values) => {
    if (values.hours > remainingHours) {
      message.error(`今日剩余可填报工时为 ${remainingHours} 小时`);
      return;
    }

    setLoading(true);
    try {
      const response = await workHourAPI.createWorkHour({
        projectCode: values.projectCode,
        workDate: values.workDate.toDate(),
        hours: values.hours,
        description: values.description,
        workType: values.workType,
      });

      if (response.data.code === 200) {
        message.success('工时填报成功');
        form.resetFields();
        fetchTodayHours();
        if (onSubmit) {
          onSubmit();
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Statistic
              title="今日已填报"
              value={todayHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Statistic
              title="剩余可填"
              value={remainingHours}
              suffix="小时"
              prefix={<CalendarOutlined style={{ color: remainingHours > 0 ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: remainingHours > 0 ? '#52c41a' : '#ff4d4f', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Statistic
              title="标准工时"
              value={maxHours}
              suffix="小时"
              valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Statistic
              title="待审批OA流程"
              value={pendingProcesses.length}
              suffix="条"
              valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {lockedDate && (
        <Card
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: '2px solid #faad14',
            boxShadow: '0 4px 12px rgba(250, 173, 20, 0.1)',
          }}
        >
          <div style={{ padding: 16, background: '#fffbe6', borderRadius: 8 }}>
            <p style={{ marginBottom: 8, fontWeight: 'bold', color: '#fa8c16' }}>
              ⚠️ 今日因{lockedDate.type === 'leave' ? '请假' : '出差'}申请审批中，工时已由系统自动生成
            </p>
            <p style={{ color: '#d48806' }}>
              流程类型：{lockedDate.type === 'leave' ? '请假' : '出差'}
              {' | '}时长：{lockedDate.durationHours}小时
              {' | '}状态：待审批
            </p>
            <p style={{ marginTop: 8, color: '#fa8c16', fontSize: '12px' }}>
              提示：您无法手动填报当日工时，待审批完成后由HR/部门经理统一调整
            </p>
          </div>
        </Card>
      )}

      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 24, background: '#1890ff', borderRadius: 2 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>填报工时</span>
            </div>
          </div>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            hours: 1,
            workType: 'normal',
            description: '',
          }}
          disabled={!!lockedDate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="项目"
                name="projectCode"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select
                  placeholder="请选择您参与的项目"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {projects.map((project) => (
                    <Option key={project.projectCode} value={project.projectCode}>
                      {project.projectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="日期"
                name="workDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker
                  disabledDate={(current) => {
                    return current && (current > dayjs() || current < dayjs().subtract(1, 'day'));
                  }}
                  style={{ width: '100%' }}
                  placeholder="选择日期"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="工时"
                name="hours"
                rules={[{ required: true, message: '请输入工时' }]}
              >
                <InputNumber
                  min={0.5}
                  max={remainingHours > 0 ? remainingHours : 8}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="请输入工时"
                  suffix="小时"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="工作类型"
                name="workType"
              >
                <Select defaultValue="normal" style={{ width: '100%' }} size="large">
                  <Option value="normal">正常工时</Option>
                  <Option value="overtime">加班</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="工作描述"
            name="description"
          >
            <Input.TextArea
              placeholder="请简要描述今日工作内容..."
              rows={4}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<SaveOutlined />}
              disabled={!!lockedDate}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 500,
                background: '#1890ff',
                borderRadius: 8,
              }}
            >
              {lockedDate ? '当日工时已被锁定' : '保存工时'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WorkHourForm;