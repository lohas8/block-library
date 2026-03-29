import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, Modal, message, Card, Row, Col } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { borrowApi, bookApi, userApi } from '../../api';
import { useSelector } from 'react-redux';
import { setBorrowList } from '../../store';
import { useDispatch } from 'react-redux';

const { Option } = Select;

const BorrowManage = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const { list, total } = useSelector(state => state.borrow);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10, status: '' });
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrowForm] = useState({ bookId: '', userId: '' });

  useEffect(() => {
    loadBorrows();
  }, [params]);

  const loadBorrows = async () => {
    setLoading(true);
    try {
      const res = await borrowApi.list(params);
      dispatch(setBorrowList(res.data));
    } catch (error) {
      message.error('获取借阅记录失败');
    }
    setLoading(false);
  };

  const loadBooks = async () => {
    try {
      const res = await bookApi.list({ pageSize: 100 });
      setBooks(res.data.list);
    } catch (error) {
      console.error('获取图书列表失败', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userApi.list({ pageSize: 100 });
      setUsers(res.data.list);
    } catch (error) {
      console.error('获取用户列表失败', error);
    }
  };

  const handleBorrow = async () => {
    if (!borrowForm.bookId || !borrowForm.userId) {
      return message.warning('请选择图书和用户');
    }
    try {
      await borrowApi.borrow({ bookId: borrowForm.bookId, userId: borrowForm.userId });
      message.success('借阅成功');
      setBorrowModalVisible(false);
      loadBorrows();
    } catch (error) {
      message.error(error.response?.data?.msg || '借阅失败');
    }
  };

  const handleReturn = async (id) => {
    try {
      await borrowApi.return(id);
      message.success('归还成功');
      loadBorrows();
    } catch (error) {
      message.error(error.response?.data?.msg || '归还失败');
    }
  };

  const getStatusTag = (status) => {
    const tags = {
      borrowed: <Tag color="blue">借阅中</Tag>,
      returned: <Tag color="green">已归还</Tag>,
      overdue: <Tag color="red">已逾期</Tag>,
    };
    return tags[status] || status;
  };

  const columns = [
    {
      title: '图书',
      dataIndex: ['bookId', 'title'],
      key: 'book',
      render: (text, record) => record.bookId?.title || '-',
    },
    {
      title: '借阅人',
      dataIndex: ['userId', 'name'],
      key: 'user',
      render: (text, record) => record.userId?.name || '-',
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '应还日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'borrowed' && (
          <Button type="link" onClick={() => handleReturn(record._id)}>
            归还
          </Button>
        )
      ),
    },
  ];

  return (
    <div>
      <h1>📖 借阅管理</h1>
      
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="借阅状态"
          allowClear
          onChange={(status) => setParams({ ...params, status, page: 1 })}
          style={{ width: 120 }}
        >
          <Option value="borrowed">借阅中</Option>
          <Option value="returned">已归还</Option>
          <Option value="overdue">已逾期</Option>
        </Select>
        {info?.role === 'admin' && (
          <Button type="primary" icon={<BookOutlined />} onClick={() => {
            setBorrowModalVisible(true);
            loadBooks();
            loadUsers();
          }}>
            借阅图书
          </Button>
        )}
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
        title="借阅图书"
        open={borrowModalVisible}
        onCancel={() => setBorrowModalVisible(false)}
        onOk={handleBorrow}
      >
        <Form layout="vertical">
          <Form.Item label="选择图书">
            <Select
              placeholder="请选择图书"
              onChange={(value) => borrowForm.bookId = value}
              showSearch
              optionFilterProp="children"
            >
              {books.filter(b => b.available > 0).map(book => (
                <Option key={book._id} value={book._id}>
                  {book.title} (可借: {book.available})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="选择用户">
            <Select
              placeholder="请选择用户"
              onChange={(value) => borrowForm.userId = value}
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BorrowManage;
