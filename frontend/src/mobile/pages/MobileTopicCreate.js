/**
 * MobileTopicCreate - 手机端创建议题
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast } from 'antd-mobile';
import './MobileTopics.css';

const MobileTopicCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.show('请输入议题标题');
      return;
    }
    if (!content.trim()) {
      Toast.show('请输入议题内容');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:7002/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (json.code === 0 || json.code === '0') {
        Toast.show('创建议题成功');
        navigate('/mobile/topics');
      } else {
        Toast.show(json.message || '创建失败');
      }
    } catch (err) {
      Toast.show('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="topic-create">
      <div className="detail-header">
        <span className="back-btn" onClick={() => navigate(-1)}>‹</span>
        <span className="header-title">创建议题</span>
      </div>

      <div className="create-form">
        <div className="form-item">
          <div className="form-label">议题标题</div>
          <textarea
            className="form-input"
            placeholder="简明扼要地描述议题..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            rows={2}
          />
          <div className="form-count">{title.length}/100</div>
        </div>

        <div className="form-item">
          <div className="form-label">议题内容</div>
          <textarea
            className="form-input"
            placeholder="详细描述你的建议或问题..."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            rows={8}
          />
          <div className="form-count">{content.length}/2000</div>
        </div>

        <div className="form-actions">
          <Button className="cancel-btn" onClick={() => navigate(-1)}>取消</Button>
          <Button
            className="submit-btn"
            color="primary"
            loading={submitting}
            onClick={handleSubmit}
          >
            发布议题
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileTopicCreate;
