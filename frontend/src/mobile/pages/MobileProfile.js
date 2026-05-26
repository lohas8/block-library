/**
 * Mobile Profile Page - 手机端个人中心
 */
import React from 'react';
import { Card, List, Button, Avatar } from 'antd-mobile';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../common/store';
import { useNavigate } from 'react-router-dom';

const MobileProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { info } = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/mobile/login');
  };

  return (
    <div className="mobile-profile">
      <Card className="profile-header">
        <Card.Body>
          <div className="profile-info">
            <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
              {info?.name?.[0] || '用户'}
            </Avatar>
            <div className="profile-detail">
              <div className="profile-name">{info?.name || '用户'}</div>
              <div className="profile-role">{info?.role || '普通用户'}</div>
              <div className="profile-points">💰 {info?.points || 0} 积分</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="profile-menu">
        <List>
          <List.Item prefix="📚" onClick={() => navigate('/mobile/my-borrows')}>
            我的借阅
          </List.Item>
          <List.Item prefix="📖" onClick={() => navigate('/mobile/books')}>
            我的收藏
          </List.Item>
          <List.Item prefix="🎁" onClick={() => navigate('/mobile/points')}>
            积分记录
          </List.Item>
          <List.Item prefix="🔔" onClick={() => navigate('/mobile/notifications')}>
            消息通知
          </List.Item>
          <List.Item prefix="⚙️" onClick={() => navigate('/mobile/settings')}>
            账户设置
          </List.Item>
        </List>
      </Card>

      <Button color="danger" block onClick={handleLogout}>
        退出登录
      </Button>
    </div>
  );
};

export default MobileProfile;