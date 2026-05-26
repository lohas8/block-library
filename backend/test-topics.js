/**
 * 议事模块 + 评论模块 基本用例验证脚本
 * 运行方式: cd backend && node test-topics.js
 * 前置条件: mock-server.js 已启动 (node mock-server.js)
 */

const http = require('http');

const BASE = 'http://localhost:7002';
let token = '';
let userId = '';
let topicId = '';
let commentId = '';
let adminToken = 'mock-admin-token-2026';
let adminUserId = 'admin001';

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const assert = (condition, message) => {
  if (condition) {
    console.log(`  ✅ ${message}`);
  } else {
    console.error(`  ❌ ${message}`);
    process.exitCode = 1;
  }
};

async function run() {
  console.log('\n📋 议事模块 基本用例验证\n');
  console.log('='.repeat(50));

  // ── 前置检查：mock server 在线 ────────────────────────
  console.log('\n🔹 前置: 确认 mock server 在线');
  const health = await request('GET', '/api/topics');
  assert(health.status === 200, `Mock server 正常 (HTTP ${health.status})`);

  // ── 用例 1: 获取 token（mock server 不支持真实注册，直接用已认证 token）──
  console.log('\n🔹 用例 1: 获取普通用户 token（mock 直接登录）');
  const loginRes = await request('POST', '/api/users/login', { username: 'zhangsan', password: 'xxx' });
  assert(loginRes.status === 200, `登录 HTTP ${loginRes.status}`);
  token = loginRes.data?.token;
  userId = loginRes.data?._id || 'u2';
  assert(token, `普通用户 token: ${token?.substring(0, 20)}...`);

  // ── 用例 2: 管理员 token ─────────────────────────────
  console.log('\n🔹 用例 2: 管理员 token');
  const adminLogin = await request('POST', '/api/users/login', { username: 'admin', password: 'admin123' });
  assert(adminLogin.status === 200, 'admin 登录成功');
  adminToken = adminLogin.data?.token;
  adminUserId = adminLogin.data?._id;
  assert(adminToken, `admin token: ${adminToken?.substring(0, 20)}...`);

  // ── 用例 3: 创建议题 ────────────────────────────────
  console.log('\n🔹 用例 3: 创建议题');
  const createRes = await request('POST', '/api/topics', {
    title: '关于东门垃圾分类点位调整的建议',
    content: '目前东门分类点位设置在主通道旁，早高峰时段容易造成拥堵，建议迁移至小区花园旁空闲区域...',
  }, token);
  assert(createRes.status === 200, `创建 HTTP ${createRes.status}`);
  topicId = createRes.data?._id;
  assert(topicId, `获取 topicId: ${topicId}`);
  assert(createRes.data?.status === 'pending', `默认状态 pending（实际：${createRes.data?.status}）`);

  // ── 用例 4: 议题列表 ────────────────────────────────
  console.log('\n🔹 用例 4: 议题列表');
  const listRes = await request('GET', '/api/topics?page=1&pageSize=10&sort=hot');
  assert(listRes.status === 200, `列表 HTTP ${listRes.status}`);
  assert(Array.isArray(listRes.data?.list), 'list 字段为数组');
  const total = listRes.data?.total;
  assert(total >= 1, `列表有数据 (total=${total})`);
  const found = listRes.data.list.find(t => t._id === topicId);
  assert(found, '新创建的议题出现在列表中');

  // ── 用例 5: 议题详情 ────────────────────────────────
  console.log('\n🔹 用例 5: 议题详情');
  const detailRes = await request('GET', `/api/topics/${topicId}`);
  assert(detailRes.status === 200, `详情 HTTP ${detailRes.status}`);
  assert(detailRes.data?._id === topicId, '返回正确的议题 ID');
  assert(detailRes.data?.follow_count === 0, `初始关注数为 0（实际：${detailRes.data?.follow_count}）`);
  assert(detailRes.data?.comment_count === 0, `初始评论数为 0（实际：${detailRes.data?.comment_count}）`);

  // ── 用例 6: 关注议题 ────────────────────────────────
  console.log('\n🔹 用例 6: 关注议题');
  const followRes = await request('POST', `/api/topics/${topicId}/follow`, {
    action: 'follow',
    user_id: userId,
  }, token);
  assert(followRes.status === 200, `关注 HTTP ${followRes.status}`);
  const followCountAfter = followRes.data?.follow_count;
  assert(followCountAfter === 1, `关注数更新为 1（实际：${followCountAfter}）`);

  // ── 用例 7: 取消关注 ────────────────────────────────
  console.log('\n🔹 用例 7: 取消关注');
  const unfollowRes = await request('POST', `/api/topics/${topicId}/follow`, {
    action: 'unfollow',
    user_id: userId,
  }, token);
  assert(unfollowRes.status === 200, `取消关注 HTTP ${unfollowRes.status}`);
  const unfollowCount = unfollowRes.data?.follow_count;
  assert(unfollowCount === 0, `关注数重置为 0（实际：${unfollowCount}）`);

  // ── 用例 8: 发评论 ────────────────────────────────
  console.log('\n🔹 用例 8: 发评论');
  const commentRes = await request('POST', `/api/topics/${topicId}/comments`, {
    content: '支持这个建议！确实每天早上都很堵。',
    author_id: userId,
    author_name: '张三',
  }, token);
  assert(commentRes.status === 200, `评论 HTTP ${commentRes.status}`);
  commentId = commentRes.data?._id;
  assert(commentId, `获取 commentId: ${commentId}`);

  // ── 用例 9: 评论列表 ──────────────────────────────
  console.log('\n🔹 用例 9: 评论列表');
  const commentListRes = await request('GET', `/api/comments?topic_id=${topicId}&sort=asc`);
  assert(commentListRes.status === 200, `评论列表 HTTP ${commentListRes.status}`);
  assert(commentListRes.data?.list?.length >= 1, `评论列表有数据（实际：${commentListRes.data?.list?.length}）`);

  // ── 用例 10: 再发一条评论 ───────────────────────────
  console.log('\n🔹 用例 10: 再发一条评论');
  const comment2 = await request('POST', `/api/topics/${topicId}/comments`, {
    content: '建议物业实地考察后给出具体方案。',
    author_id: userId,
    author_name: '张三',
  }, token);
  assert(comment2.status === 200, `第二条评论 HTTP ${comment2.status}`);

  // ── 用例 11: 管理员设置置顶 ──────────────────────────
  console.log('\n🔹 用例 11: 管理员设置置顶');
  const focusRes = await request('PUT', `/api/topics/${topicId}/focus`, { is_focused: true }, adminToken);
  assert(focusRes.status === 200, `置顶 HTTP ${focusRes.status}`);
  assert(focusRes.data?.is_focused === true, `is_focused=true（实际：${focusRes.data?.is_focused}）`);
  assert(!!focusRes.data?.focused_at, 'focused_at 已设置');

  // ── 用例 12: 管理员修改状态 ──────────────────────────
  console.log('\n🔹 用例 12: 管理员修改状态');
  const statusRes = await request('PUT', `/api/topics/${topicId}/status`, { status: 'accepted' }, adminToken);
  assert(statusRes.status === 200, `状态修改 HTTP ${statusRes.status}`);
  assert(statusRes.data?.status === 'accepted', `状态已更新（实际：${statusRes.data?.status}）`);

  // ── 用例 13: 热度分已计算 ──────────────────────────────
  console.log('\n🔹 用例 13: 热度分已计算');
  const hotRes = await request('GET', `/api/topics/${topicId}`);
  const hotScore = hotRes.data?.hot_score;
  console.log(`  ℹ️  当前热度分: ${hotScore}`);
  assert(typeof hotScore === 'number' && hotScore >= 0, `热度分为有效数字（实际：${hotScore}）`);

  // ── 用例 14: 已关闭议题禁止评论 ─────────────────────
  console.log('\n🔹 用例 14: 已关闭议题禁止评论');
  await request('PUT', `/api/topics/${topicId}/status`, { status: 'closed' }, adminToken);
  const closedComment = await request('POST', `/api/topics/${topicId}/comments`, { content: '此评论不应出现' }, token);
  assert(closedComment.status !== 200, `已关闭议题评论被拒绝（HTTP ${closedComment.status}）`);

  // ── 用例 15: 删除评论 ────────────────────────────────
  console.log('\n🔹 用例 15: 删除评论（评论者本人）');
  await request('PUT', `/api/topics/${topicId}/status`, { status: 'pending' }, adminToken);
  const newC = await request('POST', `/api/topics/${topicId}/comments`, {
    content: '这条评论待删除',
    author_id: userId,
    author_name: '张三',
  }, token);
  const cid = newC.data?._id;
  assert(cid, '新评论创建成功');
  const delRes = await request('DELETE', `/api/topics/${topicId}/comments/${cid}`, null, token);
  assert(delRes.status === 200, `删除评论 HTTP ${delRes.status}`);

  // ── 用例 16: 状态筛选 ────────────────────────────────
  console.log('\n🔹 用例 16: 按状态筛选');
  const filterRes = await request('GET', '/api/topics?status=pending&sort=hot');
  assert(filterRes.status === 200, `状态筛选 HTTP ${filterRes.status}`);
  const allPending = filterRes.data?.list?.every(t => t.status === 'pending');
  assert(allPending, '只返回 pending 状态议题');

  // ── 用例 17: 按时间排序 ────────────────────────────────
  console.log('\n🔹 用例 17: 按时间排序');
  const timeRes = await request('GET', '/api/topics?sort=time');
  assert(timeRes.status === 200, `时间排序 HTTP ${timeRes.status}`);
  assert(Array.isArray(timeRes.data?.list), '时间排序列表有效');

  console.log('\n' + '='.repeat(50));
  if (process.exitCode === 1) {
    console.log('\n❌ 验证未全部通过，请检查以上 ❌ 项\n');
  } else {
    console.log('\n✅ 所有用例通过！\n');
  }
}

run().catch(err => {
  console.error('验证脚本异常:', err.message);
  process.exitCode = 1;
});