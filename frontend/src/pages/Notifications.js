import React, { useEffect, useState } from 'react';
import { List, Tag, Button, Space, Empty, Badge } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { notificationApi } from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { setNotifications, setUnreadCount } from '../../store';

const Notifications = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const { list, unreadCount } = useSelector(state => state.notification);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10, userId: '' });

  useEffect(() => {
    if (info?.id) {
      loadNotifications();
    }
  }, [params, info]);

  const loadNotifications = async () => {
    if (!info?.id) return;
    setLoading(true);
    try {
      const res = await notificationApi.list({ ...params, userId: info.id });
      dispatch(setNotifications(res.data));
    } catch (error) {
      console.error('获取通知失败', error);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      loadNotifications();
    } catch (error) {
      console.error('标记已读失败', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!info?.id) return;
    try {
      await notificationApi.markAllRead(info.id);
      dispatch(setUnreadCount(0));
      loadNotifications();
    } catch (error) {
      console.error('标记全部已读失败', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      loadNotifications();
    } catch (error) {
      console.error('删除失败', error);
    }
  };

  const getTypeTag = (type) => {
    const tags = {
      info: <Tag color="blue">通知</Tag>,
      warning: <Tag color="orange">警告</Tag>,
      success: <Tag color="green">成功</Tag>,
    };
    return tags[type] || <Tag>{type}</Tag>;
  };

  if (!info) {
    return <Empty description="请先登录" />;
  }

  return (
    <div>
      <h1>🔔 我的通知</h1>
      
      {unreadCount > 0 && (
        <Space style={{ marginBottom: 16 }}>
          <Badge count={unreadCount} />
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            全部标记已读
          </Button>
        </Space>
      )}

      <List
        loading={loading}
        dataSource={list}
        renderItem={item => (
          <List.Item
            style={{ background: item.read ? '#fff' : '#f6ffed', padding: 16 }}
            actions={[
              !item.read && (
                <Button type="link" size="small" onClick={() => handleMarkRead(item._id)}>
                  已读
                </Button>
              ),
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item._id)} />,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              title={
                <Space>
                  {item.title}
                  {getTypeTag(item.type)}
                  {item.read || <Tag color="red">新</Tag>}
                </Space>
              }
              description={item.content}
            />
            <div style={{ fontSize: 12, color: '#999' }}>
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </List.Item>
        )}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          onChange: (page) => setParams({ ...params, page }),
        }}
      />
    </div>
  );
};

export default Notifications;
