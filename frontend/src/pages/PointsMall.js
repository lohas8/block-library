import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, message, Modal, Form, Input, NumberInput, Tag, Space, Popconfirm } from 'antd';
import { GiftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { pointsApi } from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { updatePoints } from '../../store';

const PointsMall = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadItems();
  }, [params]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await pointsApi.itemList(params);
      setItems(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      message.error('获取积分商品失败');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await pointsApi.updateItem(editingItem._id, values);
        message.success('更新成功');
      } else {
        await pointsApi.createItem(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      loadItems();
    } catch (error) {
      message.error(error.response?.data?.msg || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await pointsApi.deleteItem(id);
      message.success('删除成功');
      loadItems();
    } catch (error) {
      message.error(error.response?.data?.msg || '删除失败');
    }
  };

  const handleExchange = async (itemId) => {
    if (!info) {
      return message.warning('请先登录');
    }
    try {
      const res = await pointsApi.exchange({ userId: info.id, itemId });
      dispatch(updatePoints(res.data.remainingPoints));
      message.success('兑换成功！请到管理员处领取');
    } catch (error) {
      message.error(error.response?.data?.msg || '兑换失败');
    }
  };

  const isAdmin = info?.role === 'admin';

  return (
    <div>
      <h1>🎁 积分商城</h1>
      
      {info && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <span>我的积分：</span>
            <Tag color="gold" style={{ fontSize: 16 }}>{info.points}</Tag>
          </Space>
        </Card>
      )}

      <Space style={{ marginBottom: 16 }}>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加商品
          </Button>
        )}
      </Space>

      <Row gutter={[16, 16]}>
        {items.map(item => (
          <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={item.image ? <img alt={item.name} src={item.image} style={{ height: 200, objectFit: 'cover' }} /> : null}
              actions={isAdmin ? [
                <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                <Popconfirm title="确定删除?" onConfirm={() => handleDelete(item._id)}>
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
              ] : [
                <Button 
                  type="primary" 
                  key="exchange" 
                  disabled={!info || info.points < item.points || item.stock === 0}
                  onClick={() => handleExchange(item._id)}
                >
                  兑换
                </Button>,
              ]}
            >
              <Card.Meta
                title={item.name}
                description={
                  <div>
                    <p>{item.description}</p>
                    <Space>
                      <Tag color="gold">{item.points} 积分</Tag>
                      <Tag color={item.stock === 0 ? 'red' : item.stock > 0 ? 'green' : 'blue'}>
                        {item.stock === 0 ? '已兑完' : item.stock === -1 ? '无限' : `库存: ${item.stock}`}
                      </Tag>
                    </Space>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingItem ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="points" label="所需积分" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="stock" label="库存（-1为无限）" initialValue={-1}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="image" label="图片URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsMall;
