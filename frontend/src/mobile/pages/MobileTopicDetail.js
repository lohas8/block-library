/**
 * Mobile Topic Detail - 手机端议事详情
 * 基于 antd-mobile v5
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Avatar, List, Input, Toast } from 'antd-mobile';
import './MobileTopics.css';

const STATUS_MAP = {
  pending: { label: '待受理', color: '#999' },
  accepted: { label: '已受理', color: '#1677ff' },
  processing: { label: '处理中', color: '#faad14' },
  pending_verify: { label: '待验收', color: '#faad14' },
  completed: { label: '已完成', color: '#52c41a' },
  closed: { label: '已关闭', color: '#ff4d4f' },
};

const MobileTopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const fetchTopic = async () => {
    const res = await fetch(`http://localhost:7002/api/topics/${id}`);
    const data = await res.json();
    if (data.data) setTopic(data.data);
  };

  const fetchComments = async () => {
    const res = await fetch(`http://localhost:7002/api/comments?topic_id=${id}&sort=asc`);
    const data = await res.json();
    setComments(data.data?.list || []);
  };

  useEffect(() => {
    fetchTopic();
    fetchComments();
  }, [id]);

  const handleFollow = async () => {
    const action = isFollowed ? 'unfollow' : 'follow';
    await fetch(`http://localhost:7002/api/topics/${id}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, user_id: 'u2' }),
    });
    setIsFollowed(!isFollowed);
    fetchTopic();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`http://localhost:7002/api/topics/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, author_id: 'u2', author_name: '张三' }),
      });
      setCommentText('');
      fetchComments();
      fetchTopic();
      Toast.show('评论成功');
    } catch {
      Toast.show('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!topic) return null;

  const canComment = topic.status !== 'closed';

  return (
    <div className="mobile-topic-detail">
      {/* 返回 */}
      <div className="detail-back" onClick={() => navigate('/mobile')}>
        <span onClick={() => navigate('/mobile')} style={{ cursor: 'pointer' }}>← 返回议事广场</span>
      </div>

      {/* 议题目 */}
      <Card className="detail-card">
        <div className="detail-header">
          <div className="detail-title-row">
            <span className="detail-title">{topic.title}</span>
            <Tag color={STATUS_MAP[topic.status]?.color}>
              {STATUS_MAP[topic.status]?.label}
            </Tag>
          </div>
          <div className="detail-meta">
            <Avatar>{topic.author_name?.[0]}</Avatar>
            <span className="author">{topic.author_name}</span>
            <span className="meta-dot">·</span>
            <span>{new Date(topic.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
        <div className="detail-content">{topic.content}</div>
        <div className="detail-stats">
          <span>👀 关注 {topic.follow_count}</span>
          <span>💬 评论 {topic.comment_count}</span>
          <span>🔥 {topic.hot_score?.toFixed(1)}</span>
        </div>
        <Button
          color={isFollowed ? 'default' : 'primary'}
          size="small"
          onClick={handleFollow}
          className="follow-btn"
        >
          {isFollowed ? '已关注' : '关注议题'}
        </Button>
      </Card>

      {/* 评论区域 */}
      <Card className="comments-card" title={`💬 评论 ${topic.comment_count}`}>
        {canComment && (
          <div className="comment-input">
            <Input
              value={commentText}
              onChange={setCommentText}
              placeholder="发表你的观点..."
              rows={3}
              maxLength={2000}
            />
            <Button
              color="primary"
              size="small"
              loading={submitting}
              onClick={handleComment}
              className="comment-submit"
            >
              发布
            </Button>
          </div>
        )}
        <List className="comment-list">
          {comments.map(item => (
            <List.Item key={item._id} className="comment-item">
              <List.Item.Description>
                <div className="comment-header">
                  <Avatar size="small">{item.author_name?.[0]}</Avatar>
                  <span className="comment-author">{item.author_name}</span>
                  <span className="comment-time">
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="comment-content">{item.content}</div>
              </List.Item.Description>
            </List.Item>
          ))}
        </List>
        {comments.length === 0 && (
          <Empty description="暂无评论，来说第一个观点吧~" />
        )}
      </Card>
    </div>
  );
};

export default MobileTopicDetail;