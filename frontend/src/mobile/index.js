/**
 * Mobile App Entry Point
 * 手机端入口
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppMobile from './AppMobile';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppMobile />
  </React.StrictMode>
);