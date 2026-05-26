/**
 * Mobile Rule Apply Page - 手机端积分申请
 */
import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Dialog } from 'antd-mobile';
import { ruleApi } from '../../common/api';
import { useSelector } from 'react-redux';

const MobileRuleApply = () => {
  const { info } = useSelector(state => state.user);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await ruleApi.list();
      setRules(res.list || []);
    } catch (err) {
      console.error('加载规则失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (ruleId, points) => {
    try {
      await ruleApi.apply(ruleId, {
        userId: info._id,
        points,
        applyDate: new Date().toISOString()
      });
      Dialog.alert({
        content: '申请已提交，请等待审核',
        onConfirm: () => loadRules(),
      });
    } catch (err) {
      Dialog.alert({ content: '申请失败，请重试' });
    }
  };

  return (
    <div className="mobile-rule-apply">
      <Card className="apply-tip">
        <Card.Body>
          <p>📝 积分申请说明</p>
          <p>选择下方规则，提交申请后由管理员审核通过即可获得相应积分。</p>
        </Card.Body>
      </Card>

      <div className="rule-list">
        {rules.map(rule => (
          <Card key={rule._id} className="rule-item">
            <Card.Header
              title={rule.name}
              extra={
                <Tag color={rule.type === 'reward' ? 'green' : 'red'}>
                  {rule.type === 'reward' ? '奖励' : '惩罚'}
                </Tag>
              }
            />
            <Card.Body>
              <p className="rule-desc">{rule.description}</p>
              <p className="rule-points">
                {rule.type === 'reward' ? '+' : '-'}{rule.points} 积分
              </p>
            </Card.Body>
            <Card.Footer>
              <Button
                size="small"
                color="primary"
                onClick={() => handleApply(rule._id, rule.points)}
              >
                申请
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {rules.length === 0 && !loading && (
        <div className="empty">暂无规则</div>
      )}
    </div>
  );
};

export default MobileRuleApply;