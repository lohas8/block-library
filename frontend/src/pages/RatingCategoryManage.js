/**
 * RatingCategoryManage - 物业评价配置管理（管理后台）
 * 四大类增删改查，每类下小项增删改
 */
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Divider, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { propertyRatingApi } from '../api';
import { useSelector } from 'react-redux';

const RatingCategoryManage = () => {
  const { info } = useSelector(state => state.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [catForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  const communityId = info?.communityId || null;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await propertyRatingApi.categories({ community_id: communityId, include_disabled: true });
      setCategories(res.data || res || []);
    } catch (err) {
      message.error('加载失败');
    }
    setLoading(false);
  };

  // ===== 种子数据 =====
  const handleSeed = async () => {
    try {
      const res = await propertyRatingApi.seed({ community_id: communityId });
      message.success(`初始化成功，已创建 ${res.data?.count || 0} 个分类`);
      loadCategories();
    } catch (err) {
      message.error('初始化失败');
    }
  };

  // ===== 大项操作 =====
  const openAddCat = () => {
    setEditingCat(null);
    catForm.resetFields();
    setCatModal(true);
  };

  const openEditCat = (cat) => {
    setEditingCat(cat);
    catForm.setFieldsValue({ name: cat.name, icon: cat.icon, color: cat.color, order: cat.order });
    setCatModal(true);
  };

  const handleSaveCat = async () => {
    try {
      const values = await catForm.validateFields();
      if (editingCat) {
        await propertyRatingApi.updateCategory(editingCat._id, values);
        message.success('更新成功');
      } else {
        await propertyRatingApi.createCategory({ ...values, community_id: communityId });
        message.success('创建成功');
      }
      setCatModal(false);
      loadCategories();
    } catch (err) {
      message.error(err.message || '操作失败');
    }
  };

  const handleDeleteCat = async (id) => {
    try {
      await propertyRatingApi.deleteCategory(id);
      message.success('删除成功');
      loadCategories();
    } catch (err) {
      message.error('删除失败');
    }
  };

  // ===== 小项操作 =====
  const openAddItem = (catId) => {
    setEditingCatId(catId);
    setEditingItem(null);
    itemForm.resetFields();
    setItemModal(true);
  };

  const openEditItem = (catId, item) => {
    setEditingCatId(catId);
    setEditingItem(item);
    itemForm.setFieldsValue({ item_name: item.item_name, order: item.order });
    setItemModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      if (editingItem) {
        await propertyRatingApi.updateItem(editingCatId, editingItem.item_key, values);
        message.success('小项更新成功');
      } else {
        const itemKey = values.item_key || `item_${Date.now()}`;
        await propertyRatingApi.addItem(editingCatId, { ...values, item_key: itemKey });
        message.success('小项添加成功');
      }
      setItemModal(false);
      loadCategories();
    } catch (err) {
      message.error(err.message || '操作失败');
    }
  };

  const handleDeleteItem = async (catId, itemKey) => {
    try {
      await propertyRatingApi.deleteItem(catId, itemKey);
      message.success('小项删除成功');
      loadCategories();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '分类',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{record.icon}</span>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <Tag color={record.color} style={{ marginLeft: 4 }}>{record.items?.length || 0}项</Tag>
          {!record.enabled && <Tag>已停用</Tag>}
        </span>
      ),
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 60,
    },
    {
      title: '小项',
      key: 'items',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(record.items || []).map(item => (
            <Tag
              key={item.item_key}
              closable
              onClose={() => handleDeleteItem(record._id, item.item_key)}
              onClick={() => openEditItem(record._id, item)}
              style={{ cursor: 'pointer' }}
            >
              {item.item_name}
            </Tag>
          ))}
          <Tag
            icon={<PlusOutlined />}
            style={{ cursor: 'pointer', borderStyle: 'dashed' }}
            onClick={() => openAddItem(record._id)}
          >
            添加
          </Tag>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditCat(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteCat(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>物业评价配置</h2>
          <p style={{ color: '#999', margin: '4px 0 0', fontSize: 13 }}>配置评价大项和小项，管理后台使用</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleSeed}>初始化四大类</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddCat}>新建分类</Button>
        </div>
      </div>

      <Card>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 大项 Modal */}
      <Modal
        title={editingCat ? '编辑分类' : '新建分类'}
        open={catModal}
        onOk={handleSaveCat}
        onCancel={() => setCatModal(false)}
        okText="保存"
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="如：安保、环境、保洁、服务" maxLength={30} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="icon" label="图标（emoji）" style={{ flex: 1 }}>
              <Input placeholder="🔒" maxLength={4} />
            </Form.Item>
            <Form.Item name="color" label="主题色" style={{ flex: 1 }}>
              <Input placeholder="#2DCCB6" />
            </Form.Item>
            <Form.Item name="order" label="排序" style={{ width: 80 }}>
              <InputNumber min={0} max={99} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 小项 Modal */}
      <Modal
        title={editingItem ? '编辑小项' : '新建小项'}
        open={itemModal}
        onOk={handleSaveItem}
        onCancel={() => setItemModal(false)}
        okText="保存"
      >
        <Form form={itemForm} layout="vertical">
          {!editingItem && (
            <Form.Item name="item_key" label="小项Key（英文，唯一）" rules={[{ required: true, message: '请输入Key' }]}>
              <Input placeholder="如：security_patrol" />
            </Form.Item>
          )}
          <Form.Item name="item_name" label="小项名称" rules={[{ required: true, message: '请输入小项名称' }]}>
            <Input placeholder="如：保安巡逻频次" maxLength={30} />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} max={99} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RatingCategoryManage;
