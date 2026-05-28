/**
 * MobileSquare - 广场瀑布流页面
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PullToRefresh, DotLoading } from 'antd-mobile';
import SquareCard from './SquareCard';
import SkeletonCard from './SkeletonCard';
import './MobileSquare.css';

// Mock 数据
const MOCK_ARTICLES = [
  {
    id: 'article-1',
    type: 'article',
    cover_image: 'https://picsum.photos/400/225?random=1',
    title: '如何培养良好的阅读习惯',
    summary: '阅读是提升自我的最佳方式之一，本文分享几个实用的阅读技巧，帮助你建立终身学习的习惯。',
    author: { nickname: '书虫小王', avatar: 'https://i.pravatar.cc/40?img=1' },
    created_at: '2小时前',
    likes_count: 128,
    comments_count: 24,
    shares_count: 12,
    is_liked: false
  },
  {
    id: 'article-2',
    type: 'article',
    cover_image: 'https://picsum.photos/400/225?random=2',
    title: '2024年度书单推荐',
    summary: '今年读过的30本好书，涵盖文学、历史、科技、商业等多个领域，总有一本适合你。',
    author: { nickname: '读书达人', avatar: 'https://i.pravatar.cc/40?img=2' },
    created_at: '5小时前',
    likes_count: 256,
    comments_count: 48,
    shares_count: 30,
    is_liked: true
  },
  {
    id: 'article-3',
    type: 'article',
    cover_image: 'https://picsum.photos/400/225?random=3',
    title: '写作十年，我的几点感悟',
    summary: '从写日记到出书，这十年的写作经历让我明白：坚持比天赋更重要。',
    author: { nickname: '文字匠人', avatar: 'https://i.pravatar.cc/40?img=3' },
    created_at: '1天前',
    likes_count: 512,
    comments_count: 86,
    shares_count: 45,
    is_liked: false
  },
  {
    id: 'article-4',
    type: 'article',
    cover_image: 'https://picsum.photos/400/225?random=4',
    title: '数字游民的生活方式',
    summary: '边旅行边工作，听起来很美好，但背后的挑战你了解吗？',
    author: { nickname: '漫游世界', avatar: 'https://i.pravatar.cc/40?img=4' },
    created_at: '2天前',
    likes_count: 89,
    comments_count: 15,
    shares_count: 8,
    is_liked: false
  }
];

const MOCK_PRODUCTS = [
  {
    id: 'product-1',
    type: 'product',
    images: ['https://picsum.photos/400/400?random=10'],
    condition: '二手',
    title: '九成新《人类简史》',
    price: 45,
    old_price: 68,
    seller: { nickname: '爱读书的小李', avatar: 'https://i.pravatar.cc/40?img=5' },
    likes_count: 8,
    is_liked: true
  },
  {
    id: 'product-2',
    type: 'product',
    images: ['https://picsum.photos/400/400?random=11'],
    condition: '全新',
    title: '未拆封《百年孤独》典藏版',
    price: 88,
    old_price: 128,
    seller: { nickname: '书城老板', avatar: 'https://i.pravatar.cc/40?img=6' },
    likes_count: 15,
    is_liked: false
  },
  {
    id: 'product-3',
    type: 'product',
    images: ['https://picsum.photos/400/400?random=12'],
    condition: '二手',
    title: '《三体》全套3册，看过一次',
    price: 55,
    old_price: 98,
    seller: { nickname: '科幻迷', avatar: 'https://i.pravatar.cc/40?img=7' },
    likes_count: 22,
    is_liked: false
  },
  {
    id: 'product-4',
    type: 'product',
    images: ['https://picsum.photos/400/400?random=13'],
    condition: '二手',
    title: '《明朝那些事儿》1-9册全套',
    price: 120,
    old_price: 225,
    seller: { nickname: '历史爱好者', avatar: 'https://i.pravatar.cc/40?img=8' },
    likes_count: 35,
    is_liked: true
  },
  {
    id: 'product-5',
    type: 'product',
    images: ['https://picsum.photos/400/400?random=14'],
    condition: '全新',
    title: '《活着》余华签名本',
    price: 168,
    old_price: 168,
    seller: { nickname: '藏书家', avatar: 'https://i.pravatar.cc/40?img=9' },
    likes_count: 50,
    is_liked: false
  }
];

// 模拟加载延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 生成混合数据
const generateItems = (page, pageSize = 10) => {
  const allItems = [...MOCK_ARTICLES, ...MOCK_PRODUCTS];
  const result = [];
  
  for (let i = 0; i < pageSize; i++) {
    const index = (page - 1) * pageSize + i;
    const item = allItems[index % allItems.length];
    result.push({
      ...item,
      id: `${item.type}-${item.id.split('-')[1]}-page${page}-${i}`
    });
  }
  
  return result;
};

const MobileSquare = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  const loadingRef = useRef(false);
  const THROTTLE_MS = 100;

  // 初始加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
      setItems(generateItems(1));
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await delay(1000);
    setItems(generateItems(1));
    setPage(1);
    setHasMore(true);
    setRefreshing(false);
  }, []);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setLoading(true);
    await delay(800);
    
    const newItems = generateItems(page + 1);
    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    }
    
    setLoading(false);
    loadingRef.current = false;
  }, [page, hasMore]);

  // 滚动监听（节流）
  useEffect(() => {
    let lastCall = 0;
    
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastCall < THROTTLE_MS) return;
      lastCall = now;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceToBottom < 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // 点赞/收藏处理（乐观更新）
  const handleLike = useCallback((item) => {
    // 乐观更新
    setItems(prev => prev.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          is_liked: !i.is_liked,
          likes_count: i.is_liked ? i.likes_count - 1 : i.likes_count + 1
        };
      }
      return i;
    }));

    // 模拟后端请求
    setTimeout(() => {
      const shouldFail = Math.random() < 0.1; // 10% 概率失败
      if (shouldFail) {
        // 回滚
        setItems(prev => prev.map(i => {
          if (i.id === item.id) {
            return {
              ...i,
              is_liked: !i.is_liked,
              likes_count: i.is_liked ? i.likes_count - 1 : i.likes_count + 1
            };
          }
          return i;
        }));
        console.log('操作失败，已回滚');
      }
    }, 500);
  }, []);

  // 点击卡片
  const handleCardClick = useCallback((item) => {
    console.log('点击卡片:', item.id, item.title);
    // 后续实现跳转：navigate(`/mobile/square/${item.id}`)
  }, []);

  return (
    <div className="mobile-square">
      <PullToRefresh
        onRefresh={onRefresh}
        pullingText="下拉刷新"
        releasingText="释放刷新"
        refreshingText="刷新中..."
      >
        {showSkeleton ? (
          <div className="square-skeleton">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="square-feed">
            {items.map(item => (
              <SquareCard
                key={item.id}
                item={item}
                onLike={handleLike}
                onClick={handleCardClick}
              />
            ))}
            
            {loading && (
              <div className="loading-indicator">
                <DotLoading />
                <span>加载中...</span>
              </div>
            )}
            
            {!hasMore && items.length > 0 && (
              <div className="no-more">— 没有更多了 —</div>
            )}
          </div>
        )}
      </PullToRefresh>
      
      {/* 底部安全区 */}
      <div className="safe-area-bottom" />
    </div>
  );
};

export default MobileSquare;