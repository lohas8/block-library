/**
 * 认证中间件
 * 从 Authorization: Bearer <token> 解析用户信息，设置 ctx.state.user
 * token 格式: base64(userId:username:role)
 */
module.exports = () => {
  return async function auth(ctx, next) {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.state.user = null;
      return await next();
    }

    const token = authHeader.slice(7);
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');
      ctx.state.user = {
        id: parts[0] || null,
        username: parts[1] || null,
        role: parts[2] || 'user',
      };
    } catch (e) {
      ctx.state.user = null;
    }

    await next();
  };
};
