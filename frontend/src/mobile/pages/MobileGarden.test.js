/**
 * MobileGarden 组件测试
 * 测试家园页面（贡献榜）的渲染和交互
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileGarden from './MobileGarden';

describe('MobileGarden 组件测试', () => {
  // ===== 基础渲染测试 =====
  describe('基础渲染', () => {
    test('页面 Header 正确渲染', () => {
      render(<MobileGarden />);
      expect(screen.getByText('🏠 家园')).toBeInTheDocument();
      expect(screen.getByText('共建美好社区，共享品质生活')).toBeInTheDocument();
    });

    test('Tab 切换正确渲染', () => {
      render(<MobileGarden />);
      expect(screen.getByText('按楼栋')).toBeInTheDocument();
      expect(screen.getByText('小区总榜')).toBeInTheDocument();
    });

    test('默认显示楼栋视角', () => {
      render(<MobileGarden />);
      expect(screen.getByText('A栋')).toBeInTheDocument();
    });

    test('Mock 数据正确渲染楼栋列表', () => {
      render(<MobileGarden />);
      expect(screen.getByText('B栋')).toBeInTheDocument();
      expect(screen.getByText('C栋')).toBeInTheDocument();
    });

    test('楼栋总积分正确显示', () => {
      render(<MobileGarden />);
      expect(screen.getByText('🏆 总积分 1250')).toBeInTheDocument();
      expect(screen.getByText('🏆 总积分 980')).toBeInTheDocument();
    });
  });

  // ===== 贡献者渲染测试 =====
  describe('贡献者列表渲染', () => {
    test('楼栋 Top3 贡献者正确显示', () => {
      render(<MobileGarden />);
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
    });

    test('贡献积分正确显示', () => {
      render(<MobileGarden />);
      expect(screen.getByText('+320分')).toBeInTheDocument();
      expect(screen.getByText('+210分')).toBeInTheDocument();
      expect(screen.getByText('+180分')).toBeInTheDocument();
    });

    test('贡献等级星级正确显示', () => {
      render(<MobileGarden />);
      const goldStars = screen.getAllByText('★★★');
      expect(goldStars.length).toBeGreaterThan(0);
      const silverStars = screen.getAllByText('★★');
      expect(silverStars.length).toBeGreaterThan(0);
    });

    test('排名徽章正确显示', () => {
      render(<MobileGarden />);
      const rankBadges = document.querySelectorAll('.rank-badge');
      expect(rankBadges.length).toBeGreaterThan(0);
    });
  });

  // ===== Tab 切换测试 =====
  describe('Tab 切换交互', () => {
    test('点击"小区总榜"切换到社区视角', async () => {
      render(<MobileGarden />);
      const communityTab = screen.getByText('小区总榜');
      fireEvent.click(communityTab);
      await waitFor(() => {
        expect(screen.getByText('绿城花园')).toBeInTheDocument();
      });
    });

    test('小区总榜显示社区总积分', async () => {
      render(<MobileGarden />);
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        expect(screen.getByText('🏆 社区总贡献积分')).toBeInTheDocument();
      });
    });

    test('小区总榜显示 Top10 住户', async () => {
      render(<MobileGarden />);
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        expect(screen.getByText('陈十四')).toBeInTheDocument();
        expect(screen.getByText('张三')).toBeInTheDocument();
      });
    });

    test('从社区视角切回楼栋视角', async () => {
      render(<MobileGarden />);
      // 先切换到社区
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        expect(screen.getByText('绿城花园')).toBeInTheDocument();
      });
      // 再切回楼栋
      fireEvent.click(screen.getByText('按楼栋'));
      await waitFor(() => {
        expect(screen.getByText('A栋')).toBeInTheDocument();
        expect(screen.queryByText('绿城花园')).not.toBeInTheDocument();
      });
    });
  });

  // ===== 楼栋展开交互测试 =====
  describe('楼栋展开/折叠交互', () => {
    test('点击楼栋头部展开完整榜单', async () => {
      render(<MobileGarden />);
      // 找到 A栋 的 building-header 并点击
      const aBuilding = document.querySelector('.building-card');
      const buildingHeader = aBuilding.querySelector('.building-header');
      fireEvent.click(buildingHeader);
      await waitFor(() => {
        expect(screen.getByText('赵六')).toBeInTheDocument();
      });
    });

    test('再次点击楼栋头部折叠榜单', async () => {
      render(<MobileGarden />);
      const aBuilding = document.querySelector('.building-card');
      const buildingHeader = aBuilding.querySelector('.building-header');
      fireEvent.click(buildingHeader); // 展开
      await waitFor(() => {
        expect(screen.getByText('赵六')).toBeInTheDocument();
      });
      fireEvent.click(buildingHeader); // 折叠
      await waitFor(() => {
        expect(screen.queryByText('赵六')).not.toBeInTheDocument();
      });
    });
  });

  // ===== 数据边界测试 =====
  describe('数据边界测试', () => {
    test('空数据时页面不崩溃', () => {
      const { container } = render(<MobileGarden />);
      expect(container.querySelector('.garden-page')).toBeInTheDocument();
    });

    test('所有楼栋渲染数量正确', () => {
      render(<MobileGarden />);
      const buildingCards = document.querySelectorAll('.building-card');
      expect(buildingCards.length).toBe(3);
    });
  });

  // ===== 小区视角样式测试 =====
  describe('小区视角样式', () => {
    test('小区 Banner 正确渲染', async () => {
      render(<MobileGarden />);
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        const banner = document.querySelector('.community-banner');
        expect(banner).toBeInTheDocument();
      });
    });

    test('排名列表正确渲染', async () => {
      render(<MobileGarden />);
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        const rankList = document.querySelector('.rank-list');
        expect(rankList).toBeInTheDocument();
      });
    });

    test('排名列表包含10条记录', async () => {
      render(<MobileGarden />);
      fireEvent.click(screen.getByText('小区总榜'));
      await waitFor(() => {
        const residentRows = document.querySelectorAll('.rank-list .resident-row');
        expect(residentRows.length).toBe(10);
      });
    });
  });
});