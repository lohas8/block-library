/**
 * Mobile Home Page - 手机端首页
 * antd-mobile v5 compatible
 */
import React from 'react';
import { Card, NoticeBar, Button } from 'antd-mobile';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './MobileHome.css';

const MobileHome = () => {
  const navigate = useNavigate();
  const { info } = useSelector(state => state.user);
  const { unreadCount } = useSelector(state => state.notification);

  return (
    <div className="mobile-home">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <div className="welcome-text">
          你好，{info?.name || '用户'}
          {info?.points !== undefined && <span className="points-badge">💰 {info.points} 积分</span>}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="quick-actions">
        <div className="action-item" onClick={() => navigate('/mobile/scan')}>
          <span className="action-icon">📷</span>
          <span>扫码借书</span>
        </div>
        <div className="action-item" onClick={() => navigate('/mobile/books')}>
          <span className="action-icon">📚</span>
          <span>图书列表</span>
        </div>
        <div className="action-item" onClick={() => navigate('/mobile/my-borrows')}>
          <span className="action-icon">📖</span>
          <span>我的借阅</span>
        </div>
        <div className="action-item" onClick={() => navigate('/mobile/apply-rule')}>
          <span className="action-icon">📝</span>
          <span>积分申请</span>
        </div>
      </div>

      {/* 通知区域 */}
      {unreadCount > 0 && (
        <NoticeBar
          icon={null}
          onClick={() => navigate('/mobile/notifications')}
        >
          📢 您有 {unreadCount} 条未读通知
        </NoticeBar>
      )}

      {/* 借阅中 */}
      <Card title="📖 借阅中" className="borrow-card">
        <div className="borrow-empty">暂无借阅中的图书</div>
        <Button size="small" onClick={() => navigate('/mobile/books')}>
          去借书
        </Button>
      </Card>

      {/* 工具共享 */}
      <Card title="🛠️ 工具共享" className="tool-card">
        <div className="tool-empty">暂无借用的工具</div>
        <Button size="small" onClick={() => navigate('/mobile/tools')}>
          查看工具
        </Button>
      </Card>
    </div>
  );
};

export default MobileHome;