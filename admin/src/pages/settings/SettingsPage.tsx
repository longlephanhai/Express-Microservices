import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/ui/uiSlice';
import { Server, Database, Sliders, Moon, Sun, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const productsCount = useAppSelector((state) => state.products.items.length);
  const ordersCount = useAppSelector((state) => state.orders.items.length);
  const categoriesCount = useAppSelector((state) => state.categories.items.length);
  const brandsCount = useAppSelector((state) => state.brands.items.length);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="title-xl">
          Cấu hình <span className="text-gradient">Hệ thống</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          Thông tin kiến trúc hạ tầng Express Microservices, Redux Store và cấu hình giao diện.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Microservices Cluster Configuration */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="var(--accent-primary)" />
              <span>Cụm Microservices (Architecture)</span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'API Gateway', port: '3000', tech: 'Express / Proxy / Swagger', env: 'GATEWAY_PORT' },
              { name: 'Brand Service', port: '3001', tech: 'Clean Architecture / Sequelize', env: 'BRAND_SERVICE_URL' },
              { name: 'Category Service', port: '3002', tech: 'Hexagonal / Tree Category', env: 'CATEGORY_SERVICE_URL' },
              { name: 'Product Service', port: '3003', tech: 'RPC Client / Zod / MySQL', env: 'PRODUCT_SERVICE_URL' },
              { name: 'User Service', port: '3004', tech: 'JWT Auth / Argon2 / Profiles', env: 'USER_SERVICE_URL' },
              { name: 'Cart Service', port: '3005', tech: 'Redis / Session / Cart Sync', env: 'CART_SERVICE_URL' },
              { name: 'Order Service', port: '3006', tech: 'Order State Machine / Items', env: 'ORDER_SERVICE_URL' },
            ].map((svc) => (
              <div
                key={svc.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{svc.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{svc.tech}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                    }}
                  >
                    Port {svc.port}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Redux Toolkit State Monitor */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--color-info)" />
              <span>Redux Toolkit Store State</span>
            </div>
          }
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Số lượng thực thể đang được lưu trữ trong Redux Global Store client-side:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {[
              { label: 'Products In Store', count: productsCount, slice: 'products' },
              { label: 'Orders In Store', count: ordersCount, slice: 'orders' },
              { label: 'Categories In Store', count: categoriesCount, slice: 'categories' },
              { label: 'Brands In Store', count: brandsCount, slice: 'brands' },
            ].map((st) => (
              <div
                key={st.label}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.slice}Slice</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {st.count}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Gợi ý:</strong> Redux DevTools extension đã được tích hợp tự động với Vite dev server.
          </div>
        </Card>

        {/* Theme & Display Settings */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--color-warning)" />
              <span>Giao diện & Theme</span>
            </div>
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Chế độ hiển thị</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Đang dùng: {theme === 'dark' ? 'Dark Mode (Tối)' : 'Light Mode (Sáng)'}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(toggleTheme())}
              icon={theme === 'dark' ? <Sun size={15} color="var(--color-warning)" /> : <Moon size={15} />}
            >
              Chuyển sang {theme === 'dark' ? 'Sáng' : 'Tối'}
            </Button>
          </div>
        </Card>

        {/* Database & Infrastructure */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--color-success)" />
              <span>Hạ tầng Cơ sở Dữ liệu</span>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Môi trường:</span>
              <Badge variant="success">AWS RDS MySQL 8.0</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Triển khai hạ tầng:</span>
              <span style={{ fontWeight: 600 }}>Terraform Infrastructure as Code</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Host backend:</span>
              <span style={{ fontWeight: 600 }}>Docker Compose / Render</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
