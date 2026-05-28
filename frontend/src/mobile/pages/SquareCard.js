/**
 * SquareCard - 通用卡片组件
 * 根据 type 渲染文章卡片或商品卡片
 */
import React from 'react';
import './MobileSquare.css';

const ArticleCard = ({ item, onLike, onClick }) => {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike(item);
  };

  return (
    <div className="square-card article-card" onClick={() => onClick(item)}>
      <div className="card-image-wrapper">
        <img src={item.cover_image} alt={item.title} loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-summary">{item.summary}</p>
        <div className="card-meta">
          <img src={item.author.avatar} alt={item.author.nickname} className="meta-avatar" />
          <span className="meta-author">{item.author.nickname}</span>
          <span className="meta-time">· {item.created_at}</span>
        </div>
        <div className="card-actions">
          <span
            className={`action-item ${item.is_liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill={item.is_liked ? '#ff4d4f' : 'none'} stroke={item.is_liked ? '#ff4d4f' : '#999'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="action-count">{item.likes_count}</span>
          </span>
          <span className="action-item">
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="action-count">{item.comments_count}</span>
          </span>
          <span className="action-item">
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span className="action-count">{item.shares_count}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ item, onLike, onClick }) => {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike(item);
  };

  return (
    <div className="square-card product-card" onClick={() => onClick(item)}>
      <div className="card-image-wrapper">
        <img src={item.images[0]} alt={item.title} loading="lazy" />
        <span className={`condition-tag ${item.condition === '全新' ? 'new' : 'used'}`}>
          {item.condition}
        </span>
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <div className="price-row">
          <span className="price-current">¥{item.price}</span>
          {item.old_price && (
            <span className="price-old">¥{item.old_price}</span>
          )}
        </div>
        <div className="card-meta">
          <img src={item.seller.avatar} alt={item.seller.nickname} className="meta-avatar" />
          <span className="meta-author">{item.seller.nickname}</span>
        </div>
        <div className="card-actions">
          <span
            className={`action-item ${item.is_liked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill={item.is_liked ? '#ff4d4f' : 'none'} stroke={item.is_liked ? '#ff4d4f' : '#999'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="action-count">{item.likes_count}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const SquareCard = ({ item, onLike, onClick }) => {
  if (item.type === 'product') {
    return <ProductCard item={item} onLike={onLike} onClick={onClick} />;
  }
  return <ArticleCard item={item} onLike={onLike} onClick={onClick} />;
};

export default SquareCard;