/**
 * Mobile Home - 社区温暖风设计 v3
 * 主色 #2DCCB6 薄荷青 | 深辅 #1A7F6F | 浅辅 #D6F5EE | 暖强调 #F4A261 | 背景 #FAFDFC | 文字 #1B3A35
 * 更新：议事→议事厅，搜索框去边框双层背景，物业评价按钮入卡片，焦点议题100%宽度
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from 'antd-mobile';
import { voteApi, propertyRatingApi } from '../../api';
import './MobileHome.css';

const STATUS_COLORS = {
  pending:     { bg: '#D6F5EE', color: '#1A7F6F', label: '待受理' },
  accepted:    { bg: '#2DCCB6', color: '#fff',    label: '已受理' },
  processing:  { bg: '#F4A261', color: '#fff',    label: '处理中' },
  pending_verify: { bg: '#F4A261', color: '#fff', label: '待验收' },
  completed:   { bg: '#2DCCB6', color: '#fff',    label: '已完成' },
  closed:      { bg: '#f5f5f5', color: '#999',    label: '已关闭' },
  voting:      { bg: '#2DCCB6', color: '#fff',    label: '投票中' },
  pending_vote:{ bg: '#F4A261', color: '#fff',    label: '待投票' },
  done:        { bg: '#f5f5f5', color: '#999',    label: '已结束' },
};

const RATING_KEYS_FALLBACK = [
  { key: 'service', label: '整体服务', stars: '★★★★★' },
  { key: 'repair',  label: '维修响应', stars: '★★★★☆' },
  { key: 'green',   label: '环境绿化', stars: '★★★★★' },
];

const TAG_LIST = ['全部', '待受理', '已受理', '处理中', '待验收', '已完成', '已关闭'];

// 假数据：投票
const MOCK_VOTES = [
  {
    _id: 'vote1',
    title: '小区垃圾分类方案投票',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_votes: 128,
    items: [
      { _id: 'v1a', label: '方案A', vote_count: 82 },
      { _id: 'v1b', label: '方案B', vote_count: 46 },
    ],
  },
  {
    _id: 'vote2',
    title: '是否增设夜间巡逻',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    total_votes: 95,
    items: [
      { _id: 'v2a', label: '同意', vote_count: 61 },
      { _id: 'v2b', label: '反对', vote_count: 34 },
    ],
  },
];

// 假数据：问题列表
const MOCK_TOPICS = [
  {
    _id: 't1',
    title: '关于小区公共区域WiFi覆盖的建议',
    content: '建议在公共区域增设WiFi热点，方便业主日常使用',
    status: 'completed',
    comment_count: 32,
    follow_count: 18,
  },
  {
    _id: 't2',
    title: '电动车停车棚扩建申请',
    content: '现有停车棚容量不足，建议在东门附近增设新车棚',
    status: 'voting',
    comment_count: 45,
    follow_count: 27,
  },
  {
    _id: 't3',
    title: '物业费使用明细公示',
    content: '要求物业每季度公示详细费用支出明细',
    status: 'pending',
    comment_count: 56,
    follow_count: 41,
  },
  {
    _id: 't4',
    title: '小区绿化带补种计划',
    content: '春季到来，建议对枯死绿化带进行补种',
    status: 'accepted',
    comment_count: 19,
    follow_count: 12,
  },
  {
    _id: 't5',
    title: '儿童游乐区设施更新',
    content: '现有滑梯老化严重，建议更换为新式组合滑梯',
    status: 'processing',
    comment_count: 28,
    follow_count: 35,
  },
];

// 假数据：焦点议题
const MOCK_FOCUSED = [
  {
    _id: 'f1',
    title: '社区公约修订意见征集',
    content: '针对现有公约进行修订，现公开征集全体业主意见',
    status: 'voting',
    follow_count: 89,
    comment_count: 134,
    is_focused: true,
  },
];

const MobileHome = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('全部');
  const [focusedTopics, setFocusedTopics] = useState([]);
  const [votes, setVotes] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [rateStats, setRateStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const year = new Date().getFullYear();
    Promise.all([
      propertyRatingApi.categories({ year }),
      propertyRatingApi.stats({ year }),
    ])
      .then(([catJson, statJson]) => {
        const categories = catJson.data || catJson || [];
        const statsData = (statJson.data || statJson).items || [];
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
        setRateStats(merged.length > 0 ? merged : RATING_KEYS_FALLBACK.map(k => ({
          ...k,
          avg: k.key === 'repair' ? 4.2 : k.key === 'service' ? 4.8 : 4.9,
          count: 0,
        })));
      })
      .catch(() => {
        setRateStats(RATING_KEYS_FALLBACK.map(k => ({
          ...k,
          avg: k.key === 'repair' ? 4.2 : k.key === 'service' ? 4.8 : 4.9,
          count: 0,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

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

  useEffect(() => {
    voteApi.list({ status: 'active', pageSize: 3 })
      .then(json => {
        const data = json.data || json;
        setVotes((data.list || []).slice(0, 2));
      })
      .catch(() => {});
  }, []);

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

  if (loading) {
    return (
      <div className="yishi-home">
        <div className="yishi-header">
          <div className="header-left">
            <div className="header-title">议事厅</div>
            <div className="header-slogan">AI赋能 · 区块链构建可信业主自治平台</div>
          </div>
        </div>
        <div className="empty-hint">加载中...</div>
      </div>
    );
  }

  return (
    <div className="yishi-home">

      {/* ===== Header ===== */}
      <div className="yishi-header">
        <div className="header-left">
          <div className="header-title">议事厅</div>
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
        <div className="rate-footer">
          <span className="rate-btn" onClick={() => navigate('/mobile/rate')}>去评价 ›</span>
        </div>
      </div>

      {/* ===== 焦点议题 ===== */}
      <div className="section-title">
        <span>焦点议题</span>
        <span className="more-btn" onClick={() => navigate('/mobile/topics')}>更多 ›</span>
      </div>
      <div className="slides-container">
        {(focusedTopics.length > 0 ? focusedTopics : MOCK_FOCUSED).map((topic) => {
          const sc = getStatusColor(topic.status);
          return (
            <div
              key={topic._id}
              className="slide-card"
              onClick={() => navigate(`/mobile/topics/${topic._id}`)}
            >
              <div className="slide-header">
                <span className="slide-tag">热议</span>
                <span className="slide-stat">{topic.follow_count + topic.comment_count} 参与</span>
              </div>
              <div className="slide-body">
                <div className="slide-title">{topic.title}</div>
                <div className="slide-desc">{topic.content}</div>
                <div className="slide-footer">
                  <span
                    className="slide-status"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                  <span className="slide-arrow">›</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 投票 ===== */}
      <div className="section-title">
        <span>投票</span>
      </div>
      <div className="vote-section">
        <div className="vote-card">
          {(votes.length > 0 ? votes : MOCK_VOTES).map(vote => (
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
          ))}
        </div>
      </div>

      {/* ===== 问题列表 ===== */}
      <div className="section-title">
        <span>问题列表</span>
      </div>
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

      <div className="topic-list">
        <div className="topic-list-inner">
          {(topicList.length > 0 ? topicList : MOCK_TOPICS).map(topic => {
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
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
