import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleSidebar } from '../../features/ui/uiSlice';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const navItems = [
    { label: 'Tổng quan', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Sản phẩm', path: '/products', icon: <Package size={20} /> },
    { label: 'Danh mục', path: '/categories', icon: <Layers size={20} /> },
    { label: 'Thương hiệu', path: '/brands', icon: <Tag size={20} /> },
    { label: 'Đơn hàng', path: '/orders', icon: <ShoppingBag size={20} /> },
    { label: 'Người dùng', path: '/users', icon: <Users size={20} /> },
    { label: 'Cấu hình hệ thống', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width var(--transition-normal)',
        overflowX: 'hidden',
      }}
    >
      {/* Brand Logo & Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 12px' : '0 20px',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            <Zap size={20} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <h2
                style={{
                  fontSize: '0.975rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Micro<span className="text-gradient">Admin</span>
              </h2>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>
                Express Architecture
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="btn-icon"
            title="Thu gọn menu"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '11px 0' : '11px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              boxShadow: isActive ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none',
              transition: 'all var(--transition-fast)',
            })}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer info: Microservices status badge */}
      <div
        style={{
          padding: collapsed ? '14px 8px' : '16px',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {collapsed ? (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="btn-icon"
            title="Mở rộng menu"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-card)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                boxShadow: '0 0 8px var(--color-success)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Server size={12} />
                <span>Gateway :3000</span>
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--color-success)' }}>
                6 Microservices
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
