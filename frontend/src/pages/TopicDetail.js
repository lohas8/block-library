import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Space, Select, Avatar, List, Empty, message } from 'antd';
import { ArrowLeftOutlined, StarOutlined, StarFilled, ClockCircleOutlined, CommentOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '../api';
import { useSelector } from 'react-redux';
import './TopicDetail.css';

const STATUS_MAP = {
  pending: { label: '待受理', color: 'default' },
  accepted: { label: '已受理', color: 'processing' },
  processing: { label: '处理中', color: 'warning' },
  pending_verify: { label: '待验收', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  closed: { label: '已关闭', color: 'error' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '待受理' },
  { value: 'accepted', label: '已受理' },
  { value: 'processing', label: '处理中' },
  { value: 'pending_verify', label: '待验收' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
];

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { info } = useSelector(state => state.user);
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const fetchTopic = async () => {
    const res = await api.get(`/topics/${id}`);
    const data = res.data?.data;
    if (data) {
      setTopic(data);
      setIsFollowed(data.is_followed);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/comments', { params: { topic_id: id, sort: 'asc' } });
      setComments(res.data?.data?.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
    fetchComments();
  }, [id]);

  const handleFollow = async () => {
    try {
      const action = isFollowed ? 'unfollow' : 'follow';
      await api.post(`/topics/${id}/follow`, { action });
      setIsFollowed(!isFollowed);
      message.success(isFollowed ? '已取消关注' : '关注成功');
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/topics/${id}/comments`, { content: commentText });
      message.success('评论成功');
      setCommentText('');
      fetchComments();
      fetchTopic();
    } catch (err) {
      message.error(err.response?.data?.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/topics/${id}/status`, { status: newStatus });
      message.success('状态更新成功');
      fetchTopic();
    } catch (err) {
      message.error('更新失败');
    }
  };

  const handleFocusToggle = async () => {
    try {
      await api.put(`/topics/${id}/focus`, { is_focused: !topic.is_focused });
      message.success(topic.is_focused ? '已取消置顶' : '已设为置顶');
      fetchTopic();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/topics/${id}/comments/${commentId}`);
      message.success('评论已删除');
      fetchComments();
      fetchTopic();
    } catch (err) {
      message.error('删除失败');
    }
  };

  if (!topic) return null;

  const canComment = info && topic.status !== 'closed';
  const isAdmin = info?.role === 'admin' || info?.role === 'super_admin';

  return (
    <div className="topic-detail-page">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/topics')} style={{ marginBottom: 16 }}>
        返回议事广场
      </Button>

      <Card className="topic-main-card">
        <div className="topic-header">
          <div className="topic-title-row">
            <h1>{topic.title}</h1>
            <Tag color={STATUS_MAP[topic.status]?.color}>{STATUS_MAP[topic.status]?.label}</Tag>
            {topic.is_focused && <Tag color="red">🔥 置顶</Tag>}
          </div>

          <div className="topic-meta-row">
            <Avatar style={{ backgroundColor: '#1890ff' }}>{topic.author_name?.[0]}</Avatar>
            <span className="author-name">{topic.author_name}</span>
            <span className="meta-dot">·</span>
            <ClockCircleOutlined />
            <span>{new Date(topic.created_at).toLocaleDateString('zh-CN')}</span>
            <span className="meta-dot">·</span>
            <EyeOutlined />
            <span>关注 {topic.follow_count}</span>
            <span className="meta-dot">·</span>
            <CommentOutlined />
            <span>评论 {topic.comment_count}</span>
            <span className="meta-dot">·</span>
            <span>🔥 热度 {topic.hot_score.toFixed(1)}</span>
          </div>

          {isAdmin && (
            <div className="admin-actions">
              <Space>
                <Select
                  value={topic.status}
                  onChange={handleStatusChange}
                  options={STATUS_OPTIONS}
                  style={{ width: 120 }}
                />
                <Button
                  type={topic.is_focused ? 'primary' : 'default'}
                  danger={topic.is_focused}
                  icon={topic.is_focused ? <StarFilled /> : <StarOutlined />}
                  onClick={handleFocusToggle}
                >
                  {topic.is_focused ? '取消置顶' : '设为置顶'}
                </Button>
              </Space>
            </div>
          )}
        </div>

        <div className="topic-content">
          {topic.content}
        </div>

        <div className="topic-footer">
          <Button
            type={isFollowed ? 'primary' : 'default'}
            icon={isFollowed ? <StarFilled /> : <StarOutlined />}
            onClick={handleFollow}
          >
            {isFollowed ? '已关注' : '关注议题'}
          </Button>
        </div>
      </Card>

      {/* 评论区域 */}
      <Card className="comments-card" title={`💬 评论 ${topic.comment_count}`}>
        {canComment && (
          <div className="comment-input-area">
            <textarea
              className="comment-textarea"
              placeholder="发表你的观点..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              maxLength={2000}
            />
            <Button type="primary" loading={submitting} onClick={handleComment} style={{ marginTop: 8 }}>
              发布评论
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <Empty description="暂无评论，来发表第一个观点吧~" style={{ marginTop: 40 }} />
        ) : (
          <List
            className="comment-list"
            dataSource={comments}
            renderItem={item => (
              <List.Item
                key={item._id}
                className="comment-item"
                extra={
                  (String(item.author_id) === String(info?._id) || isAdmin) && !item.is_deleted && (
                    <Button size="small" type="text" danger onClick={() => handleDeleteComment(item._id)}>
                      删除
                    </Button>
                  )
                }
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#52c41a' }}>{item.author_name?.[0]}</Avatar>}
                  title={<span className="comment-author">{item.author_name}</span>}
                  description={
                    <div>
                      <div className="comment-time">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </div>
                      <div className="comment-content">{item.content}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default TopicDetail;