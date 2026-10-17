import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/ui/uiSlice';
import { logout } from '../../features/auth/authSlice';
import {
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const user = useAppSelector((state) => state.auth.user);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header
      className="glass"
      style={{
        height: 'var(--header-height)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Left: Project title & tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-info-bg)',
              color: 'var(--color-info)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Shield size={13} />
            Hệ thống Quản trị Microservices
          </span>
        </div>
      </div>

      {/* Right: Actions (Swagger link, Theme toggle, Profile) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Swagger docs external link */}
        <a
          href="http://localhost:3000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
          title="Xem tài liệu Swagger API Gateway"
        >
          <span>Swagger Docs</span>
          <ExternalLink size={14} />
        </a>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="btn btn-icon"
          title={`Chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="var(--color-warning)" />
          ) : (
            <Moon size={18} color="var(--accent-primary)" />
          )}
        </button>

        {/* User Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--accent-gradient-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {user?.username || user?.email?.split('@')[0] || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                {user?.role || 'Admin'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {profileOpen && (
            <div
              className="card glass"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                padding: '8px',
                zIndex: 60,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang đăng nhập</div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email || 'admin@microservices.local'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <User size={15} />
                <span>Quyền: {user?.role || 'admin'}</span>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  dispatch(logout());
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  marginTop: '6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  border: 'none',
                  color: 'var(--color-danger)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
