/* eslint-disable */
module.exports = app => {
  app.beforeStart(async () => {
    // 等待 MongoDB 连接
    await app.model.Book.findOne().catch(() => {
      app.logger.error('MongoDB 连接失败');
    });
    app.logger.info('MongoDB 已连接');
  });
};
