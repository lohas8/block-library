/* eslint-disable */

/**
 * ObjectId 校验中间件
 * 只对 :id 参数进行校验
 * - 24位十六进制字符串 → 通过
 * - 纯数字字符串 → 跳过（业务层处理）
 * - 其他格式 → 返回 404
 */
module.exports = app => {
  const { router, controller } = app;

  // 校验 :id 参数是否为有效的 ObjectId
  // 纯数字的 id（如测试中的 1, 99999）直接放行，由业务层处理
  const validateObjectId = () => {
    return async (ctx, next) => {
      const { id } = ctx.params;
      if (id !== undefined && id !== null) {
        // 纯数字放行
        if (/^\d+$/.test(id)) {
          await next();
          return;
        }
        // 24位十六进制才校验
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
          ctx.status = 404;
          ctx.body = { code: 404, msg: '资源不存在', data: null };
          return;
        }
      }
      await next();
    };
  };

  // 图书相关（具体路径在前，参数路径在后）
  router.get('/api/books/categories', controller.book.categories);
  router.post('/api/books/import', controller.book.import);
  router.get('/api/books/export', controller.book.export);
  router.get('/api/books', controller.book.list);
  router.get('/api/books/:id', controller.book.detail);
  router.post('/api/books', controller.book.create);
  router.put('/api/books/:id', controller.book.update);
  router.delete('/api/books/:id', controller.book.delete);

  // 用户相关
  router.post('/api/users/register', controller.user.register);
  router.post('/api/users/login', controller.user.login);
  router.get('/api/users', controller.user.list);
  router.get('/api/users/:id', validateObjectId());
  router.put('/api/users/:id', validateObjectId());
  router.post('/api/users/:id/points', validateObjectId());
  router.get('/api/users/:id/borrow-history', validateObjectId());
  router.get('/api/users/:id/invites', controller.user.getInvites);
  router.get('/api/users/:id/invited-by', controller.user.getInvitedBy);
  router.get('/api/users/:id/applied-rules', controller.user.getAppliedRules);

  // 借阅相关
  router.post('/api/borrow', controller.borrow.borrow);
  router.get('/api/borrow', controller.borrow.list);
  router.post('/api/borrow/return/:id', validateObjectId());
  router.post('/api/reserve', controller.borrow.reserve);
  router.get('/api/reserve', controller.borrow.reservationList);
  router.post('/api/reserve/cancel/:id', validateObjectId());
  router.get('/api/statistics', controller.borrow.statistics);

  // 积分兑换
  router.get('/api/points/items', controller.points.itemList);
  router.post('/api/points/items', controller.points.createItem);
  router.post('/api/points/exchange', controller.points.exchange);
  router.put('/api/points/items/:id', validateObjectId());
  router.delete('/api/points/items/:id', validateObjectId());

  // 通知
  router.get('/api/notifications', controller.notification.list);
  router.post('/api/notifications/read-all', controller.notification.markAllRead);
  router.post('/api/notifications', controller.notification.create);
  router.post('/api/notifications/:id/read', validateObjectId());
  router.delete('/api/notifications/:id', validateObjectId());

  // 议事模块 - 议题
  router.get('/api/topics', controller.topic.list);
  router.get('/api/topics/:id', validateObjectId());
  router.post('/api/topics', controller.topic.create);
  router.put('/api/topics/:id/status', validateObjectId());
  router.put('/api/topics/:id/focus', validateObjectId());
  router.post('/api/topics/:id/follow', validateObjectId());

  // 议事模块 - 评论
  router.get('/api/comments', controller.comment.list);
  router.post('/api/topics/:topic_id/comments', controller.comment.create);
  router.delete('/api/topics/:topic_id/comments/:id', validateObjectId());

  // 投票模块
  router.get('/api/votes', controller.vote.list);
  router.get('/api/votes/:id', validateObjectId());
  router.post('/api/votes', controller.vote.create);
  router.post('/api/votes/:id/cast', validateObjectId());
  router.post('/api/votes/:id/close', validateObjectId());

  // 物业评价（具体路径在前，参数路径在后）
  router.get('/api/property-ratings/stats', controller.ratingResult.stats);
  router.get('/api/property-ratings/check', controller.ratingResult.check);
  router.get('/api/property-ratings', controller.ratingCategory.list);
  router.post('/api/property-ratings', controller.ratingResult.submit);

  // 物业评价配置（管理员）
  router.get('/api/rating-categories', controller.ratingCategory.list);
  router.post('/api/rating-categories', controller.ratingCategory.create);
  router.put('/api/rating-categories/:id', validateObjectId());
  router.delete('/api/rating-categories/:id', validateObjectId());

  // 工具共享模块
  router.get('/api/tools', controller.tool.list);
  router.get('/api/tools/categories', controller.tool.categories);
  router.get('/api/tools/statistics', controller.tool.statistics);
  router.get('/api/tools/:id', validateObjectId());
  router.post('/api/tools', controller.tool.create);
  router.put('/api/tools/:id', validateObjectId());
  router.delete('/api/tools/:id', validateObjectId());
  router.post('/api/tools/rent', controller.tool.rent);
  router.post('/api/tools/return/:id', validateObjectId());

  // 小区管理模块
  router.get('/api/communities', controller.community.list);
  router.get('/api/communities/:id', validateObjectId());
  router.post('/api/communities', controller.community.create);
  router.put('/api/communities/:id', validateObjectId());
  router.delete('/api/communities/:id', validateObjectId());

  // 规则管理模块
  router.get('/api/rules', controller.rule.list);
  router.get('/api/rules/approvals', controller.rule.listApprovals);
  router.get('/api/rules/:id', controller.rule.detail);
  router.post('/api/rules', controller.rule.create);
  router.put('/api/rules/:id', controller.rule.update);
  router.delete('/api/rules/:id', controller.rule.delete);
  router.post('/api/rules/:id/apply', controller.rule.apply);
  router.post('/api/rules/approvals/:id/approve', controller.rule.approve);
  router.post('/api/rules/approvals/:id/reject', controller.rule.reject);

  // 规则评估模块（自动评分 + 图片凭证）
  router.post('/api/rule-evaluations', controller.ruleEvaluation.create);
  router.get('/api/rule-evaluations', controller.ruleEvaluation.list);
  router.get('/api/rule-evaluations/user/:userId', controller.ruleEvaluation.getByUser);
  router.get('/api/rule-evaluations/:id', controller.ruleEvaluation.detail);
  router.post('/api/rule-evaluations/:id/score', controller.ruleEvaluation.score);
  router.post('/api/rule-evaluations/:id/reject', controller.ruleEvaluation.reject);
  router.post('/api/rule-evaluations/:id/images', controller.ruleEvaluation.uploadImages);
};
