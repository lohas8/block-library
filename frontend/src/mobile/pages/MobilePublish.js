/**
 * MobilePublish - 内容发布页面（文章 / 商品）
 */
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Segmented,
  Input,
  TextArea,
  Button,
  Toast,
  ImageUploader,
  Picker,
  Radio,
  CheckList,
  Space,
} from 'antd-mobile';
import './MobilePublish.css';

// 分类选项
const CATEGORY_OPTIONS = [
  { label: '读书', value: 'book' },
  { label: '生活', value: 'life' },
  { label: '科技', value: 'tech' },
  { label: '旅行', value: 'travel' },
  { label: '其他', value: 'other' },
];

// 新旧程度选项
const CONDITION_OPTIONS = [
  { label: '全新', value: 'new' },
  { label: '几乎全新', value: 'like_new' },
  { label: '有使用痕迹', value: 'used' },
  { label: '老旧', value: 'old' },
];

// 交易方式选项
const TRADE_MODE_OPTIONS = [
  { label: '同城面交', value: 'meetup' },
  { label: '快递邮寄', value: 'delivery' },
  { label: '自提', value: 'pickup' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ==================== 图片上传组件 ====================
const ImageUploadList = ({ value = [], onChange, maxCount = 9, aspectRatio }) => {
  const fileInputRef = useRef(null);
  const dragIndexRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      Toast.show({ content: '仅支持 jpg/png/webp 格式', icon: 'fail' });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      Toast.show({ content: '单张图片不能超过10MB', icon: 'fail' });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  };

  const addFiles = (files) => {
    const validFiles = files.filter(validateFile);
    const remaining = maxCount - value.length;
    const toAdd = validFiles.slice(0, remaining);
    if (validFiles.length > remaining) {
      Toast.show({ content: `最多上传${maxCount}张图片`, icon: 'fail' });
    }
    const newItems = toAdd.map(file => ({
      file,
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    const updated = [...value, ...newItems];
    onChange(updated);
    // 模拟上传完成
    newItems.forEach(item => {
      setTimeout(() => {
        onChange(prev => prev.map(p => p.url === item.url ? { ...p, uploading: false } : p));
      }, 800);
    });
  };

  const handleDelete = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDragStart = (index) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;
    const updated = [...value];
    const [removed] = updated.splice(dragIndexRef.current, 1);
    updated.splice(index, 0, removed);
    onChange(updated);
    dragIndexRef.current = index;
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-list">
      <div className="image-grid">
        {value.map((item, index) => (
          <div
            key={item.url}
            className={`image-thumb ${item.uploading ? 'uploading' : ''}`}
            draggable={!item.uploading}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <img src={item.url} alt="" />
            {item.uploading && (
              <div className="upload-loading">
                <div className="loading-spinner" />
              </div>
            )}
            <span className="delete-btn" onClick={() => handleDelete(index)}>×</span>
            {aspectRatio === '1:1' && <div className="aspect-1-label">1:1</div>}
          </div>
        ))}
        {value.length < maxCount && (
          <div className="add-image-btn" onClick={triggerInput}>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <span className="add-icon">+</span>
            <span className="add-label">{value.length}/{maxCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 文章表单 ====================
const ArticleForm = ({ data, onChange }) => {
  const [categoryValue, setCategoryValue] = useState(data.category || []);

  const update = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div className="publish-form">
      {/* 标题 */}
      <div className="form-item">
        <div className="form-label">标题 <span className="required">*</span></div>
        <Input
          className="form-input"
          placeholder="请输入文章标题（2-40字）"
          value={data.title || ''}
          onChange={val => update('title', val.slice(0, 40))}
          maxLength={40}
        />
        <div className="form-count">{ (data.title || '').length }/40</div>
      </div>

      {/* 正文 */}
      <div className="form-item">
        <div className="form-label">正文 <span className="required">*</span></div>
        <TextArea
          className="form-textarea"
          placeholder="请输入文章正文（最多10000字）"
          value={data.content || ''}
          onChange={val => update('content', val.slice(0, 10000))}
          maxLength={10000}
          rows={8}
          showCount
        />
      </div>

      {/* 分类 */}
      <div className="form-item">
        <div className="form-label">分类</div>
        <Picker
          columns={[CATEGORY_OPTIONS]}
          value={categoryValue}
          onChange={val => { setCategoryValue(val); update('category', val[0]); }}
          renderButton={(_, {text}) => (
            <Button className="picker-btn">
              {text || CATEGORY_OPTIONS.find(c => c.value === data.category)?.label || '请选择分类'}
            </Button>
          )}
        />
      </div>

      {/* 位置 */}
      <div className="form-item">
        <div className="form-label">位置</div>
        <Input
          className="form-input"
          placeholder="请输入位置（可选）"
          value={data.location || ''}
          onChange={val => update('location', val)}
        />
      </div>

      {/* 封面图 */}
      <div className="form-item">
        <div className="form-label">封面图 <span className="optional">(可选)</span></div>
        <ImageUploadList
          value={data.coverImages || []}
          onChange={val => update('coverImages', val)}
          maxCount={1}
        />
      </div>

      {/* 配图 */}
      <div className="form-item">
        <div className="form-label">配图 <span className="optional">(可选，最多9张)</span></div>
        <ImageUploadList
          value={data.images || []}
          onChange={val => update('images', val)}
          maxCount={9}
        />
      </div>
    </div>
  );
};

// ==================== 商品表单 ====================
const GoodsForm = ({ data, onChange }) => {
  const [conditionValue, setConditionValue] = useState(data.condition ? [data.condition] : []);
  const [tradeModeValue, setTradeModeValue] = useState(data.tradeModes || []);

  const update = (field, val) => onChange({ ...data, [field]: val });

  const handleConditionChange = (val) => {
    setConditionValue(val);
    update('condition', val[0] || '');
  };

  const handleTradeModeChange = (val) => {
    setTradeModeValue(val);
    update('tradeModes', val);
  };

  return (
    <div className="publish-form">
      {/* 商品标题 */}
      <div className="form-item">
        <div className="form-label">商品标题 <span className="required">*</span></div>
        <Input
          className="form-input"
          placeholder="请输入商品标题（5-60字）"
          value={data.title || ''}
          onChange={val => update('title', val.slice(0, 60))}
          maxLength={60}
        />
        <div className="form-count">{ (data.title || '').length }/60</div>
      </div>

      {/* 商品描述 */}
      <div className="form-item">
        <div className="form-label">商品描述 <span className="optional">(可选)</span></div>
        <TextArea
          className="form-textarea"
          placeholder="描述一下商品的具体情况..."
          value={data.description || ''}
          onChange={val => update('description', val.slice(0, 500))}
          maxLength={500}
          rows={4}
          showCount
        />
      </div>

      {/* 多图上传 */}
      <div className="form-item">
        <div className="form-label">商品图片 <span className="required">*</span> <span className="optional">(1-9张，建议1:1比例)</span></div>
        <ImageUploadList
          value={data.goodsImages || []}
          onChange={val => update('goodsImages', val)}
          maxCount={9}
          aspectRatio="1:1"
        />
      </div>

      {/* 价格 */}
      <div className="form-item">
        <div className="form-label">价格 <span className="required">*</span></div>
        <div className="price-row">
          <span className="price-unit">¥</span>
          <Input
            className="form-input price-input"
            type="number"
            placeholder="0.00"
            value={data.price || ''}
            onChange={val => update('price', val)}
            min={0}
          />
        </div>
      </div>

      {/* 原价 */}
      <div className="form-item">
        <div className="form-label">原价 <span className="optional">(可选)</span></div>
        <div className="price-row">
          <span className="price-unit">¥</span>
          <Input
            className="form-input price-input"
            type="number"
            placeholder="原价（可选）"
            value={data.originalPrice || ''}
            onChange={val => update('originalPrice', val)}
            min={0}
          />
        </div>
      </div>

      {/* 新旧程度 */}
      <div className="form-item">
        <div className="form-label">新旧程度 <span className="required">*</span></div>
        <Radio.Group
          value={conditionValue[0] || ''}
          onChange={handleConditionChange}
          className="condition-group"
        >
          <Space direction="horizontal" wrap>
            {CONDITION_OPTIONS.map(opt => (
              <Radio key={opt.value} value={opt.value} className="condition-radio">
                {opt.label}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>

      {/* 交易方式 */}
      <div className="form-item">
        <div className="form-label">交易方式 <span className="required">*</span></div>
        <CheckList
          value={tradeModeValue}
          onChange={handleTradeModeChange}
          className="trade-mode-list"
        >
          {TRADE_MODE_OPTIONS.map(opt => (
            <CheckList.Item key={opt.value} value={opt.value}>
              {opt.label}
            </CheckList.Item>
          ))}
        </CheckList>
      </div>

      {/* 联系电话 */}
      <div className="form-item">
        <div className="form-label">联系电话 <span className="optional">(可选)</span></div>
        <Input
          className="form-input"
          type="number"
          placeholder="请输入联系电话（可选）"
          value={data.phone || ''}
          onChange={val => update('phone', val)}
        />
      </div>
    </div>
  );
};

// ==================== 主页面 ====================
const MobilePublish = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('article');
  const [articleData, setArticleData] = useState({});
  const [goodsData, setGoodsData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateArticle = () => {
    const { title, content } = articleData;
    if (!title || title.length < 2) return '标题不能少于2个字';
    if (!content) return '请输入文章正文';
    return null;
  };

  const validateGoods = () => {
    const { title, goodsImages, price, condition, tradeModes } = goodsData;
    if (!title || title.length < 5) return '商品标题不能少于5个字';
    if (!goodsImages || goodsImages.length < 1) return '请上传至少1张商品图片';
    if (!price || parseFloat(price) <= 0) return '请输入有效的商品价格';
    if (!condition) return '请选择新旧程度';
    if (!tradeModes || tradeModes.length < 1) return '请选择至少一种交易方式';
    return null;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const err = activeTab === 'article' ? validateArticle() : validateGoods();
    if (err) {
      Toast.show({ content: err, icon: 'fail' });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = activeTab === 'article'
        ? {
            title: articleData.title,
            content: articleData.content,
            category: articleData.category,
            location: articleData.location,
            coverImages: articleData.coverImages?.map(i => i.url) || [],
            images: articleData.images?.map(i => i.url) || [],
          }
        : {
            title: goodsData.title,
            description: goodsData.description,
            images: goodsData.goodsImages?.map(i => i.url) || [],
            price: parseFloat(goodsData.price),
            originalPrice: goodsData.originalPrice ? parseFloat(goodsData.originalPrice) : undefined,
            condition: goodsData.condition,
            tradeModes: goodsData.tradeModes,
            phone: goodsData.phone,
          };

      const endpoint = activeTab === 'article' ? '/api/articles' : '/api/goods';
      const res = await fetch(`http://localhost:7002${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.code === 0 || json.code === '0' || res.ok) {
        Toast.show({ content: '发布成功！', icon: 'success' });
        navigate('/mobile/square');
      } else {
        Toast.show({ content: json.message || '发布失败', icon: 'fail' });
      }
    } catch (err) {
      Toast.show({ content: '网络错误，请稍后重试', icon: 'fail' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-publish">
      {/* Header */}
      <div className="publish-header">
        <span className="back-btn" onClick={() => navigate(-1)}>‹</span>
        <span className="header-title">发布内容</span>
      </div>

      {/* Segmented */}
      <div className="publish-segmented">
        <Segmented
          value={activeTab}
          onChange={val => setActiveTab(val)}
          options={[
            { label: '发布文章', value: 'article' },
            { label: '发布商品', value: 'goods' },
          ]}
        />
      </div>

      {/* Form */}
      <div className="publish-content">
        {activeTab === 'article'
          ? <ArticleForm data={articleData} onChange={setArticleData} />
          : <GoodsForm data={goodsData} onChange={setGoodsData} />
        }
      </div>

      {/* Footer */}
      <div className="publish-footer">
        <Button
          block
          color="primary"
          size="large"
          loading={submitting}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {activeTab === 'article' ? '发布文章' : '立即发布'}
        </Button>
      </div>
    </div>
  );
};

export default MobilePublish;