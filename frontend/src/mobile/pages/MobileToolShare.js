/**
 * Mobile Tool Share Page - 手机端工具共享
 */
import React, { useEffect, useState } from 'react';
import { Card, SearchBar, Button, Badge } from 'antd-mobile';
import { toolApi } from '../../common/api';

const MobileToolShare = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    try {
      const res = await toolApi.list();
      setTools(res.list || []);
    } catch (err) {
      console.error('加载工具失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async (toolId) => {
    try {
      await toolApi.rent({ toolId });
      alert('租借成功');
      loadTools();
    } catch (err) {
      alert('租借失败');
    }
  };

  return (
    <div className="mobile-tool-share">
      <SearchBar
        placeholder="搜索工具"
        value={searchValue}
        onChange={setSearchValue}
      />

      <div className="tool-list">
        {tools.map(tool => (
          <Card key={tool._id} className="tool-item">
            <Card.Header
              title={tool.name}
              thumb={tool.image || '🛠️'}
              extra={<Badge text={tool.status === 'available' ? '可租' : '已借出'} />}
            />
            <Card.Body>
              <p>分类：{tool.category || '其他'}</p>
              <p>位置：{tool.location || '待定'}</p>
              <p>押金：{tool.deposit || 0} 积分</p>
            </Card.Body>
            <Card.Footer>
              <Button
                size="small"
                inline
                disabled={tool.status !== 'available'}
                onClick={() => handleRent(tool._id)}
              >
                {tool.status === 'available' ? '立即租借' : '已借出'}
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {tools.length === 0 && !loading && (
        <div className="empty">暂无工具</div>
      )}
    </div>
  );
};

export default MobileToolShare;