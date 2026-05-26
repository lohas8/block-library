/**
 * Mobile Scan Borrow Page - 手机端扫码借书
 */
import React, { useState, useCallback } from 'react';
import { Button, Card, Result, Dialog } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

const MobileScanBorrow = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);

  const handleScan = useCallback(() => {
    // 模拟扫码结果
    // 实际应该调用微信JSSDK扫码或camera扫描
    const mockBook = {
      _id: 'book_' + Date.now(),
      title: '示例图书',
      author: '示例作者',
      location: 'A-3-15',
      status: 'available'
    };
    setBookInfo(mockBook);
    setScanned(true);
  }, []);

  const handleConfirmBorrow = async () => {
    // 调用借阅API
    Dialog.alert({
      content: '借阅成功！',
      onConfirm: () => navigate('/mobile/my-borrows'),
    });
  };

  return (
    <div className="mobile-scan-borrow">
      {!scanned ? (
        <div className="scan-area">
          <Card className="scan-card">
            <Card.Body>
              <div className="scan-placeholder">
                <div className="scan-icon">📷</div>
                <p>点击下方按钮扫描图书二维码</p>
              </div>
            </Card.Body>
          </Card>
          <Button color="primary" block onClick={handleScan}>
            扫码借书
          </Button>
        </div>
      ) : (
        <div className="borrow-confirm">
          <Card className="book-info-card">
            <Card.Header
              title={bookInfo.title}
              thumb="📚"
            />
            <Card.Body>
              <p>作者：{bookInfo.author}</p>
              <p>位置：{bookInfo.location}</p>
              <p>状态：<span className="status-available">可借</span></p>
            </Card.Body>
          </Card>
          <div className="confirm-actions">
            <Button color="primary" block onClick={handleConfirmBorrow}>
              确认借阅
            </Button>
            <Button block onClick={() => setScanned(false)}>
              继续扫码
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileScanBorrow;