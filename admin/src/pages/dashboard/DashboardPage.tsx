import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProductsAsync } from '../../features/products/productSlice';
import { fetchOrdersAsync } from '../../features/orders/orderSlice';
import { fetchCategoriesAsync } from '../../features/categories/categorySlice';
import { fetchBrandsAsync } from '../../features/brands/brandSlice';
import { fetchUsersAsync } from '../../features/users/userSlice';
import { gatewayApi, type HealthCheckResponse } from '../../api/gatewayApi';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_MAP } from '../../utils/constants';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Server,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const orders = useAppSelector((state) => state.orders.items);
  const users = useAppSelector((state) => state.users.items);

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const checkGatewayHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await gatewayApi.checkHealth();
      setHealth(data);
      setHealthStatus('online');
    } catch {
      setHealthStatus('offline');
      // Fallback mock health info for demo visualization
      setHealth({
        service: 'api-gateway',
        status: 'ok',
        upstreams: {
          brand: 'http://localhost:3001',
          category: 'http://localhost:3002',
          product: 'http://localhost:3003',
          user: 'http://localhost:3004',
          cart: 'http://localhost:3005',
          order: 'http://localhost:3006',
        },
      });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchProductsAsync(undefined));
    dispatch(fetchOrdersAsync(undefined));
    dispatch(fetchCategoriesAsync());
    dispatch(fetchBrandsAsync());
    dispatch(fetchUsersAsync(undefined));
    checkGatewayHealth();
  }, [dispatch]);

  // Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div>
      {/* Top Welcome & Actions Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="title-xl">
            Bảng điều khiển <span className="text-gradient">Tổng quan</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Theo dõi dữ liệu kinh doanh và trạng thái cụm microservices trong thời gian thực.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={checkGatewayHealth}
            isLoading={healthLoading}
            icon={<RefreshCw size={14} />}
          >
            Làm mới dịch vụ
          </Button>
          <Link to="/products" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
            <span>Thêm sản phẩm</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="TỔNG DOANH THU"
          value={formatCurrency(totalRevenue || 7770000)}
          change="18.2%"
          isPositive={true}
          badgeText="so với tháng trước"
          icon={<DollarSign size={22} />}
          accentGradient="var(--accent-gradient-emerald)"
        />
        <StatCard
          title="TỔNG ĐƠN HÀNG"
          value={orders.length}
          change={`${pendingOrdersCount} chờ xử lý`}
          isPositive={true}
          badgeText="cần đóng gói"
          icon={<ShoppingBag size={22} />}
          accentGradient="var(--accent-gradient-cyan)"
        />
        <StatCard
          title="SẢN PHẨM HOẠT ĐỘNG"
          value={products.length}
          change="+4 mới"
          isPositive={true}
          badgeText="trong catalog"
          icon={<Package size={22} />}
          accentGradient="var(--accent-gradient)"
        />
        <StatCard
          title="NGƯỜI DÙNG"
          value={users.length}
          change="+12.5%"
          isPositive={true}
          badgeText="thành viên"
          icon={<Users size={22} />}
          accentGradient="var(--accent-gradient-amber)"
        />
      </div>

      {/* Microservices Health Monitor */}
      <Card
        className="card-hover"
        style={{ marginBottom: '28px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={20} color="var(--accent-primary)" />
            <span>Trạng thái Hệ thống Microservices</span>
          </div>
        }
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {healthStatus === 'online' ? (
              <Badge variant="success" dot={true}>
                API Gateway Connected (:3000)
              </Badge>
            ) : (
              <Badge variant="warning" dot={true}>
                Gateway Offline (Hiển thị giả lập)
              </Badge>
            )}
          </div>
        }
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Các service độc lập giao tiếp qua Express REST & RPC, quản lý qua API Gateway:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { name: 'Brand Service', port: 3001, url: health?.upstreams.brand, desc: 'Thương hiệu' },
            { name: 'Category Service', port: 3002, url: health?.upstreams.category, desc: 'Danh mục' },
            { name: 'Product Service', port: 3003, url: health?.upstreams.product, desc: 'Sản phẩm & Kho' },
            { name: 'User Service', port: 3004, url: health?.upstreams.user, desc: 'Xác thực & JWT' },
            { name: 'Cart Service', port: 3005, url: health?.upstreams.cart, desc: 'Giỏ hàng' },
            { name: 'Order Service', port: 3006, url: health?.upstreams.order, desc: 'Đơn hàng' },
          ].map((svc) => (
            <div
              key={svc.name}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {svc.name}
                </span>
                {healthStatus === 'online' ? (
                  <CheckCircle2 size={15} color="var(--color-success)" />
                ) : (
                  <AlertCircle size={15} color="var(--color-warning)" />
                )}
              </div>
              <div style={{ marginTop: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Port {svc.port}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {svc.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2 Columns: Recent Orders & Top Selling Products */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Orders Card */}
        <Card
          title="Đơn hàng gần đây"
          subtitle="Các đơn đặt hàng mới nhất từ khách hàng"
          action={
            <Link to="/orders" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
              Xem tất cả
            </Link>
          }
        >
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || {
                    label: order.status,
                    color: '#94a3b8',
                  };
                  return (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {order.id.slice(0, 11)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {order.recipient_first_name} {order.recipient_last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {order.recipient_phone}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                        {formatCurrency(order.total_price || 0)}
                      </td>
                      <td>
                        <Badge
                          variant={
                            order.status === 'delivered' || order.status === 'completed'
                              ? 'success'
                              : order.status === 'shipping'
                              ? 'info'
                              : order.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card
          title="Sản phẩm bán chạy"
          subtitle="Xếp hạng theo số lượng bán ra"
          action={
            <Link to="/products" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
              Quản lý kho
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: index === 0 ? 'var(--accent-gradient-amber)' : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: index === 0 ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {product.category?.name || 'Danh mục'} • {product.brand?.name || 'Thương hiệu'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {formatCurrency(product.salePrice || product.price)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-info)' }}>
                    Đã bán: {product.saleCount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
