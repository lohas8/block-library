/**
 * VoteService - 投票业务逻辑层
 */
const Service = require('egg').Service;

class VoteService extends Service {
  /**
   * 投票列表
   */
  async getList({ status, page = 1, pageSize = 20 } = {}) {
    const query = {};
    if (status) query.status = status;
    const total = await this.ctx.model.Vote.countDocuments(query);
    const list = await this.ctx.model.Vote.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    // 填充选项和投票百分比
    const listWithItems = await Promise.all(list.map(async (vote) => {
      const items = await this.ctx.model.VoteItem.find({ vote_id: vote._id }).sort({ order: 1 });
      const voteObj = vote.toObject();
      voteObj.items = items.map(item => item.toObject());
      return voteObj;
    }));

    return { list: listWithItems, total, page: parseInt(page), pageSize: parseInt(pageSize) };
  }

  /**
   * 投票详情（含选项和用户是否已投）
   */
  async getDetail(id, userId) {
    const vote = await this.ctx.model.Vote.findById(id);
    if (!vote) throw new Error('投票不存在');

    const items = await this.ctx.model.VoteItem.find({ vote_id: id }).sort({ order: 1 });
    const voteObj = vote.toObject();

    // 计算各选项百分比
    const total = vote.total_votes || 1;
    voteObj.items = items.map(item => {
      const itemObj = item.toObject();
      itemObj.percent = Math.round((itemObj.vote_count / total) * 100);
      return itemObj;
    });

    // 判断当前用户是否已投票
    if (userId) {
      const record = await this.ctx.model.VoteRecord.findOne({ vote_id: id, user_id: userId });
      voteObj.has_voted = !!record;
      if (record) voteObj.selected_item_ids = record.selected_item_ids.split(',');
    }

    return voteObj;
  }

  /**
   * 创建投票（含选项）
   */
  async create(data, operatorId, operatorName) {
    const { title, content, community_id, vote_type, deadline, items, topic_id } = data;

    const vote = await this.ctx.model.Vote.create({
      title,
      content,
      community_id,
      vote_type: vote_type || 'binary',
      deadline,
      created_by: operatorId,
      created_by_name: operatorName,
      topic_id,
    });

    // 批量创建选项
    const savedItems = await Promise.all(
      (items || []).map((item, i) =>
        this.ctx.model.VoteItem.create({
          vote_id: vote._id,
          label: item.label,
          color: item.color || '#4caf50',
          order: i,
        })
      )
    );

    return { ...vote.toObject(), items: savedItems };
  }

  /**
   * 投票（用户投票）
   */
  async castVote(voteId, userId, selectedItemIds) {
    const vote = await this.ctx.model.Vote.findById(voteId);
    if (!vote) throw new Error('投票不存在');
    if (vote.status === 'closed') throw new Error('投票已结束');
    if (vote.deadline && new Date() > vote.deadline) throw new Error('投票已截止');

    // 检查是否已投
    const existing = await this.ctx.model.VoteRecord.findOne({ vote_id: voteId, user_id: userId });
    if (existing) throw new Error('您已投过票');

    // 保存投票记录
    await this.ctx.model.VoteRecord.create({
      vote_id: voteId,
      user_id: userId,
      selected_item_ids: selectedItemIds.join(','),
    });

    // 更新各选项得票数
    await Promise.all(
      selectedItemIds.map(itemId =>
        this.ctx.model.VoteItem.findByIdAndUpdate(itemId, { $inc: { vote_count: 1 } })
      )
    );

    // 更新总票数
    await this.ctx.model.Vote.findByIdAndUpdate(voteId, { $inc: { total_votes: 1 } });

    return { success: true };
  }
}

module.exports = VoteService;