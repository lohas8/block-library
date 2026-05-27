/**
 * Mobile Home - 议事风格手机端首页
 * wireframe_yishi_v3.html 布局实现
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from 'antd-mobile';
import { voteApi, propertyRatingApi } from '../../api';
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

// 评分项配置（仅作 fallback：当年无配置时使用）
const RATING_KEYS_FALLBACK = [
  { key: 'service', label: '整体服务', stars: '★★★★★' },
  { key: 'repair', label: '维修响应', stars: '★★★★☆' },
  { key: 'green', label: '环境绿化', stars: '★★★★★' },
];

const TAG_LIST = ['全部', '待受理', '已受理', '处理中', '待验收', '已完成', '已关闭'];

const MobileHome = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('全部');
  const [focusedTopics, setFocusedTopics] = useState([]);
  const [votes, setVotes] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [rateStats, setRateStats] = useState([]); // [{item_key, item_name, category_name, avg, count}]

  // 加载物业评价配置+统计
  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      propertyRatingApi.categories({ year }),
      propertyRatingApi.stats({ year }),
    ])
      .then(([catJson, statJson]) => {
        const categories = catJson.data || catJson || [];
        const statsData = (statJson.data || statJson).items || [];
        // 合并配置与统计
        const merged = categories.flatMap(cat =>
          (cat.items || []).map(item => {
            const s = statsData.find(x => x.item_key === item.item_key);
            return {
              item_key: item.item_key,
              item_name: item.item_name,
              category_name: cat.name,
              stars: '★★★★★',
              avg: s?.avg || 0,
              count: s?.count || 0,
            };
          })
        );
        setRateStats(merged.length > 0 ? merged : RATING_KEYS_FALLBACK.map(k => ({ ...k, avg: k.key === 'repair' ? 4.2 : (k.key === 'service' ? 4.8 : 4.9), count: 0 })));
      })
      .catch(() => {
        setRateStats(RATING_KEYS_FALLBACK.map(k => ({ ...k, avg: k.key === 'repair' ? 4.2 : (k.key === 'service' ? 4.8 : 4.9), count: 0 })));
      });
  }, []);

  // 加载焦点议题
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:7002'}/api/topics?sort=hot&pageSize=5`)
      .then(r => r.json())
      .then(json => {
        const list = json.data?.list ?? json.list ?? [];
        const focused = list.filter(t => t.is_focused).slice(0, 3);
        setFocusedTopics(focused.length > 0 ? focused : list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  // 加载投票
  useEffect(() => {
    voteApi.list({ status: 'active', pageSize: 3 })
      .then(json => {
        const data = json.data || json;
        setVotes((data.list || []).slice(0, 2));
      })
      .catch(() => {});
  }, []);

  // 加载议题列表
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:7002'}/api/topics?sort=hot&pageSize=10`)
      .then(r => r.json())
      .then(json => {
        const list = json.data?.list ?? json.list ?? [];
        setTopicList(list.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    navigate('/mobile/topics', { state: { initialStatus: tag === '全部' ? 'all' : tag } });
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    const d = new Date(deadline);
    const now = new Date();
    const diff = d - now;
    if (diff < 0) return '已截止';
    if (diff < 86400000) return `截止 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `截止 ${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
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
          {rateStats.map((item, i) => (
            <div key={i} className="rate-item">
              <div className="rate-stars">{item.stars}</div>
              <div className="rate-score">{item.avg > 0 ? item.avg.toFixed(1) : '--'}</div>
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
        {votes.length === 0 ? (
          <div className="empty-hint">暂无进行中的投票</div>
        ) : (
          votes.map(vote => (
            <div
              key={vote._id}
              className="vote-item"
              onClick={() => navigate(`/mobile/votes/${vote._id}`)}
            >
              <div className="vote-icon">🗳️</div>
              <div className="vote-body">
                <div className="vote-title">{vote.title}</div>
                <div className="vote-bars">
                  {(vote.items || []).map((item, i) => {
                    const total = vote.total_votes || 1;
                    const percent = item.vote_count > 0 ? Math.round((item.vote_count / total) * 100) : 0;
                    return (
                      <div key={item._id} className="vote-bar-row">
                        <span className="vote-bar-label">{item.label}</span>
                        <div className="vote-bar">
                          <div
                            className={`vote-bar-fill ${i === 0 ? 'yes' : 'no'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="vote-bar-num">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="vote-meta">
                  {vote.total_votes}人参与 · {formatDeadline(vote.deadline)}
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
                    <span
                      className="item-tag"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
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