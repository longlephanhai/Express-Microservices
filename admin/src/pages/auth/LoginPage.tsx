import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginAsync, setDemoAdmin, clearError } from '../../features/auth/authSlice';
import { addToast } from '../../features/ui/uiSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Zap, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password123@');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginAsync({ email, password }));
    if (loginAsync.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Đăng nhập thành công!' }));
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = () => {
    dispatch(setDemoAdmin());
    dispatch(addToast({ type: 'success', message: 'Đăng nhập bằng tài khoản Quản trị Demo!' }));
    navigate(from, { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.12) 0%, transparent 40%)',
      }}
    >
      <div
        className="card glass"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        }}
      >
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px',
            }}
          >
            <Zap size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Admin <span className="text-gradient">Portal</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Hệ thống Quản trị Express Microservices
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email quản trị viên"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            icon={<Mail size={16} />}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={status === 'loading'}
            style={{ width: '100%', marginTop: '8px', padding: '11px' }}
            icon={<ShieldCheck size={18} />}
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '22px 0',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-primary)' }} />
          <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hoặc thử nghiệm nhanh
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-primary)' }} />
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoLogin}
          style={{ width: '100%', padding: '10px' }}
          icon={<Sparkles size={16} color="var(--accent-primary)" />}
        >
          Vào ngay với quyền Super Admin Demo
        </Button>

        <div
          style={{
            marginTop: '20px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          <div>Tài khoản Database đã khởi tạo:</div>
          <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            admin@example.com / Password123@
          </strong>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Kết nối trực tiếp tới API Gateway :3000
        </div>
      </div>
    </div>
  );
};
