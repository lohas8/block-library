/**
 * 统一业务异常定义
 * 所有业务异常使用 AppError，Controller 层通过 try/catch 统一处理
 */

class AppError extends Error {
  constructor(message, code = 'APP_ERROR', status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AppError';
  }
}

// 权限类错误（403）
class ForbiddenError extends AppError {
  constructor(message = '无权限访问') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

// 未认证错误（401）
class UnauthorizedError extends AppError {
  constructor(message = '请先登录') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

// 资源不存在（404）
class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// 参数校验失败（422）
class ValidationError extends AppError {
  constructor(message = '参数错误') {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

// 冲突错误（409），如资源已存在
class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

module.exports = {
  AppError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
};