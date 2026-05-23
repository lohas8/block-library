import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, message, Modal, Input, Upload, Divider, Empty } from 'antd';
import { PlusOutlined, CameraOutlined } from '@ant-design/icons';
import { ruleApi, userApi } from '../api';
import { useSelector } from 'react-redux';
import './ApplyRule.css';

const ApplyRule = () => {
  const { info } = useSelector(state => state.user);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [selfIntro, setSelfIntro] = useState('');
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await ruleApi.list({ communityId: info?.communityId || 'c1' });
      setRules(res.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSelfEval = (rule) => {
    setSelectedRule(rule);
    setSelfIntro('');
    setFileList([]);
    setModalVisible(true);
  };

  const submitSelfEval = async () => {
    if (!selfIntro.trim()) {
      message.warning('请填写自评简介');
      return;
    }
    setSubmitting(true);
    try {
      // 模拟上传凭证图片
      const imageUrls = fileList.map(f => f.url || f.response?.url || 'mock-image-url');
      await ruleApi.apply(selectedRule._id, {
        userId: info._id,
        userName: info.name,
        reason: selfIntro,
        images: imageUrls,
      });
      message.success('自评已提交，请等待管理员审核');
      setModalVisible(false);
      loadRules();
    } catch (err) {
      message.error('提交失败');
    }
    setSubmitting(false);
  };

  const rewardRules = rules.filter(r => r.type === 'reward');
  const penaltyRules = rules.filter(r => r.type === 'penalty');

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div className="apply-rule-page">
      <h1>📝 自评加分</h1>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
          提示：选择下方规则，填写自评简介并上传凭证，提交后由管理员审核。
        </div>
      </Card>

      <Card title="🏆 奖励规则" style={{ marginBottom: 16 }}>
        {rewardRules.length > 0 ? (
          <List
            dataSource={rewardRules}
            renderItem={rule => (
              <List.Item
                actions={[
                  <Button key="self" type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleSelfEval(rule)}>
                    自评
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<span>{rule.name} <Tag color="green">+{rule.points}分</Tag></span>}
                  description={<span style={{ color: '#666' }}>{rule.content}</span>}
                />
              </List.Item>
            )}
          />
        ) : <Empty description="暂无奖励规则" />}
      </Card>

      <Card title="⚠️ 惩罚规则（仅供了解）" style={{ marginBottom: 16 }}>
        {penaltyRules.length > 0 ? (
          <List
            dataSource={penaltyRules}
            renderItem={rule => (
              <List.Item>
                <List.Item.Meta
                  title={<span>{rule.name} <Tag color="red">{rule.points}分</Tag></span>}
                  description={<span style={{ color: '#666' }}>{rule.content}</span>}
                />
              </List.Item>
            )}
          />
        ) : <Empty description="暂无惩罚规则" />}
      </Card>

      <Modal
        title={`自评：${selectedRule?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={560}
      >
        <div style={{ marginBottom: 16 }}>
          <Tag color="green" style={{ marginBottom: 12 }}>+{selectedRule?.points} 积分</Tag>
          <div style={{ color: '#333', marginBottom: 4 }}>规则：{selectedRule?.content}</div>
        </div>

        <Divider />

        <div style={{ marginBottom: 12, fontWeight: 500 }}>自评简介</div>
        <Input.TextArea
          rows={4}
          maxLength={500}
          showCount
          placeholder="请描述你符合该规则的具体情况...（如：今天在楼道发现垃圾主动清理，具体位置在3单元2楼）"
          value={selfIntro}
          onChange={e => setSelfIntro(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 8, fontWeight: 500 }}>上传凭证（照片）</div>
        <Upload
          action="https://httpbin.org/post"
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: newList }) => setFileList(newList)}
          beforeUpload={() => false}
          normFile={normFile}
          maxCount={3}
        >
          {fileList.length < 3 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 4, fontSize: 12 }}>上传凭证</div>
            </div>
          )}
        </Upload>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={() => setModalVisible(false)}>取消</Button>
          <Button type="primary" loading={submitting} onClick={submitSelfEval}>提交自评</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ApplyRule;