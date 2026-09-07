/**
 * 规则评估模块 API 测试
 * 测试自动评分和图片凭证功能
 */
const request = require('supertest');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:7001';

const TEST_COMMUNITY = 'test-community-ev';

describe('规则评估模块 API 测试', () => {
  let userToken;
  let userId;
  let ruleId;
  let approvalId;
  let evaluationId;

  const TEST_USER = {
    username: 'evaluser_' + Date.now(),
    password: 'user123',
    name: '评估测试用户',
  };

  const TEST_RULE = {
    name: '测试规则-自动评分',
    content: '上传凭证图片即可获得积分',
    points: 50,
    type: 'reward',
    communityId: TEST_COMMUNITY,
  };

  // beforeAll: 准备测试数据
  beforeAll(async () => {
    // 1. 注册用户
    await request(BASE_URL)
      .post('/api/users/register')
      .send(TEST_USER)
      .catch(() => {});

    // 2. 登录
    const userLoginRes = await request(BASE_URL)
      .post('/api/users/login')
      .send({ username: TEST_USER.username, password: TEST_USER.password });

    if (userLoginRes.body.data) {
      userToken = userLoginRes.body.data.token;
      userId = userLoginRes.body.data.user?.id || userLoginRes.body.data.user?._id;
    }

    // 3. 创建规则
    const ruleRes = await request(BASE_URL)
      .post('/api/rules')
      .set('Authorization', `Bearer ${userToken}`)
      .send(TEST_RULE);

    if (ruleRes.body.code === 0) {
      ruleId = ruleRes.body.data._id;
    }

    // 4. 创建申请记录
    const applyRes = await request(BASE_URL)
      .post(`/api/rules/${ruleId}/apply`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ remark: '测试申请' });

    if (applyRes.body.code === 0) {
      approvalId = applyRes.body.data._id;
    }
  }, 30000);

  // =============================================
  // 创建评估记录（无图片）
  // =============================================
  describe('POST /api/rule-evaluations - 创建评估记录', () => {
    it('应能创建评估记录（无图片，状态pending）', async () => {
      // 使用新的规则和申请
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '新规则', points: 30, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '新申请' });

      const newApprovalId = newApplyRes.body.data._id;

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApprovalId,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      expect(evalRes.body.code).toBe(0);
      expect(evalRes.body.data.status).toBe('pending');
      expect(evalRes.body.data.points).toBe(0);
      evaluationId = evalRes.body.data._id;
    });

    it('创建评估记录（有图片，自动评分）', async () => {
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '规则-有图片', points: 40, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '带图片申请' });

      const newApprovalId = newApplyRes.body.data._id;

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApprovalId,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: ['https://example.com/proof1.jpg', 'https://example.com/proof2.jpg'],
        });

      expect(evalRes.body.code).toBe(0);
      expect(evalRes.body.data.status).toBe('scored');
      expect(evalRes.body.data.points).toBe(40);
      expect(evalRes.body.data.autoScored).toBe(true);
    });

    it('已有评估记录的申请不能重复创建', async () => {
      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: approvalId,  // 重复的申请ID
          ruleId: ruleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      expect(evalRes.body.code).not.toBe(0);
    });

    it('缺少必填字段应返回错误', async () => {
      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleId: ruleId,
          // 缺少 ruleApprovalId
        });

      expect(evalRes.body.code).not.toBe(0);
    });
  });

  // =============================================
  // 评估详情
  // =============================================
  describe('GET /api/rule-evaluations/:id - 评估详情', () => {
    it('应能获取评估详情', async () => {
      if (!evaluationId) return;

      const res = await request(BASE_URL)
        .get(`/api/rule-evaluations/${evaluationId}`);

      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('ruleApprovalId');
      expect(res.body.data).toHaveProperty('ruleId');
    });

    it('不存在的ID应返回404', async () => {
      const fakeId = '000000000000000000000000';
      const res = await request(BASE_URL)
        .get(`/api/rule-evaluations/${fakeId}`);

      expect(res.body.code).not.toBe(0);
    });
  });

  // =============================================
  // 评估列表
  // =============================================
  describe('GET /api/rule-evaluations - 评估列表', () => {
    it('应能获取评估列表', async () => {
      const res = await request(BASE_URL)
        .get('/api/rule-evaluations')
        .query({ communityId: TEST_COMMUNITY });

      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.list)).toBe(true);
    });

    it('支持按状态筛选', async () => {
      const res = await request(BASE_URL)
        .get('/api/rule-evaluations')
        .query({ status: 'scored' });

      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.list)).toBe(true);
    });

    it('支持分页', async () => {
      const res = await request(BASE_URL)
        .get('/api/rule-evaluations')
        .query({ page: 1, pageSize: 5 });

      expect(res.body.code).toBe(0);
      expect(res.body.total).toBeDefined();
      expect(res.body.list.length).toBeLessThanOrEqual(5);
    });
  });

  // =============================================
  // 上传图片凭证
  // =============================================
  describe('POST /api/rule-evaluations/:id/images - 上传图片凭证', () => {
    it('应能追加图片凭证并触发自动评分', async () => {
      // 创建待评分评估
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '规则-上传图片', points: 60, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '上传图片测试' });

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApplyRes.body.data._id,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      const evalId = evalRes.body.data._id;
      expect(evalRes.body.data.status).toBe('pending');

      // 上传图片 -> 应触发自动评分
      const uploadRes = await request(BASE_URL)
        .post(`/api/rule-evaluations/${evalId}/images`)
        .send({
          images: ['https://example.com/proof3.jpg', 'https://example.com/proof4.jpg'],
        });

      expect(uploadRes.body.code).toBe(0);
      expect(uploadRes.body.data.images.length).toBe(2);
      expect(uploadRes.body.data.status).toBe('scored');
    });

    it('图片数量不超过9张', async () => {
      // 创建评估
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '规则-图片上限', points: 20, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '图片上限测试' });

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApplyRes.body.data._id,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      const evalId = evalRes.body.data._id;

      // 上传10张图片 -> 只会保留前9张
      const manyImages = Array.from({ length: 10 }, (_, i) => `https://example.com/img${i}.jpg`);
      const uploadRes = await request(BASE_URL)
        .post(`/api/rule-evaluations/${evalId}/images`)
        .send({ images: manyImages });

      expect(uploadRes.body.data.images.length).toBe(9);
    });

    it('images参数必须是数组', async () => {
      if (!evaluationId) return;

      const res = await request(BASE_URL)
        .post(`/api/rule-evaluations/${evaluationId}/images`)
        .send({ images: 'not-an-array' });

      expect(res.body.code).not.toBe(0);
    });
  });

  // =============================================
  // 手动评分
  // =============================================
  describe('POST /api/rule-evaluations/:id/score - 手动评分', () => {
    it('应能手动评分', async () => {
      // 创建待评分评估
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '规则-手动评分', points: 30, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '手动评分测试' });

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApplyRes.body.data._id,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      const evalId = evalRes.body.data._id;

      // 手动评分
      const scoreRes = await request(BASE_URL)
        .post(`/api/rule-evaluations/${evalId}/score`)
        .send({ points: 100, remark: '额外奖励' });

      expect(scoreRes.body.code).toBe(0);
      expect(scoreRes.body.data.status).toBe('scored');
      expect(scoreRes.body.data.points).toBe(100);
      expect(scoreRes.body.data.autoScored).toBe(false);
    });
  });

  // =============================================
  // 驳回评估
  // =============================================
  describe('POST /api/rule-evaluations/:id/reject - 驳回评估', () => {
    it('应能驳回评估', async () => {
      // 创建待评分评估
      const newRuleRes = await request(BASE_URL)
        .post('/api/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '规则-驳回', points: 30, communityId: TEST_COMMUNITY });

      const newRuleId = newRuleRes.body.data._id;

      const newApplyRes = await request(BASE_URL)
        .post(`/api/rules/${newRuleId}/apply`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ remark: '驳回测试' });

      const evalRes = await request(BASE_URL)
        .post('/api/rule-evaluations')
        .send({
          ruleApprovalId: newApplyRes.body.data._id,
          ruleId: newRuleId,
          userId: userId,
          userName: TEST_USER.name,
          communityId: TEST_COMMUNITY,
          images: [],
        });

      const evalId = evalRes.body.data._id;

      // 驳回
      const rejectRes = await request(BASE_URL)
        .post(`/api/rule-evaluations/${evalId}/reject`)
        .send({ remark: '凭证不符合要求' });

      expect(rejectRes.body.code).toBe(0);
      expect(rejectRes.body.data.status).toBe('rejected');
      expect(rejectRes.body.data.remark).toBe('凭证不符合要求');
    });
  });

  // =============================================
  // 清理测试数据
  // =============================================
  describe('清理测试数据', () => {
    it('删除测试规则', async () => {
      if (ruleId) {
        await request(BASE_URL)
          .delete(`/api/rules/${ruleId}`)
          .set('Authorization', `Bearer ${userToken}`);
      }
    });
  });
});
