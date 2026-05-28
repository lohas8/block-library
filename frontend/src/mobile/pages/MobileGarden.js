/**
 * MobileGarden - 家园页（贡献榜）
 * 按小区/楼栋分类展示业主贡献积分排行
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileGarden.css';

// 贡献等级配置
const LEVEL_CONFIG = {
  gold:   { label: '金牌', stars: '★★★', color: '#FFD700' },
  silver: { label: '银牌', stars: '★★',  color: '#C0C0C0' },
  bronze: { label: '铜牌', stars: '★',    color: '#CD7F32' },
};

// Mock 数据（楼栋 + 贡献榜）
const MOCK_BUILDINGS = [
  {
    building_id: 'B1',
    building_name: 'A栋',
    total_score: 1250,
    residents: [
      { rank: 1, name: '张三',  avatar: '🧑', score: 320, level: 'gold' },
      { rank: 2, name: '李四',  avatar: '👩', score: 210, level: 'gold' },
      { rank: 3, name: '王五',  avatar: '🧑', score: 180, level: 'silver' },
      { rank: 4, name: '赵六',  avatar: '👨', score: 90,  level: 'silver' },
      { rank: 5, name: '钱七',  avatar: '🧑', score: 60,  level: 'bronze' },
      { rank: 6, name: '孙八',  avatar: '🧑', score: 40,  level: 'bronze' },
    ],
  },
  {
    building_id: 'B2',
    building_name: 'B栋',
    total_score: 980,
    residents: [
      { rank: 1, name: '周九',  avatar: '👨', score: 250, level: 'gold' },
      { rank: 2, name: '吴十',  avatar: '👩', score: 200, level: 'gold' },
      { rank: 3, name: '郑十一', avatar: '🧑', score: 150, level: 'silver' },
      { rank: 4, name: '王十二', avatar: '🧑', score: 80,  level: 'silver' },
      { rank: 5, name: '冯十三', avatar: '👨', score: 70,  level: 'bronze' },
    ],
  },
  {
    building_id: 'B3',
    building_name: 'C栋',
    total_score: 760,
    residents: [
      { rank: 1, name: '陈十四', avatar: '👩', score: 300, level: 'gold' },
      { rank: 2, name: '褚十五', avatar: '🧑', score: 190, level: 'silver' },
      { rank: 3, name: '卫十六', avatar: '👨', score: 110, level: 'silver' },
      { rank: 4, name: '蒋十七', avatar: '🧑', score: 50,  level: 'bronze' },
      { rank: 5, name: '沈十八', avatar: '🧑', score: 30,  level: 'bronze' },
    ],
  },
];

// Mock 社区总览（按小区维度）
const MOCK_COMMUNITY = {
  community_name: '绿城花园',
  total_score: 2990,
  topResidents: [
    { rank: 1, name: '陈十四', avatar: '👩', building: 'C栋', score: 300, level: 'gold' },
    { rank: 2, name: '张三',   avatar: '🧑', building: 'A栋', score: 320, level: 'gold' },
    { rank: 3, name: '周九',   avatar: '👨', building: 'B栋', score: 250, level: 'gold' },
    { rank: 4, name: '李四',   avatar: '👩', building: 'A栋', score: 210, level: 'gold' },
    { rank: 5, name: '吴十',   avatar: '👩', building: 'B栋', score: 200, level: 'gold' },
    { rank: 6, name: '王五',   avatar: '🧑', building: 'A栋', score: 180, level: 'silver' },
    { rank: 7, name: '褚十五', avatar: '🧑', building: 'C栋', score: 190, level: 'silver' },
    { rank: 8, name: '赵六',   avatar: '👨', building: 'A栋', score: 90,  level: 'silver' },
    { rank: 9, name: '郑十一', avatar: '🧑', building: 'B栋', score: 150, level: 'silver' },
    { rank: 10, name: '卫十六', avatar: '👨', building: 'C栋', score: 110, level: 'silver' },
  ],
};

// 星级渲染
const Stars = ({ level }) => {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.bronze;
  return <span className="stars" style={{ color: cfg.color }}>{cfg.stars}</span>;
};

const MobileGarden = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('building'); // 'building' | 'community'
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    // TODO: 替换为真实 API
    setBuildings(MOCK_BUILDINGS);
    setCommunity(MOCK_COMMUNITY);
  }, []);

  const toggleBuilding = (id) => {
    setExpandedBuilding(prev => (prev === id ? null : id));
  };

  return (
    <div className="garden-page">
      {/* ===== Header ===== */}
      <div className="garden-header">
        <div className="garden-title">🏠 家园</div>
        <div className="garden-slogan">共建美好社区，共享品质生活</div>
      </div>

      {/* ===== Tab 切换 ===== */}
      <div className="garden-tabs">
        <div
          className={`tab ${view === 'building' ? 'active' : ''}`}
          onClick={() => setView('building')}
        >
          按楼栋
        </div>
        <div
          className={`tab ${view === 'community' ? 'active' : ''}`}
          onClick={() => setView('community')}
        >
          小区总榜
        </div>
      </div>

      {/* ===== 楼栋视角 ===== */}
      {view === 'building' && (
        <div className="building-list">
          {buildings.map(building => (
            <div key={building.building_id} className="building-card">
              {/* 楼栋头部 */}
              <div
                className="building-header"
                onClick={() => toggleBuilding(building.building_id)}
              >
                <div className="building-info">
                  <span className="building-name">{building.building_name}</span>
                  <span className="building-total">
                    🏆 总积分 {building.total_score}
                  </span>
                </div>
                <div className={`expand-icon ${expandedBuilding === building.building_id ? 'open' : ''}`}>
                  ›
                </div>
              </div>

              {/* Top 3 贡献者（始终显示） */}
              <div className="top-residents">
                {building.residents.slice(0, 3).map((r, i) => (
                  <div key={r.rank} className="resident-row top">
                    <span className={`rank-badge rank-${i + 1}`}>{i + 1}</span>
                    <span className="avatar">{r.avatar}</span>
                    <span className="name">{r.name}</span>
                    <Stars level={r.level} />
                    <span className="score">+{r.score}分</span>
                  </div>
                ))}
              </div>

              {/* 展开后显示完整榜单 */}
              {expandedBuilding === building.building_id && (
                <div className="all-residents">
                  {building.residents.slice(3).map(r => (
                    <div key={r.rank} className="resident-row">
                      <span className="rank-badge">{r.rank}</span>
                      <span className="avatar">{r.avatar}</span>
                      <span className="name">{r.name}</span>
                      <Stars level={r.level} />
                      <span className="score">+{r.score}分</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== 小区视角 ===== */}
      {view === 'community' && community && (
        <div className="community-view">
          <div className="community-banner">
            <div className="community-name">{community.community_name}</div>
            <div className="community-total">
              🏆 社区总贡献积分 <span className="total-num">{community.total_score}</span>
            </div>
          </div>

          <div className="rank-list">
            {community.topResidents.map(r => (
              <div key={r.rank} className="resident-row">
                <span className={`rank-badge rank-${r.rank <= 3 ? r.rank : ''}`}>
                  {r.rank <= 3 ? '' : r.rank}
                  {r.rank === 1 && '🥇'}
                  {r.rank === 2 && '🥈'}
                  {r.rank === 3 && '🥉'}
                </span>
                <span className="avatar">{r.avatar}</span>
                <div className="resident-info">
                  <span className="name">{r.name}</span>
                  <span className="building-tag">{r.building}</span>
                </div>
                <div className="resident-score">
                  <Stars level={r.level} />
                  <span className="score">+{r.score}分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileGarden;