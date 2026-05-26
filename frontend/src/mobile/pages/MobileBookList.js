/**
 * Mobile Book List Page - 手机端图书列表
 */
import React, { useEffect, useState } from 'react';
import { SearchBar, Card, Badge, Button } from 'antd-mobile';
import { bookApi } from '../../common/api';
import { setBooks } from '../../common/store';
import { useDispatch } from 'react-redux';

const MobileBookList = () => {
  const dispatch = useDispatch();
  const [books, setBooksLocal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await bookApi.list();
      setBooksLocal(res.list || []);
      dispatch(setBooks({ list: res.list || [], total: res.total || 0 }));
    } catch (err) {
      console.error('加载图书失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    // 简单过滤，实际应该调用 API
    if (!value) {
      loadBooks();
    }
  };

  return (
    <div className="mobile-book-list">
      <SearchBar
        placeholder="搜索图书"
        value={searchValue}
        onChange={handleSearch}
      />

      <div className="book-list">
        {books.map(book => (
          <Card key={book._id} className="book-item">
            <Card.Header
              title={book.title}
              thumb={book.cover || '📚'}
              extra={<Badge text={book.status === 'available' ? '可借' : '已借出'} />}
            />
            <Card.Body>
              <p className="book-author">作者：{book.author || '未知'}</p>
              <p className="book-location">📍 {book.location || '待定'}</p>
            </Card.Body>
            <Card.Footer>
              <Button size="small" inline
                disabled={book.status !== 'available'}
                onClick={() => alert('借书功能开发中')}
              >
                {book.status === 'available' ? '立即借阅' : '已借出'}
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileBookList;