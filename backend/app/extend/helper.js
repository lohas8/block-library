/* eslint-disable */
const Controller = require('egg').Controller;

class HelperController extends Controller {
  // 统一成功响应
  success(data, msg = 'success') {
    const { ctx } = this;
    ctx.body = {
      code: 0,
      msg,
      data,
    };
    ctx.status = 200;
  }

  // 统一失败响应
  fail(msg, code = -1) {
    const { ctx } = this;
    ctx.body = {
      code,
      msg,
      data: null,
    };
    ctx.status = 200;
  }
}

// 包装函数：自动捕获错误
function wrapper(fn) {
  return async function(ctx) {
    const controller = new HelperController();
    controller.ctx = ctx;
    try {
      await fn.call(controller, ctx);
    } catch (err) {
      ctx.logger.error(err);
      controller.fail(err.message || '服务器错误');
    }
  };
}

module.exports = {
  wrapper,
};
