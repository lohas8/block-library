/**
 * MobileRateRating - 物业评价详情页
 * 四大类评分，每类5个小项，1-5星评分
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { ratingApi } from '../../api';
import './MobileRateRating.css';

const STORAGE_KEY_SUBMITTED = 'rating_submitted_2026';

const MobileRateRating = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [scores, setScores] = useState({}); // { item_key: score }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const year = new Date().getFullYear();

  useEffect(() => {
    ratingApi.categories({ year }).then(json => {
      const data = json.data || json || [];
      setCategories(data);
      // 默认全部展开
      const init = {};
      data.forEach(cat => { init[cat._id] = true; });
      setExpandedCats(init);
      setLoading(false);
    }).catch(() => {
      Toast.show('加载失败');
      setLoading(false);
    });
  }, [year]);

  const handleStar = (itemKey, star) => {
    setScores(prev => ({ ...prev, [itemKey]: star }));
  };

  const getScore = (itemKey) => scores[itemKey] || 0;

  const isAllRated = () => {
    return categories.every(cat =>
      cat.items.every(item => getScore(item.item_key) > 0)
    );
  };

  const getRatedCount = () => {
    let count = 0;
    categories.forEach(cat => cat.items.forEach(item => {
      if (getScore(item.item_key) > 0) count++;
    }));
    return count;
  };

  const handleSubmit = async () => {
    if (!isAllRated()) {
      Toast.show('请完成所有评分项');
      return;
    }
    setSubmitting(true);
    try {
      const ratings = [];
      categories.forEach(cat => {
        cat.items.forEach(item => {
          ratings.push({
            category_name: cat.name,
            item_key: item.item_key,
            item_name: item.item_name,
            score: getScore(item.item_key),
          });
        });
      });
      await ratingApi.submit({ year, ratings });
      localStorage.setItem(STORAGE_KEY_SUBMITTED, '1');
      Toast.show('评价提交成功');
      navigate('/mobile');
    } catch (e) {
      Toast.show(e.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCat = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (loading) {
    return <div className="rate-page"><div className="loading-hint">加载中...</div></div>;
  }

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="rate-page">
      {/* Header */}
      <div className="rate-header">
        <div className="rate-title">物业评价</div>
        <div className="rate-year">{year}年度</div>
      </div>

      {/* Progress */}
      <div className="rate-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(getRatedCount() / totalItems) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          已评 {getRatedCount()}/{totalItems} 项
        </div>
      </div>

      {/* Categories */}
      <div className="rate-categories">
        {categories.map(cat => (
          <div key={cat._id} className="cat-card">
            <div
              className="cat-header"
              style={{ borderLeftColor: cat.color }}
              onClick={() => toggleCat(cat._id)}
            >
              <div className="cat-left">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </div>
              <div className="cat-right">
                <span className="cat-rated">
                  {cat.items.filter(i => getScore(i.item_key) > 0).length}/{cat.items.length}
                </span>
                <span className={`cat-arrow ${expandedCats[cat._id] ? 'up' : ''}`}>›</span>
              </div>
            </div>

            {expandedCats[cat._id] && (
              <div className="cat-items">
                {cat.items.map(item => (
                  <div key={item.item_key} className="rate-item-row">
                    <span className="item-name">{item.item_name}</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`star ${star <= getScore(item.item_key) ? 'on' : ''}`}
                          style={{ color: star <= getScore(item.item_key) ? cat.color : '#ccc' }}
                          onClick={() => handleStar(item.item_key, star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="rate-submit-bar">
        <button
          className={`rate-submit-btn ${isAllRated() ? 'ready' : ''}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : isAllRated() ? '提交评价' : `还需评${totalItems - getRatedCount()}项`}
        </button>
      </div>
    </div>
  );
};

export default MobileRateRating;
