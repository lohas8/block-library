/**
 * BookCard - 图书卡片组件（PC/Mobile 共用）
 */
import React from 'react';
import { Card, Badge, Button } from 'antd';

const BookCard = ({ book, onBorrow, showActions = true }) => {
  const { title, author, cover, status, location, category } = book;

  return (
    <Card
      className="book-card"
      cover={cover ? <img src={cover} alt={title} /> : <div className="book-cover-placeholder">📚</div>}
      actions={showActions ? [
        <Button
          key="borrow"
          type="link"
          disabled={status !== 'available'}
          onClick={() => onBorrow?.(book)}
        >
          {status === 'available' ? '借阅' : '已借出'}
        </Button>
      ] : []}
    >
      <Card.Meta
        title={<span className="book-title">{title}</span>}
        description={
          <div className="book-meta">
            <p>作者：{author || '未知'}</p>
            <p>位置：{location || '待定'}</p>
            <p>分类：{category || '其他'}</p>
            <Badge
              text={status === 'available' ? '可借' : '已借出'}
              status={status === 'available' ? 'success' : 'default'}
            />
          </div>
        }
      />
    </Card>
  );
};

export default BookCard;