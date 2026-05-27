/**
 * MobileVoteDetail - 手机端投票详情 + 投票操作
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Radio, Checkbox, Toast, Empty, DotLoading } from 'antd-mobile';
import { voteApi } from '../../api';
import './MobileTopics.css';

const MobileVoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    voteApi.detail(id)
      .then(json => {
        const data = json.data || json;
        setVote(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (itemId) => {
    if (vote.vote_type === 'binary') {
      setSelectedIds([itemId]);
    } else {
      setSelectedIds(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleVote = async () => {
    if (selectedIds.length === 0) {
      Toast.show('请先选择选项');
      return;
    }
    setSubmitting(true);
    try {
      const json = await voteApi.castVote(id, { selected_item_ids: selectedIds });
      if (json.code === 0 || json.code === '0') {
        Toast.show('投票成功');
        // 刷新详情
        const refreshed = await voteApi.detail(id);
        setVote(refreshed.data || refreshed);
      } else {
        Toast.show(json.message || '投票失败');
      }
    } catch (err) {
      Toast.show(err.response?.data?.message || '投票失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="topics-loading"><DotLoading /></div>;
  if (!vote) return <Empty description="投票不存在" />;

  return (
    <div className="topic-detail">
      {/* Header */}
      <div className="detail-header">
        <span className="back-btn" onClick={() => navigate(-1)}>‹</span>
        <span className="header-title">投票详情</span>
      </div>

      {/* Vote Body */}
      <div className="detail-body">
        <div className="detail-title">{vote.title}</div>
        {vote.content && (
          <div className="detail-content">{vote.content}</div>
        )}
        <div className="detail-stats">
          <span>🗳️ {vote.total_votes} 人已投票</span>
          {vote.deadline && (
            <span>⏰ 截止 {new Date(vote.deadline).toLocaleString()}</span>
          )}
        </div>

        {/* 投票选项 */}
        <div className="vote-options">
          {(vote.items || []).map((item, i) => {
            const total = vote.total_votes || 1;
            const percent = item.vote_count > 0
              ? Math.round((item.vote_count / total) * 100)
              : 0;
            const isSelected = selectedIds.includes(item._id);

            return (
              <div
                key={item._id}
                className={`vote-option ${isSelected ? 'selected' : ''} ${vote.has_voted ? 'voted' : ''}`}
                onClick={() => !vote.has_voted && vote.status === 'active' && handleSelect(item._id)}
              >
                <div className="option-label">
                  {vote.vote_type === 'binary' ? (
                    <Radio value={item._id} checked={isSelected} disabled={vote.has_voted || vote.status !== 'active'} />
                  ) : (
                    <Checkbox value={item._id} checked={isSelected} disabled={vote.has_voted || vote.status !== 'active'} />
                  )}
                  <span>{item.label}</span>
                </div>
                <div className="option-bar-row">
                  <div className="vote-bar" style={{ marginTop: 4 }}>
                    <div
                      className={`vote-bar-fill ${i === 0 ? 'yes' : 'no'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="vote-bar-num">{percent}%</span>
                </div>
                <div className="option-count">{item.vote_count} 票</div>
              </div>
            );
          })}
        </div>

        {/* 投票按钮 */}
        {!vote.has_voted && vote.status === 'active' && (
          <Button
            className="submit-btn"
            color="primary"
            loading={submitting}
            disabled={selectedIds.length === 0}
            onClick={handleVote}
            style={{ marginTop: 16, borderRadius: 20 }}
          >
            确认投票
          </Button>
        )}
        {vote.has_voted && (
          <div className="voted-hint">✓ 您已投过票</div>
        )}
        {vote.status === 'closed' && (
          <div className="voted-hint">投票已结束</div>
        )}
      </div>
    </div>
  );
};

export default MobileVoteDetail;