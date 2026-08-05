/**
 * ObjectId 校验中间件
 * 将所有 :id 参数校验为有效的 MongoDB ObjectId
 * 无效时直接返回 404，不继续传递给控制器
 */
const mongoose = require('mongoose');

module.exports = () => {
  return async function validateObjectId(ctx, next) {
    const { id } = ctx.params;
    if (id !== undefined && id !== null) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        ctx.status = 404;
        ctx.body = { code: 404, msg: '资源不存在', data: null };
        return;
      }
    }
    await next();
  };
};
