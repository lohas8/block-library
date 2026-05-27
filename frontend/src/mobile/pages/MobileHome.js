/**
 * Mobile Home - 议事风格手机端首页
 * wireframe_yishi_v3.html 布局实现
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, Grid, Tag } from 'antd-mobile';
import './MobileHome.css';

const STATUS_COLORS = {
  pending: { bg: '#f5f5f5', color: '#999', label: '待受理' },
  accepted: { bg: '#e6f4ff', color: '#1677ff', label: '已受理' },
  processing: { bg: '#fffbe6', color: '#faad14', label: '处理中' },
  pending_verify: { bg: '#fffbe6', color: '#faad14', label: '待验收' },
  completed: { bg: '#e8f5e9', color: '#2e7d32', label: '已完成' },
  closed: { bg: '#f5f5f5', color: '#999', label: '已关闭' },
  voting: { bg: '#e8f5e9', color: '#2e7d32', label: '投票中' },
  pending_vote: { bg: '#fff3e0', color: '#e65100', label: '待投票' },
  done: { bg: '#f5f5f5', color: '#999', label: '已结束' },
};

const RATE_DATA = [
  { stars: '★★★★★', score: '4.8', label: '整体服务' },
  { stars: '★★★★☆', score: '4.2', label: '维修响应' },
  { stars: '★★★★★', score: '4.9', label: '环境绿化' },
];

const TAG_LIST = ['全部', '待受理', '已受理', '处理中', '待验收', '已完成', '已关闭'];

const MobileHome = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('全部');
  const [focusedTopics, setFocusedTopics] = useState([]);
  const [votingTopics, setVotingTopics] = useState([]);
  const [topicList, setTopicList] = useState([]);

  // 加载焦点议题
  useEffect(() => {
    fetch(`http://localhost:7002/api/topics?sort=hot&pageSize=5`)
      .then(r => r.json())
      .then(json => {
        const list = json.data?.list ?? json.list ?? [];
        // 焦点议题取 is_focused=true，或热度最高的前3
        setFocusedTopics(list.filter(t => t.is_focused).slice(0, 3));
        if (focusedTopics.length === 0) setFocusedTopics(list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  // 加载投票议题（取状态含投票的关键字）
  useEffect(() => {
    fetch(`http://localhost:7002/api/topics?sort=hot&pageSize=10`)
      .then(r => r.json())
      .then(json => {
        const list = json.data?.list ?? json.list ?? [];
        setVotingTopics(list.filter(t => t.status === 'voting' || t.status === 'pending_vote').slice(0, 2));
        setTopicList(list.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    navigate('/mobile/topics', { state: { initialStatus: tag === '全部' ? 'all' : tag } });
  };

  const formatHotScore = (score) => {
    if (!score && score !== 0) return '0.0';
    return typeof score === 'number' ? score.toFixed(1) : score;
  };

  return (
    <div className="yishi-home">
      {/* ===== Header ===== */}
      <div className="yishi-header">
        <div className="header-left">
          <div className="header-title">议事</div>
          <div className="header-slogan">AI赋能 · 区块链构建可信业主自治平台</div>
        </div>
      </div>

      {/* ===== SearchBar ===== */}
      <div className="yishi-search">
        <SearchBar
          placeholder="搜索议题..."
          onSearch={(val) => {
            if (val.trim()) navigate('/mobile/topics', { state: { keyword: val } });
          }}
        />
      </div>

      {/* ===== 物业评价 ===== */}
      <div className="section-title">
        <span>物业评价</span>
        <span className="more-btn" onClick={() => navigate('/mobile/rate')}>去评价 ›</span>
      </div>
      <div className="rate-card">
        <div className="rate-inner">
          {RATE_DATA.map((item, i) => (
            <div key={i} className="rate-item">
              <div className="rate-stars">{item.stars}</div>
              <div className="rate-score">{item.score}</div>
              <div className="rate-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 焦点议题幻灯片 ===== */}
      <div className="section-title">
        <span>焦点议题</span>
        <span className="more-btn" onClick={() => navigate('/mobile/topics')}>更多 ›</span>
      </div>
      <div className="slides-container">
        {focusedTopics.length === 0 ? (
          <div className="slide-card-empty">暂无焦点议题</div>
        ) : (
          focusedTopics.map((topic, i) => (
            <div
              key={topic._id}
              className="slide-card"
              onClick={() => navigate(`/mobile/topics/${topic._id}`)}
            >
              <div className="slide-body">
                <div className="slide-title">{topic.title}</div>
                <div className="slide-desc">{topic.content}</div>
                <div className="slide-meta">
                  <span className="slide-tag">热议</span>
                  <span className="slide-stat">{topic.follow_count + topic.comment_count} 参与</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== 投票 ===== */}
      <div className="section-title">投票</div>
      <div className="item-list">
        {votingTopics.length === 0 ? (
          <div className="empty-hint">暂无进行中的投票</div>
        ) : (
          votingTopics.map(topic => (
            <div
              key={topic._id}
              className="vote-item"
              onClick={() => navigate(`/mobile/topics/${topic._id}`)}
            >
              <div className="vote-icon">🗳️</div>
              <div className="vote-body">
                <div className="vote-title">{topic.title}</div>
                <div className="vote-bars">
                  <div className="vote-bar-row">
                    <span className="vote-bar-label">同意</span>
                    <div className="vote-bar">
                      <div className="vote-bar-fill yes" style={{ width: '65%' }} />
                    </div>
                    <span className="vote-bar-num">65%</span>
                  </div>
                  <div className="vote-bar-row">
                    <span className="vote-bar-label">反对</span>
                    <div className="vote-bar">
                      <div className="vote-bar-fill no" style={{ width: '35%' }} />
                    </div>
                    <span className="vote-bar-num">35%</span>
                  </div>
                </div>
                <div className="vote-meta">
                  {topic.comment_count}人参与 · 截止明天 18:00
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== 问题列表 ===== */}
      <div className="section-title">问题列表</div>
      <div className="tags-scroll">
        {TAG_LIST.map(tag => (
          <span
            key={tag}
            className={`tag ${activeTag === tag ? 'tag-all' : 'tag-normal'}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="item-list">
        {topicList.length === 0 ? (
          <div className="empty-hint">暂无议题</div>
        ) : (
          topicList.map(topic => {
            const sc = getStatusColor(topic.status);
            return (
              <div
                key={topic._id}
                className="item"
                onClick={() => navigate(`/mobile/topics/${topic._id}`)}
              >
                <div className="item-icon">📋</div>
                <div className="item-body">
                  <div className="item-title">{topic.title}</div>
                  <div className="item-desc">{topic.content}</div>
                  <div className="item-meta">
                    <Tag
                      className="item-tag"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </Tag>
                    <span className="item-stat">
                      {topic.comment_count} 参与 · {topic.follow_count} 关注
                    </span>
                  </div>
                </div>
                <div className="item-arrow">›</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileHome;
