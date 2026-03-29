import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, List, Tag } from 'antd';
import { BookOutlined, UserOutlined, ReadOutlined, RiseOutlined } from '@ant-design/icons';
import { borrowApi } from '../../api';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const res = await borrowApi.statistics();
      setStatistics(res.data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  if (!statistics) {
    return <div>加载中...</div>;
  }

  const columns = [
    {
      title: '书名',
      dataIndex: ['book', 'title'],
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: ['book', 'author'],
      key: 'author',
    },
    {
      title: '借阅次数',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <div>
      <h1>📊 数据概览</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="图书总数"
              value={statistics.totalBooks}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可借数量"
              value={statistics.availableBooks}
              prefix={<ReadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="借阅中"
              value={statistics.borrowedCount}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="🏆 借阅排行">
            <List
              dataSource={statistics.topBorrowed}
              renderItem={(item, index) => (
                <List.Item>
                  <Tag color="gold">{index + 1}</Tag>
                  {item.title} - {item.author || '未知作者'} ({item.count}次)
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📈 借阅趋势（近7天）">
            <List
              dataSource={statistics.borrowTrend}
              renderItem={item => (
                <List.Item>
                  <span>{item._id}</span>
                  <Tag color="blue">{item.count} 次</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
