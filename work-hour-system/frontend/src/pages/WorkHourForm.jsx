import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber, Card, message } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workHourAPI, basicDataAPI } from '../utils/api';

const { Option } = Select;

const WorkHourForm = ({ workDate, onSubmit }) => {
  const [projects, setProjects] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    basicDataAPI.getMyProjects().then((response) => {
      if (response.data.code === 200) {
        setProjects(response.data.data);
      }
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({ workDate: dayjs(workDate) });
  }, [workDate, form]);

  const handleSubmit = async (values) => {
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
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusOutlined />
          填报工时
        </div>
      }
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          hours: 1,
          workType: 'normal',
          description: '',
        }}
      >
        <Form.Item
          label="项目"
          name="projectCode"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {projects.map((project) => (
              <Option key={project.projectCode} value={project.projectCode}>
                {project.projectName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="日期"
          name="workDate"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker
            disabledDate={(current) => {
              return current && (current > dayjs() || current < dayjs().subtract(1, 'day'));
            }}
          />
        </Form.Item>

        <Form.Item
          label="工时"
          name="hours"
          rules={[{ required: true, message: '请输入工时' }]}
        >
          <InputNumber
            min={0.5}
            max={8}
            step={0.5}
            style={{ width: '100%' }}
            placeholder="请输入工时"
            suffix="小时"
          />
        </Form.Item>

        <Form.Item
          label="工作类型"
          name="workType"
        >
          <Select defaultValue="normal">
            <Option value="normal">正常工时</Option>
            <Option value="overtime">加班</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="工作描述"
          name="description"
        >
          <Input.TextArea placeholder="请输入工作描述" rows={3} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={<SaveOutlined />}
          >
            保存工时
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default WorkHourForm;