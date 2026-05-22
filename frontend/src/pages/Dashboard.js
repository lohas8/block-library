import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, List, Tag } from 'antd';
import { BookOutlined, UserOutlined, ReadOutlined, ToolOutlined, DollarOutlined } from '@ant-design/icons';
import { borrowApi, toolApi } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, borrowListRes, toolsRes] = await Promise.all([
        borrowApi.statistics(),
        borrowApi.list({ limit: 5 }),
        toolApi.statistics(),
      ]);

      // 计算图书各状态数量
      const booksAvailable = (statsRes.booksAvailable !== undefined) ? statsRes.booksAvailable : (statsRes.available || 0);
      const booksBorrowed = (statsRes.booksBorrowed !== undefined) ? statsRes.booksBorrowed : (statsRes.borrowed || 0);

      setStats({
        ...statsRes,
        booksAvailable,
        booksBorrowed,
        totalTools: toolsRes.totalTools,
        toolsAvailable: toolsRes.available,
        toolsBorrowed: toolsRes.borrowed,
      });

      // 借阅排行（按借阅次数排序取前5）
      const bookBorrowCount = {};
      (borrowListRes.list || []).forEach(r => {
        if (!bookBorrowCount[r.bookId]) {
          bookBorrowCount[r.bookId] = { title: r.bookTitle, count: 0 };
        }
        bookBorrowCount[r.bookId].count += 1;
      });
      const sorted = Object.values(bookBorrowCount).sort((a, b) => b.count - a.count).slice(0, 5);
      setTopBooks(sorted);
    } catch (error) {
      console.error('获取数据失败', error);
    }
    setLoading(false);
  };

  if (loading || !stats) {
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>📊 数据概览</h1>

      {/* 图书统计 */}
      <h3 style={{ marginTop: 24, marginBottom: 12 }}>📚 图书</h3>
      <Row gutter={16}>
        <Col span={6}>
          <Card><Statistic title="图书总量" value={stats.totalBooks} prefix={<BookOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="可借" value={stats.booksAvailable} valueStyle={{ color: '#52c41a' }} prefix={<ReadOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="借阅中" value={stats.booksBorrowed} valueStyle={{ color: '#fa8c16' }} prefix={<BookOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="超期" value={stats.booksOverdue || 0} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      {/* 用户统计 */}
      <h3 style={{ marginTop: 24, marginBottom: 12 }}>👥 用户与积分</h3>
      <Row gutter={16}>
        <Col span={8}>
          <Card><Statistic title="用户总数" value={stats.totalUsers} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="积分总量" value={stats.totalPoints || 0} prefix={<DollarOutlined />} valueStyle={{ color: '#1890ff' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="本月借阅" value={stats.thisMonth || 0} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
      </Row>

      {/* 工具统计 */}
      <h3 style={{ marginTop: 24, marginBottom: 12 }}>🛠️ 工具共享</h3>
      <Row gutter={16}>
        <Col span={8}>
          <Card><Statistic title="工具总量" value={stats.totalTools} prefix={<ToolOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="可借" value={stats.toolsAvailable} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="已借出" value={stats.toolsBorrowed} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
      </Row>

      {/* 借阅排行 */}
      {topBooks.length > 0 && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="🏆 图书借阅排行（Top 5）">
              <List
                dataSource={topBooks}
                renderItem={(item, index) => (
                  <List.Item>
                    <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'orange'}>{index + 1}</Tag>
                    <span style={{ flex: 1 }}>{item.title}</span>
                    <Tag color="blue">{item.count} 次</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;