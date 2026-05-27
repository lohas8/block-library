/**
 * Mobile Topics List - 手机端议事广场
 * 基于 antd-mobile v5
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Card, Tag, Button, Empty, DotLoading } from 'antd-mobile';
import './MobileTopics.css';

const STATUS_MAP = {
  pending: { label: '待受理', color: '#999' },
  accepted: { label: '已受理', color: '#1677ff' },
  processing: { label: '处理中', color: '#faad14' },
  pending_verify: { label: '待验收', color: '#faad14' },
  completed: { label: '已完成', color: '#52c41a' },
  closed: { label: '已关闭', color: '#ff4d4f' },
  voting: { label: '投票中', color: '#2e7d32' },
  pending_vote: { label: '待投票', color: '#e65100' },
};

const MobileTopicsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(location.state?.keyword || '');
  const [activeTab, setActiveTab] = useState(location.state?.initialStatus || 'all');

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20', sort: 'hot' });
      if (activeTab !== 'all') params.set('status', activeTab);
      if (searchKeyword) params.set('keyword', searchKeyword);
      const res = await fetch(`http://localhost:7002/api/topics?${params}`);
      const json = await res.json();
      // Mock returns {list} directly; real API returns {data: {list}}
      const list = json.data?.list ?? json.list ?? [];
      setTopics(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [activeTab, searchKeyword]);

  return (
    <div className="mobile-topics">
      {/* 顶部标题 */}
      <div className="topics-header">
        <span className="header-title">💬 议事广场</span>
        <Button
          size="mini"
          color="primary"
          onClick={() => navigate('/mobile/topics/create')}
        >
          创建议题
        </Button>
      </div>

      {/* 状态 Tab 筛选 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setSearchKeyword(''); }}
        className="topics-tabs"
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="待受理" key="pending" />
        <Tabs.Tab title="已受理" key="accepted" />
        <Tabs.Tab title="处理中" key="processing" />
        <Tabs.Tab title="待验收" key="pending_verify" />
        <Tabs.Tab title="已完成" key="completed" />
        <Tabs.Tab title="已关闭" key="closed" />
      </Tabs>

      {/* 加载状态 */}
      {loading ? (
        <div className="topics-loading">
          <DotLoading />
        </div>
      ) : topics.length === 0 ? (
        <Empty description="暂无议题，来说第一个吧~" className="topics-empty" />
      ) : (
        <div className="topics-list">
          {topics.map(topic => (
            <Card
              key={topic._id}
              className={`topic-card ${topic.is_focused ? 'topic-focused' : ''}`}
              onClick={() => navigate(`/mobile/topics/${topic._id}`)}
            >
              {topic.is_focused && (
                <div className="focus-badge">🔥 置顶</div>
              )}
              <div className="topic-title">{topic.title}</div>
              <div className="topic-meta">
                <Tag color={STATUS_MAP[topic.status]?.color} className="status-tag">
                  {STATUS_MAP[topic.status]?.label}
                </Tag>
                <span className="meta-text">👤 {topic.author_name}</span>
                <span className="meta-text">💬 {topic.comment_count}</span>
                <span className="meta-text">👀 {topic.follow_count}</span>
                <span className="meta-text">🔥 {topic.hot_score?.toFixed(1)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTopicsList;