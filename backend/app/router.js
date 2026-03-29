/* eslint-disable */
module.exports = app => {
  const { router, controller } = app;
  const { wrapper } = app.ctx.helper;

  // 图书相关
  router.get('/api/books', wrapper(controller.book.list));
  router.get('/api/books/categories', wrapper(controller.book.categories));
  router.get('/api/books/:id', wrapper(controller.book.detail));
  router.post('/api/books', wrapper(controller.book.create));
  router.put('/api/books/:id', wrapper(controller.book.update));
  router.delete('/api/books/:id', wrapper(controller.book.delete));
  router.post('/api/books/import', wrapper(controller.book.import));
  router.get('/api/books/export', wrapper(controller.book.export));

  // 用户相关
  router.post('/api/users/register', wrapper(controller.user.register));
  router.post('/api/users/login', wrapper(controller.user.login));
  router.get('/api/users', wrapper(controller.user.list));
  router.get('/api/users/:id', wrapper(controller.user.detail));
  router.put('/api/users/:id', wrapper(controller.user.update));
  router.post('/api/users/:id/points', wrapper(controller.user.updatePoints));
  router.get('/api/users/:id/borrow-history', wrapper(controller.user.borrowHistory));

  // 借阅相关
  router.post('/api/borrow', wrapper(controller.borrow.borrow));
  router.post('/api/borrow/return/:id', wrapper(controller.borrow.return));
  router.get('/api/borrow', wrapper(controller.borrow.list));
  router.post('/api/reserve', wrapper(controller.borrow.reserve));
  router.post('/api/reserve/cancel/:id', wrapper(controller.borrow.cancelReserve));
  router.get('/api/reserve', wrapper(controller.borrow.reservationList));
  router.get('/api/statistics', wrapper(controller.borrow.statistics));

  // 积分兑换
  router.get('/api/points/items', wrapper(controller.points.itemList));
  router.post('/api/points/items', wrapper(controller.points.createItem));
  router.put('/api/points/items/:id', wrapper(controller.points.updateItem));
  router.delete('/api/points/items/:id', wrapper(controller.points.deleteItem));
  router.post('/api/points/exchange', wrapper(controller.points.exchange));

  // 通知
  router.get('/api/notifications', wrapper(controller.notification.list));
  router.post('/api/notifications/:id/read', wrapper(controller.notification.markRead));
  router.post('/api/notifications/read-all', wrapper(controller.notification.markAllRead));
  router.delete('/api/notifications/:id', wrapper(controller.notification.delete));
  router.post('/api/notifications', wrapper(controller.notification.create));
};
