/**
 * Mobile My Borrows Page - 手机端我的借阅
 */
import React, { useEffect, useState } from 'react';
import { Tabs, Card, Button } from 'antd-mobile';
import { borrowApi } from '../../common/api';
import { useSelector } from 'react-redux';

const MobileMyBorrows = () => {
  const { info } = useSelector(state => state.user);
  const [borrowing, setBorrowing] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (info?._id) {
      loadBorrows();
    }
  }, [info]);

  const loadBorrows = async () => {
    setLoading(true);
    try {
      const res = await borrowApi.list({ userId: info._id });
      setBorrowing(res.list?.filter(b => b.status === 'borrowing') || []);
      setHistory(res.list?.filter(b => b.status === 'returned') || []);
    } catch (err) {
      console.error('加载借阅记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      await borrowApi.return(borrowId);
      loadBorrows();
    } catch (err) {
      alert('归还失败');
    }
  };

  return (
    <div className="mobile-my-borrows">
      <Tabs defaultActiveKey="borrowing">
        <Tabs.Tab title={`借阅中 (${borrowing.length})`} key="borrowing">
          <div className="borrow-list">
            {borrowing.length === 0 ? (
              <div className="empty">暂无借阅中的图书</div>
            ) : (
              borrowing.map(item => (
                <Card key={item._id} className="borrow-item">
                  <Card.Header
                    title={item.bookId?.title || '图书'}
                    thumb="📖"
                  />
                  <Card.Body>
                    <p>借阅时间：{new Date(item.borrowDate).toLocaleDateString()}</p>
                    <p>应还时间：{new Date(item.dueDate).toLocaleDateString()}</p>
                  </Card.Body>
                  <Card.Footer>
                    <Button size="small" color="primary" onClick={() => handleReturn(item._id)}>
                      归还
                    </Button>
                  </Card.Footer>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>
        <Tabs.Tab title={`历史 (${history.length})`} key="history">
          <div className="borrow-list">
            {history.length === 0 ? (
              <div className="empty">暂无借阅历史</div>
            ) : (
              history.map(item => (
                <Card key={item._id} className="borrow-item">
                  <Card.Header
                    title={item.bookId?.title || '图书'}
                    thumb="📖"
                    extra={<span className="returned-tag">已归还</span>}
                  />
                  <Card.Body>
                    <p>借阅时间：{new Date(item.borrowDate).toLocaleDateString()}</p>
                    <p>归还时间：{new Date(item.returnDate).toLocaleDateString()}</p>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default MobileMyBorrows;