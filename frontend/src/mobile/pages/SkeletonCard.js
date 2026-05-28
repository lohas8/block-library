/**
 * SkeletonCard - 骨架屏卡片
 * 灰色占位块模拟真实卡片结构
 */
import React from 'react';
import './MobileSquare.css';

const SkeletonCard = () => {
  return (
    <div className="square-card skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-summary" />
        <div className="skeleton-summary short" />
        <div className="skeleton-meta">
          <div className="skeleton-avatar" />
          <div className="skeleton-author" />
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-action" />
          <div className="skeleton-action" />
          <div className="skeleton-action" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;