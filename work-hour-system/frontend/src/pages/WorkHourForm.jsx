import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Card, Row, Col, message, Statistic } from 'antd';
import { PlusOutlined, SaveOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI, basicDataAPI } from '../utils/api';

const { Option } = Select;
const { TextArea } = Input;

const WorkHourForm = ({ workDate, onSubmit }) => {
  const [projects, setProjects] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDateHours, setSelectedDateHours] = useState(0);
  const [selectedDateOvertimeHours, setSelectedDateOvertimeHours] = useState(0);
  const [allWorkHours, setAllWorkHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs(workDate));
  const [workType, setWorkType] = useState('normal');

  const maxNormalHours = 8;
  const remainingNormalHours = maxNormalHours - selectedDateHours;

  useEffect(() => {
    basicDataAPI.getMyProjects().then((response) => {
      if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    });
    fetchAllWorkHours();
  }, []);

  const fetchAllWorkHours = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await workHourAPI.getWorkHours({ personCode: user.personCode });
      if (response.data.code === 200) {
        setAllWorkHours(response.data.data);
        calculateSelectedDateHours(response.data.data, dayjs(workDate));
      }
    } catch (error) {
      console.error('Failed to fetch work hours:', error);
    }
  };

  const calculateSelectedDateHours = (workHoursData, date) => {
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    const dateRecords = workHoursData.filter(item => 
      dayjs(item.workDate).format('YYYY-MM-DD') === targetDate
    );
    
    const normalHours = dateRecords.filter(item => !item.workType || item.workType === 'normal')
      .reduce((sum, item) => sum + (item.workHours || 0), 0);
    const overtimeHours = dateRecords.filter(item => item.workType === 'overtime')
      .reduce((sum, item) => sum + (item.workHours || 0), 0);
    
    setSelectedDateHours(normalHours);
    setSelectedDateOvertimeHours(overtimeHours);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    calculateSelectedDateHours(allWorkHours, date);
    form.setFieldsValue({ workType: 'normal' });
    setWorkType('normal');
  };

  const handleWorkTypeChange = (value) => {
    setWorkType(value);
  };

  useEffect(() => {
    form.setFieldsValue({ workDate: dayjs(workDate) });
    setSelectedDate(dayjs(workDate));
  }, [workDate, form]);

  const handleSubmit = async (values) => {
    const hours = values.workHours;
    
    if (values.workType === 'normal' && hours > remainingNormalHours) {
      message.error(`${dayjs(values.workDate).format('YYYY-MM-DD')}剩余正常工时为 ${remainingNormalHours} 小时，请选择加班类型或减少工时`);
      return;
    }

    setLoading(true);
    try {
      const response = await workHourAPI.createWorkHour({
        projectCode: values.projectCode,
        workDate: values.workDate.format('YYYY-MM-DD'),
        workHours: hours,
        workContent: values.workContent,
        workType: values.workType,
      });

      if (response.data.code === 200) {
        message.success('工时填报成功');
        form.resetFields();
        form.setFieldsValue({ workDate: selectedDate, workHours: 1, workType: 'normal' });
        setWorkType('normal');
        fetchAllWorkHours();
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

  const maxHours = workType === 'overtime' ? 12 : Math.max(0.5, remainingNormalHours);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <Statistic
              title={`${dayjs(selectedDate).format('MM-DD')}正常工时`}
              value={selectedDateHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <Statistic
              title="加班工时"
              value={selectedDateOvertimeHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <Statistic
              title="剩余可填"
              value={remainingNormalHours}
              suffix="小时"
              prefix={<CalendarOutlined style={{ color: remainingNormalHours > 0 ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: remainingNormalHours > 0 ? '#52c41a' : '#ff4d4f', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={{
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              boxShadow: 'none',
            }}
          >
            <Statistic
              title="当日总计"
              value={(selectedDateHours + selectedDateOvertimeHours).toFixed(1)}
              suffix="小时"
              valueStyle={{ color: '#722ed1', fontSize: 24, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
        }}
      >
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>填报工时</span>
          </div>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            workHours: 1,
            workDate: dayjs(workDate),
            workType: 'normal',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
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
                  size="large"
                >
                  {projects.map((project) => (
                    <Option key={project.projectCode} value={project.projectCode}>
                      {project.projectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="日期"
                name="workDate"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker
                  disabledDate={(current) => {
                    return current && current > dayjs();
                  }}
                  style={{ width: '100%' }}
                  placeholder="选择日期"
                  size="large"
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="工作类型"
                name="workType"
              >
                <Select 
                  defaultValue="normal" 
                  style={{ width: '100%' }} 
                  size="large"
                  onChange={handleWorkTypeChange}
                >
                  <Option value="normal">正常工时</Option>
                  <Option value="overtime">加班</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={`${workType === 'overtime' ? '加班' : '工时'}（小时）`}
                name="workHours"
                rules={[{ required: true, message: '请输入工时' }]}
              >
                <InputNumber
                  min={0.5}
                  max={maxHours}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder={`请输入${workType === 'overtime' ? '加班' : '工时'}`}
                  suffix="小时"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="工作内容"
            name="workContent"
          >
            <TextArea
              placeholder="请简要描述工作内容..."
              rows={3}
              style={{ borderRadius: 6 }}
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
              style={{
                height: 40,
                fontSize: 14,
                fontWeight: 500,
                background: '#1890ff',
                borderRadius: 6,
              }}
            >
              {workType === 'overtime' ? '保存加班记录' : '保存工时'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WorkHourForm;
