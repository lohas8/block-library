/* eslint-disable */
module.exports = app => {
  const { router, controller } = app;

  // 图书相关
  router.get('/api/books', controller.book.list);
  router.get('/api/books/categories', controller.book.categories);
  router.get('/api/books/:id', controller.book.detail);
  router.post('/api/books', controller.book.create);
  router.put('/api/books/:id', controller.book.update);
  router.delete('/api/books/:id', controller.book.delete);
  router.post('/api/books/import', controller.book.import);
  router.get('/api/books/export', controller.book.export);

  // 用户相关
  router.post('/api/users/register', controller.user.register);
  router.post('/api/users/login', controller.user.login);
  router.get('/api/users', controller.user.list);
  router.get('/api/users/:id', controller.user.detail);
  router.put('/api/users/:id', controller.user.update);
  router.post('/api/users/:id/points', controller.user.updatePoints);
  router.get('/api/users/:id/borrow-history', controller.user.borrowHistory);

  // 借阅相关
  router.post('/api/borrow', controller.borrow.borrow);
  router.post('/api/borrow/return/:id', controller.borrow.return);
  router.get('/api/borrow', controller.borrow.list);
  router.post('/api/reserve', controller.borrow.reserve);
  router.post('/api/reserve/cancel/:id', controller.borrow.cancelReserve);
  router.get('/api/reserve', controller.borrow.reservationList);
  router.get('/api/statistics', controller.borrow.statistics);

  // 积分兑换
  router.get('/api/points/items', controller.points.itemList);
  router.post('/api/points/items', controller.points.createItem);
  router.put('/api/points/items/:id', controller.points.updateItem);
  router.delete('/api/points/items/:id', controller.points.deleteItem);
  router.post('/api/points/exchange', controller.points.exchange);

  // 通知
  router.get('/api/notifications', controller.notification.list);
  router.post('/api/notifications/:id/read', controller.notification.markRead);
  router.post('/api/notifications/read-all', controller.notification.markAllRead);
  router.delete('/api/notifications/:id', controller.notification.delete);
  router.post('/api/notifications', controller.notification.create);

  // 议事模块 - 议题
  router.get('/api/topics', controller.topic.list);
  router.get('/api/topics/:id', controller.topic.detail);
  router.post('/api/topics', controller.topic.create);
  router.put('/api/topics/:id/status', controller.topic.updateStatus);
  router.put('/api/topics/:id/focus', controller.topic.setFocus);
  router.post('/api/topics/:id/follow', controller.topic.follow);

  // 议事模块 - 评论
  router.get('/api/comments', controller.comment.list);
  router.post('/api/topics/:topic_id/comments', controller.comment.create);
  router.delete('/api/topics/:topic_id/comments/:id', controller.comment.delete);
};
