/* eslint-disable */
module.exports = {
  mongoose: {
    client: {
      url: 'mongodb://localhost:27017/library',
    },
  },
  cors: {
    origin: '*',
    credentials: true,
  },
  // 积分配置
  points: {
    shareBook: 5,           // 共享一本书获得积分
    borrowBook: 1,         // 借阅一次扣积分
    defaultPoints: 0,      // 新用户默认积分
  },
  // 借阅配置
  borrow: {
    maxDays: 30,           // 最大借阅天数
    maxBooks: 5,           // 最多同时借阅数量
  },
  security: {
    csrf: false,
  },
};
