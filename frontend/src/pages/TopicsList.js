import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Select, Tabs, Badge, Input } from 'antd';
import { PlusOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { api } from '../api';
import { useSelector } from 'react-redux';
import './Topics.css';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const STATUS_MAP = {
  pending: { label: '待受理', color: 'default' },
  accepted: { label: '已受理', color: 'processing' },
  processing: { label: '处理中', color: 'warning' },
  pending_verify: { label: '待验收', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  closed: { label: '已关闭', color: 'error' },
};

const TopicsList = () => {
  const navigate = useNavigate();
  const { info } = useSelector(state => state.user);
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, sort };
      if (status !== 'all') params.status = status;
      const res = await api.get('/topics', { params });
      setTopics(res.data?.data?.list || []);
      setTotal(res.data?.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [status, sort, page, pageSize]);

  const columns = [
    {
      title: '',
      key: 'focus',
      width: 40,
      render: (_, record) => (
        record.is_focused ? <FireOutlined style={{ color: '#ff4d4f', fontSize: 16 }} /> : null
      ),
    },
    {
      title: '议题',
      key: 'title',
      render: (_, record) => (
        <div className="topic-item" onClick={() => navigate(`/topics/${record._id}`)}>
          <div className="topic-title">
            {record.is_focused && <Badge count="置顶" style={{ backgroundColor: '#ff4d4f', marginRight: 8 }} />}
            {record.title}
          </div>
          <div className="topic-meta">
            <Tag color={STATUS_MAP[record.status]?.color}>{STATUS_MAP[record.status]?.label}</Tag>
            <span className="meta-text">👤 {record.author_name}</span>
            <span className="meta-sep">·</span>
            <span className="meta-text">💬 {record.comment_count}</span>
            <span className="meta-sep">·</span>
            <span className="meta-text">👀 {record.follow_count}</span>
            <span className="meta-sep">·</span>
            <span className="meta-text">🔥 {record.hot_score.toFixed(1)}</span>
          </div>
        </div>
      ),
    },
    {
      title: '时间',
      key: 'time',
      width: 140,
      render: (_, record) => (
        <span className="topic-time">
          {new Date(record.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  return (
    <div className="topics-page">
      <div className="page-header">
        <div className="header-title">
          <h2>📋 议事广场</h2>
          <span className="total-count">共 {total} 个议题</span>
        </div>
        <Space>
          <Select value={sort} onChange={v => { setSort(v); setPage(1); }} style={{ width: 120 }}>
            <Option value="hot">🔥 热度</Option>
            <Option value="time">🕐 最新</Option>
          </Select>
          {(info?.role === 'user' || info?.role === 'owner') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/topics/create')}>
              创建议题
            </Button>
          )}
        </Space>
      </div>

      <Card className="topics-card">
        <Tabs activeKey={status} onChange={v => { setStatus(v); setPage(1); }}>
          <TabPane tab={<span>全部</span>} key="all" />
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <TabPane key={k} tab={<span>{v.label}</span>} />
          ))}
        </Tabs>

        <Table
          columns={columns}
          dataSource={topics}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: false,
          }}
          className="topics-table"
        />
      </Card>
    </div>
  );
};

export default TopicsList;