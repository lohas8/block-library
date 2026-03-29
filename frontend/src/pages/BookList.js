import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Select, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { bookApi } from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { setBooks, setCategories, addBook, updateBook, deleteBook } from '../../store';

const { Option } = Select;

const BookList = () => {
  const dispatch = useDispatch();
  const { list, total, categories } = useSelector(state => state.books);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '', category: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, [params]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await bookApi.list(params);
      dispatch(setBooks(res.data));
    } catch (error) {
      message.error('获取图书列表失败');
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await bookApi.categories();
      dispatch(setCategories(res.data));
    } catch (error) {
      console.error('获取分类失败', error);
    }
  };

  const handleSearch = (keyword) => {
    setParams({ ...params, keyword, page: 1 });
  };

  const handleCategoryChange = (category) => {
    setParams({ ...params, category, page: 1 });
  };

  const handleAdd = () => {
    setEditingBook(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBook(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await bookApi.delete(id);
      dispatch(deleteBook(id));
      message.success('删除成功');
    } catch (error) {
      message.error(error.response?.data?.msg || '删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBook) {
        await bookApi.update(editingBook._id, values);
        dispatch(updateBook({ ...editingBook, ...values }));
        message.success('更新成功');
      } else {
        const res = await bookApi.create(values);
        dispatch(addBook(res.data));
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.msg || '操作失败');
    }
  };

  const columns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '库存',
      dataIndex: 'available',
      key: 'available',
      render: (text, record) => `${text}/${record.total}`,
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>📚 图书管理</h1>
      
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索书名/作者/ISBN"
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Select
          placeholder="选择分类"
          allowClear
          onChange={handleCategoryChange}
          style={{ width: 150 }}
        >
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加图书
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={list}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total,
          onChange: (page) => setParams({ ...params, page }),
        }}
      />

      <Modal
        title={editingBook ? '编辑图书' : '添加图书'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="书名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="出版社">
            <Input />
          </Form.Item>
          <Form.Item name="total" label="数量" initialValue={1}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookList;
