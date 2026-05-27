/**
 * MobileTopicDetail - 手机端议事详情 + 评论
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Textarea, Button, Avatar, Empty, DotLoading, Dialog } from 'antd-mobile';
import './MobileTopics.css';

const STATUS_COLORS = {
  pending: { bg: '#f5f5f5', color: '#999', label: '待受理' },
  accepted: { bg: '#e6f4ff', color: '#1677ff', label: '已受理' },
  processing: { bg: '#fffbe6', color: '#faad14', label: '处理中' },
  pending_verify: { bg: '#fffbe6', color: '#faad14', label: '待验收' },
  completed: { bg: '#e8f5e9', color: '#2e7d32', label: '已完成' },
  closed: { bg: '#f5f5f5', color: '#999', label: '已关闭' },
};

const MobileTopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:7002/api/topics/${id}`);
      const json = await res.json();
      const data = json.data || json;
      setTopic(data);
      setIsFollowed(data.is_followed || false);
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:7002/api/comments?topic_id=${id}&sort=asc`);
      const json = await res.json();
      const list = json.data?.list ?? json.list ?? [];
      setComments(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      const action = isFollowed ? 'unfollow' : 'follow';
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:7002/api/topics/${id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.code === 0 || json.code === '0') {
        setIsFollowed(!isFollowed);
        setTopic(prev => ({
          ...prev,
          follow_count: isFollowed ? prev.follow_count - 1 : prev.follow_count + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:7002/api/topics/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText }),
      });
      const json = await res.json();
      if (json.code === 0 || json.code === '0') {
        setCommentText('');
        fetchComments();
        setTopic(prev => ({ ...prev, comment_count: prev.comment_count + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="topics-loading"><DotLoading /></div>;
  if (!topic) return <Empty description="议题不存在" />;

  const sc = STATUS_COLORS[topic.status] || STATUS_COLORS.pending;

  return (
    <div className="topic-detail">
      {/* Header */}
      <div className="detail-header">
        <span className="back-btn" onClick={() => navigate(-1)}>‹</span>
        <span className="header-title">议事详情</span>
      </div>

      {/* Topic Body */}
      <div className="detail-body">
        {/* Status + Tag */}
        <div className="detail-meta">
          <span
            className="status-badge"
            style={{ background: sc.bg, color: sc.color }}
          >
            {sc.label}
          </span>
          {topic.is_focused && <span className="focus-badge">🔥 置顶</span>}
        </div>

        <div className="detail-title">{topic.title}</div>
        <div className="detail-author">
          👤 {topic.author_name} · {topic.created_at ? new Date(topic.created_at).toLocaleDateString() : ''}
        </div>

        <div className="detail-content">{topic.content}</div>

        <div className="detail-stats">
          <span>💬 {topic.comment_count} 评论</span>
          <span>👀 {topic.follow_count} 关注</span>
          <span>🔥 {topic.hot_score?.toFixed(1) || '0.0'} 热度</span>
        </div>

        {/* Follow Button */}
        <Button
          size="small"
          className={`follow-btn ${isFollowed ? 'followed' : ''}`}
          onClick={handleFollow}
        >
          {isFollowed ? '✓ 已关注' : '+ 关注议题'}
        </Button>
      </div>

      {/* Comments */}
      <div className="comments-section">
        <div className="comments-title">评论 {comments.length}</div>
        {comments.length === 0 ? (
          <div className="comments-empty">暂无评论，来抢沙发吧~</div>
        ) : (
          comments.map(c => (
            <div key={c._id} className="comment-item">
              <div className="comment-avatar">{c.author_name?.[0] || '?'}</div>
              <div className="comment-body">
                <div className="comment-author">{c.author_name}</div>
                <div className="comment-content">{c.content}</div>
                <div className="comment-time">
                  {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      {topic.status !== 'closed' && (
        <div className="comment-input-area">
          <Textarea
            placeholder="说点什么..."
            value={commentText}
            onChange={setCommentText}
            rows={2}
          />
          <Button
            size="small"
            color="primary"
            loading={submitting}
            onClick={handleComment}
            className="comment-submit"
          >
            发表
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileTopicDetail;
