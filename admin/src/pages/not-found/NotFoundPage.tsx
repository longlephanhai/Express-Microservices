import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '20px',
        }}
      >
        <Compass size={36} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
        Trang không tồn tại
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '12px 0 24px' }}>
        Địa chỉ đường dẫn bạn đang truy cập có thể đã bị xóa hoặc không khả dụng trên hệ thống quản trị.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary">Quay về Trang chủ</Button>
      </Link>
    </div>
  );
};
