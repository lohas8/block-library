import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { api } from '../api';
import './TopicCreate.css';

const { TextArea } = Input;

const CreateTopic = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/topics', {
        title: values.title,
        content: values.content,
      });
      message.success('议题创建成功');
      navigate('/topics');
    } catch (err) {
      message.error(err.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-topic-page">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/topics')} style={{ marginBottom: 16 }}>
        返回议事广场
      </Button>

      <Card className="create-card" title="📋 发起新议题">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="议题标题"
            rules={[{ required: true, message: '请输入议题标题' }, { max: 100, message: '标题最多100字' }]}
          >
            <Input placeholder="简明扼要地描述你的议题..." maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="content"
            label="议题内容"
            rules={[{ required: true, message: '请输入议题内容' }, { max: 5000, message: '内容最多5000字' }]}
          >
            <TextArea
              placeholder="详细描述你的建议或意见..."
              rows={10}
              maxLength={5000}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                发布议题
              </Button>
              <Button onClick={() => navigate('/topics')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTopic;