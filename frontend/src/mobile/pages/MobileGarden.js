import React, { useState, useEffect, useRef } from 'react';
import './MobileGarden.css';

const LEVEL_CONFIG = {
  gold:   { label: '金牌', stars: '★★★', color: '#FFD700' },
  silver: { label: '银牌', stars: '★★',  color: '#C0C0C0' },
  bronze: { label: '铜牌', stars: '★',    color: '#CD7F32' },
};

const MOCK_BUILDINGS = [
  {
    building_id: 'B1', building_name: 'A栋', total_score: 1250,
    residents: [
      { rank: 1, name: '张三', avatar: '🧑', score: 320, level: 'gold' },
      { rank: 2, name: '李四', avatar: '👩', score: 210, level: 'gold' },
      { rank: 3, name: '王五', avatar: '🧑', score: 180, level: 'silver' },
      { rank: 4, name: '赵六', avatar: '👨', score: 90,  level: 'silver' },
      { rank: 5, name: '钱七', avatar: '🧑', score: 60,  level: 'bronze' },
      { rank: 6, name: '孙八', avatar: '🧑', score: 40,  level: 'bronze' },
    ],
  },
  {
    building_id: 'B2', building_name: 'B栋', total_score: 980,
    residents: [
      { rank: 1, name: '周九', avatar: '👨', score: 250, level: 'gold' },
      { rank: 2, name: '吴十', avatar: '👩', score: 200, level: 'gold' },
      { rank: 3, name: '郑十一', avatar: '🧑', score: 150, level: 'silver' },
      { rank: 4, name: '王十二', avatar: '🧑', score: 80,  level: 'silver' },
      { rank: 5, name: '冯十三', avatar: '👨', score: 70,  level: 'bronze' },
    ],
  },
  {
    building_id: 'B3', building_name: 'C栋', total_score: 760,
    residents: [
      { rank: 1, name: '陈十四', avatar: '👩', score: 300, level: 'gold' },
      { rank: 2, name: '褚十五', avatar: '🧑', score: 190, level: 'silver' },
      { rank: 3, name: '卫十六', avatar: '👨', score: 110, level: 'silver' },
      { rank: 4, name: '蒋十七', avatar: '🧑', score: 50,  level: 'bronze' },
      { rank: 5, name: '沈十八', avatar: '🧑', score: 30,  level: 'bronze' },
    ],
  },
];

const MOCK_COMMUNITY = {
  community_name: '绿城花园', total_score: 2990,
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

const Stars = ({ level }) => {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.bronze;
  return <span className="stars" style={{ color: cfg.color }}>{cfg.stars}</span>;
};

const MobileGarden = () => {
  const [view, setView] = useState('building');
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [community, setCommunity] = useState(null);
  const [mountLog, setMountLog] = useState([]);
  const logRef = useRef(0);

  useEffect(() => {
    const id = ++logRef.current;
    setMountLog(prev => [...prev, `useEffect run #${id}`]);
    console.log(`[MobileGarden] useEffect #${id} - component mounted`);
    setBuildings(MOCK_BUILDINGS);
    setCommunity(MOCK_COMMUNITY);
    console.log('[MobileGarden] data set, buildings:', MOCK_BUILDINGS.length);
    return () => console.log(`[MobileGarden] useEffect #${id} - cleanup`);
  }, []);

  const toggleBuilding = (id) => {
    setExpandedBuilding(prev => (prev === id ? null : id));
  };

  console.log('[MobileGarden] render - view:', view, 'buildings:', buildings.length);

  return (
    <>
      {/* 🔵 DEBUG: 这是 MobileGarden 的入口标记，如果看不到说明组件没渲染 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff', padding: '16px 20px', borderRadius: '12px',
        margin: '16px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}>
        🎉 MobileGarden 正在渲染！buildings 数量: {buildings.length} | view: {view}
      </div>

      <div className="garden-page" data-debug="garden-page-root">
      <div className="garden-title" data-testid="garden-title">🏠 家园</div>
      <div className="garden-slogan">共建美好社区，共享品质生活</div>
      <div className="garden-debug">buildings: {buildings.length} | community: {community ? 'yes' : 'no'}</div>

      <div className="garden-tabs">
        <div className={`tab ${view === 'building' ? 'active' : ''}`} onClick={() => setView('building')}>按楼栋</div>
        <div className={`tab ${view === 'community' ? 'active' : ''}`} onClick={() => setView('community')}>小区总榜</div>
      </div>

      {view === 'building' && buildings.length > 0 && buildings.map(building => (
        <div key={building.building_id} className="building-card" data-building={building.building_id}>
          <div className="building-header" onClick={() => toggleBuilding(building.building_id)}>
            <div className="building-info">
              <span className="building-name">{building.building_name}</span>
              <span className="building-total">🏆 总积分 {building.total_score}</span>
            </div>
            <div className={`expand-icon ${expandedBuilding === building.building_id ? 'open' : ''}`}>›</div>
          </div>
          <div className="top-residents">
            {building.residents.slice(0, 3).map(r => (
              <div key={r.rank} className="resident-row top" data-name={r.name}>
                <span className={`rank-badge rank-${r.rank <= 3 ? r.rank : ''}`}>{r.rank <= 3 ? '' : r.rank}{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : ''}</span>
                <span className="avatar">{r.avatar}</span>
                <span className="name">{r.name}</span>
                <Stars level={r.level} />
                <span className="score">+{r.score}分</span>
              </div>
            ))}
          </div>
          {expandedBuilding === building.building_id && (
            <div className="all-residents">
              {building.residents.slice(3).map(r => (
                <div key={r.rank} className="resident-row" data-name={r.name}>
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

      {view === 'community' && community && (
        <div className="community-view">
          <div className="community-banner">
            <div className="community-name">{community.community_name}</div>
            <div className="community-total">🏆 社区总贡献积分 <span className="total-num">{community.total_score}</span></div>
          </div>
          <div className="rank-list">
            {community.topResidents.map(r => (
              <div key={r.rank} className="resident-row">
                <span className={`rank-badge rank-${r.rank <= 3 ? r.rank : ''}`}>{r.rank <= 3 ? '' : r.rank}{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : ''}</span>
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
