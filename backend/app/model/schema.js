/* eslint-disable */
module.exports = {
  // 图书模型
  Book: {
    type: 'object',
    properties: {
      isbn: { type: 'string' },
      title: { type: 'string' },
      author: { type: 'string' },
      publisher: { type: 'string' },
      category: { type: 'string' },
      cover: { type: 'string' },
      description: { type: 'string' },
      total: { type: 'number' },           // 总数量
      available: { type: 'number' },       // 可借数量
      location: { type: 'string' },        // 存放位置
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
  // 用户模型
  User: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
      name: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string' },
      points: { type: 'number' },         // 积分
      role: { type: 'string', enum: ['user', 'admin'] },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
  // 借阅记录模型
  BorrowRecord: {
    type: 'object',
    properties: {
      bookId: { type: 'objectId' },
      userId: { type: 'objectId' },
      borrowDate: { type: 'date' },
      dueDate: { type: 'date' },
      returnDate: { type: 'date' },
      status: { type: 'string', enum: ['borrowed', 'returned', 'overdue'] },
    },
  },
  // 预约模型
  Reservation: {
    type: 'object',
    properties: {
      bookId: { type: 'objectId' },
      userId: { type: 'objectId' },
      reserveDate: { type: 'date' },
      status: { type: 'string', enum: ['pending', 'cancelled', 'completed'] },
    },
  },
  // 积分兑换模型
  PointsItem: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      points: { type: 'number' },
      description: { type: 'string' },
      stock: { type: 'number' },
      image: { type: 'string' },
    },
  },
  // 通知模型
  Notification: {
    type: 'object',
    properties: {
      userId: { type: 'objectId' },
      title: { type: 'string' },
      content: { type: 'string' },
      type: { type: 'string' },
      read: { type: 'boolean' },
      createdAt: { type: 'date' },
    },
  },
};
