import React, { useState } from 'react';
import { Card, Switch, Select, Button, Tag, message, Tabs, Divider, Popconfirm } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, toggleFeature, setPermissions, ROLE_CONFIG, FEATURE_CONFIG } from '../store';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { theme, features, permissions } = useSelector(state => state.settings);
  const { info } = useSelector(state => state.user);

  const isSuperAdmin = info?.role === 'super_admin' || info?.role === 'admin';

  // 主题配置
  const handleThemeChange = (checked) => {
    dispatch(setTheme(checked ? 'dark' : 'light'));
    message.success(`已切换到${checked ? '深色' : '浅色'}主题`);
  };

  // 功能开关
  const handleFeatureToggle = (key, checked) => {
    dispatch(toggleFeature({ key, value: checked }));
    message.success(`已${checked ? '启用' : '禁用'}${FEATURE_CONFIG[key]?.label}`);
  };

  // 权限配置
  const handlePermissionChange = (type, value) => {
    const newPerms = { ...permissions, [type]: value };
    dispatch(setPermissions(newPerms));
    message.success('权限配置已保存');
  };

  const roleOptions = Object.entries(ROLE_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
  }));

  const tabsItems = [
    {
      key: 'theme',
      label: '🎨 主题配置',
      children: (
        <Card title="主题设置" className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-title">深色模式</div>
              <div className="setting-desc">开启后切换为深色主题，减少眼睛疲劳</div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onChange={handleThemeChange}
              checkedChildren="深"
              unCheckedChildren="浅"
            />
          </div>
          <Divider />
          <div className="theme-preview">
            <div className={`preview-box ${theme === 'light' ? 'active' : ''}`}>
              <div className="preview-header"></div>
              <div className="preview-content">
                <div className="preview-sidebar"></div>
                <div className="preview-main"></div>
              </div>
            </div>
            <div className={`preview-box dark ${theme === 'dark' ? 'active' : ''}`}>
              <div className="preview-header"></div>
              <div className="preview-content">
                <div className="preview-sidebar"></div>
                <div className="preview-main"></div>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'features',
      label: '🔧 功能配置',
      children: (
        <Card title="功能模块" className="settings-card">
          <p className="setting-tip">关闭功能后，对应菜单将不再显示</p>
          {Object.entries(FEATURE_CONFIG).map(([key, config]) => (
            <div key={key} className="setting-row">
              <div className="setting-info">
                <div className="setting-title">
                  {config.label}
                  <Tag color={features[key] ? 'green' : 'red'} className="feature-tag">
                    {features[key] ? '已启用' : '已禁用'}
                  </Tag>
                </div>
                <div className="setting-desc">{config.desc}</div>
              </div>
              <Switch
                checked={features[key]}
                onChange={(checked) => handleFeatureToggle(key, checked)}
                disabled={!isSuperAdmin}
              />
            </div>
          ))}
          {!isSuperAdmin && (
            <div className="permission-tip">
              ⚠️ 只有超级管理员才能修改功能配置
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'permissions',
      label: '👥 权限配置',
      children: (
        <Card title="角色权限" className="settings-card">
          <p className="setting-tip">配置不同角色可以访问的功能范围</p>
          
          <div className="permission-section">
            <div className="permission-title">
              <span className="role-badge" style={{ background: ROLE_CONFIG.super_admin.color }}>
                {ROLE_CONFIG.super_admin.label}
              </span>
              管理员角色
            </div>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={permissions.adminRoles}
              onChange={(value) => handlePermissionChange('adminRoles', value)}
              options={roleOptions}
              placeholder="选择管理员角色"
              disabled={!isSuperAdmin}
            />
            <div className="permission-desc">
              管理员可访问图书管理、用户管理、借阅管理、积分商城等核心功能
            </div>
          </div>

          <Divider />

          <div className="permission-section">
            <div className="permission-title">
              <span className="role-badge" style={{ background: ROLE_CONFIG.owner.color }}>
                {ROLE_CONFIG.owner.label}
              </span>
              经理角色
            </div>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={permissions.managerRoles}
              onChange={(value) => handlePermissionChange('managerRoles', value)}
              options={roleOptions}
              placeholder="选择经理角色"
              disabled={!isSuperAdmin}
            />
            <div className="permission-desc">
              经理可访问部分管理功能，如查看统计、审核借阅等
            </div>
          </div>

          <Divider />

          <div className="permission-section">
            <div className="permission-title">
              <span className="role-badge" style={{ background: ROLE_CONFIG.user.color }}>
                {ROLE_CONFIG.user.label}
              </span>
              普通用户角色
            </div>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={permissions.userRoles}
              onChange={(value) => handlePermissionChange('userRoles', value)}
              options={roleOptions}
              placeholder="选择普通用户角色"
              disabled={!isSuperAdmin}
            />
            <div className="permission-desc">
              普通用户可借阅图书、查看通知、参与积分活动
            </div>
          </div>

          {!isSuperAdmin && (
            <div className="permission-tip">
              ⚠️ 只有超级管理员才能修改权限配置
            </div>
          )}

          <Divider />

          <div className="role-list">
            <div className="role-list-title">角色说明</div>
            {Object.entries(ROLE_CONFIG).map(([key, config]) => (
              <div key={key} className="role-item">
                <Tag color={config.color}>{config.label}</Tag>
                <span className="role-desc">{config.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    {
      key: 'about',
      label: 'ℹ️ 关于',
      children: (
        <Card title="系统信息" className="settings-card">
          <div className="about-info">
            <div className="about-row">
              <span className="about-label">系统名称</span>
              <span className="about-value">小区图书管理系统</span>
            </div>
            <div className="about-row">
              <span className="about-label">版本</span>
              <span className="about-value">v1.0.0</span>
            </div>
            <div className="about-row">
              <span className="about-label">当前用户</span>
              <span className="about-value">{info?.name || '未知'}</span>
            </div>
            <div className="about-row">
              <span className="about-label">用户角色</span>
              <span className="about-value">
                <Tag color={ROLE_CONFIG[info?.role]?.color || '#8c8c8c'}>
                  {ROLE_CONFIG[info?.role]?.label || info?.role || '未知'}
                </Tag>
              </span>
            </div>
          </div>
          <Divider />
          <div className="about-tip">
            配置信息存储在浏览器本地，清除浏览器缓存将重置所有设置
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <Card title="⚙️ 系统配置" className="settings-container">
        <Tabs items={tabsItems} tabPosition="left" className="settings-tabs" />
      </Card>
    </div>
  );
};

export default Settings;