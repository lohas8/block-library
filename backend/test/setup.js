/**
 * 基础测试配置
 * Jest 30 配置
 */

const request = require('supertest');

// 全局超时配置
jest.setTimeout(10000);

// 测试配置
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

// 全局 beforeAll - 确保测试服务器运行
beforeAll(async () => {
  try {
    await request(BASE_URL).get('/api/books').timeout(5000);
    console.log('✅ 测试服务器已连接');
  } catch (error) {
    console.warn('⚠️ 测试服务器未运行，部分测试将被跳过');
  }
});

// 全局 afterAll
afterAll(async () => {
  console.log('🧹 测试完成');
});

// 辅助函数
const generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

const generateRandomPhone = () => {
  return `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
};

global.testHelpers = {
  generateRandomString,
  generateRandomPhone,
  BASE_URL
};
