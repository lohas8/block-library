/**
 * RuleCard - 规则卡片组件
 */
import React from 'react';
import { Card, Tag, Button } from 'antd';

const RuleCard = ({ rule, onApply, showApplyButton = true }) => {
  const { name, description, type, points, status } = rule;

  return (
    <Card className="rule-card">
      <Card.Meta
        title={
          <div className="rule-title">
            <span>{name}</span>
            <Tag color={type === 'reward' ? 'green' : 'red'}>
              {type === 'reward' ? '奖励' : '惩罚'}
            </Tag>
          </div>
        }
        description={
          <div className="rule-desc">
            <p>{description}</p>
            <div className="rule-points-info">
              <span className={`points-value ${type === 'reward' ? 'positive' : 'negative'}`}>
                {type === 'reward' ? '+' : '-'}{points} 积分
              </span>
            </div>
          </div>
        }
      />
      {showApplyButton && (
        <Card.Meta
          description={
            <Button
              type="primary"
              size="small"
              onClick={() => onApply?.(rule)}
            >
              申请
            </Button>
          }
        />
      )}
    </Card>
  );
};

export default RuleCard;