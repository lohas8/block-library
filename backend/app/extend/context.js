/**
 * Context 扩展
 * 为 ctx 添加 success/fail 快捷方法
 */
const { BaseController } = require('../core/base_controller');

module.exports = {
  success(data, msg = 'success') {
    this.body = {
      code: 0,
      msg,
      data,
    };
    this.status = 200;
  },
  fail(msg, code = -1) {
    this.body = {
      code,
      msg,
      data: null,
    };
    this.status = 200;
  },
};
