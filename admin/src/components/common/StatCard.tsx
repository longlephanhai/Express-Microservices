import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  accentGradient?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  accentGradient = 'var(--accent-gradient)',
  badgeText,
}) => {
  return (
    <div
      className="card card-hover"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentGradient,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {title}
          </span>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginTop: '6px',
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8125rem',
        }}
      >
        {change && (
          <span
            style={{
              fontWeight: 700,
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
        {badgeText && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{badgeText}</span>
        )}
      </div>
    </div>
  );
};
