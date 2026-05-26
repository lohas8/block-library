/**
 * PointsBadge - 积分徽章组件
 */
import React from 'react';

const PointsBadge = ({ points, size = 'normal', showIcon = true }) => {
  const sizeStyles = {
    small: { fontSize: '12px', padding: '2px 6px' },
    normal: { fontSize: '14px', padding: '4px 10px' },
    large: { fontSize: '16px', padding: '6px 14px' },
  };

  return (
    <span
      className="points-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg, #fa8c16, #ff7a45)',
        color: '#fff',
        borderRadius: '12px',
        fontWeight: 500,
        ...sizeStyles[size],
      }}
    >
      {showIcon && '💰'}
      {points} 积分
    </span>
  );
};

export default PointsBadge;