import { configureStore, createSlice } from '@reduxjs/toolkit';

// 配置 slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: localStorage.getItem('theme') || 'light', // light | dark
    features: JSON.parse(localStorage.getItem('features') || '{"borrow":true,"bookManage":true,"userManage":true,"pointsMall":true}'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '{"adminRoles":["super_admin","admin"],"managerRoles":["admin","owner","property"],"userRoles":["owner","property","user"]}'),
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleFeature: (state, action) => {
      const { key, value } = action.payload;
      state.features[key] = value;
      localStorage.setItem('features', JSON.stringify(state.features));
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
      localStorage.setItem('permissions', JSON.stringify(state.permissions));
    },
  },
});

export const { setTheme, toggleFeature, setPermissions } = settingsSlice.actions;

// 权限检查
export const checkPermission = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

// 权限角色说明
export const ROLE_CONFIG = {
  super_admin: { label: '超级管理员', color: '#ff4d4f', desc: '系统最高权限，可管理所有功能和用户' },
  admin: { label: '管理员', color: '#fa8c16', desc: '可管理图书、借阅、用户、积分等核心功能' },
  owner: { label: '业主', color: '#52c41a', desc: '小区业主，可借阅图书和参与积分活动' },
  property: { label: '物业', color: '#1890ff', desc: '物业工作人员，可查看基础信息和统计' },
  user: { label: '普通用户', color: '#8c8c8c', desc: '访客或临时用户，仅有借阅权限' },
};

// 功能模块说明
export const FEATURE_CONFIG = {
  borrow: { label: '借阅功能', desc: '图书借阅和归还管理' },
  bookManage: { label: '图书管理', desc: '图书的增删改查和分类管理' },
  userManage: { label: '用户管理', desc: '用户注册、权限分配和信息管理' },
  pointsMall: { label: '积分商城', desc: '积分兑换和积分记录查询' },
  toolShare: { label: '工具共享', desc: '工具录入、租借和归还管理' },
};

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
  },
});

// 应用主题到文档
export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};