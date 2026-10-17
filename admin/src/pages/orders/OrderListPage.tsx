import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchOrdersAsync,
  updateOrderStatusAsync,
} from '../../features/orders/orderSlice';
import { addToast } from '../../features/ui/uiSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from '../../utils/constants';
import type { Order, OrderStatus } from '../../types';
import {
  Search,
  Eye,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const OrderListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: orders, status } = useAppSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersAsync(undefined));
  }, [dispatch]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.recipient_phone && o.recipient_phone.includes(searchTerm)) ||
      (o.recipient_first_name && o.recipient_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.recipient_last_name && o.recipient_last_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setSubmitting(true);
    try {
      await dispatch(updateOrderStatusAsync({ id: orderId, input: { status: newStatus } })).unwrap();
      dispatch(addToast({ type: 'success', message: `Đã cập nhật trạng thái đơn thành: ${newStatus}` }));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      dispatch(addToast({ type: 'error', message: 'Không thể cập nhật trạng thái đơn hàng' }));
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý (Pending)' },
    { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
    { value: 'shipping', label: 'Đang giao (Shipping)' },
    { value: 'delivered', label: 'Đã giao (Delivered)' },
    { value: 'canceled', label: 'Đã hủy (Canceled)' },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="title-xl">
            Quản lý <span className="text-gradient">Đơn hàng</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Kết nối Order Service qua API Gateway (Port 3006)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch(fetchOrdersAsync(undefined))}
          isLoading={status === 'loading'}
          icon={<RefreshCw size={14} />}
        >
          Làm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Tìm theo mã đơn, SĐT hoặc tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong style={{ color: 'var(--text-primary)' }}>{filteredOrders.length}</strong> đơn hàng
          </div>
        </div>
      </Card>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="Không tìm thấy đơn hàng nào"
            description="Hãy thử đổi điều kiện lọc trạng thái hoặc từ khóa tìm kiếm."
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người nhận</th>
                  <th>Địa chỉ giao</th>
                  <th>Tổng giá trị</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái đơn</th>
                  <th>Thời gian</th>
                  <th style={{ textAlign: 'right' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const statusInfo = ORDER_STATUS_MAP[ord.status] || { label: ord.status };
                  const paymentInfo = PAYMENT_STATUS_MAP[ord.payment_status] || { label: ord.payment_status };
                  return (
                    <tr key={ord.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {ord.id.slice(0, 11)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {ord.recipient_first_name} {ord.recipient_last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.recipient_phone}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {ord.shipping_address}
                        {ord.shipping_city ? `, ${ord.shipping_city}` : ''}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.9rem' }}>
                        {formatCurrency(ord.total_price || 0)}
                      </td>
                      <td>
                        <Badge variant={ord.payment_status === 'paid' ? 'success' : 'warning'}>
                          {paymentInfo.label}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            ord.status === 'delivered' || ord.status === 'completed'
                              ? 'success'
                              : ord.status === 'shipping'
                              ? 'info'
                              : ord.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(ord.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(ord)}
                          icon={<Eye size={14} />}
                        >
                          Xem
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Chi tiết Đơn hàng #${selectedOrder.id.slice(0, 11)}`}
          maxWidth="680px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                    isLoading={submitting}
                    icon={<CheckCircle size={14} />}
                  >
                    Duyệt đơn
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')}
                    isLoading={submitting}
                    icon={<Truck size={14} />}
                  >
                    Giao hàng
                  </Button>
                )}
                {selectedOrder.status === 'shipping' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    isLoading={submitting}
                    icon={<CheckCircle size={14} />}
                  >
                    Hoàn tất giao
                  </Button>
                )}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'canceled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'canceled')}
                    isLoading={submitting}
                    icon={<XCircle size={14} />}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
            </div>
          }
        >
          {/* Customer & Shipping Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Thông tin người nhận
              </span>
              <div style={{ fontWeight: 600, fontSize: '0.925rem', marginTop: '4px' }}>
                {selectedOrder.recipient_first_name} {selectedOrder.recipient_last_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <Phone size={13} /> {selectedOrder.recipient_phone || 'Chưa cập nhật'}
              </div>
              {selectedOrder.recipient_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <Mail size={13} /> {selectedOrder.recipient_email}
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Địa chỉ giao hàng & Vận chuyển
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {selectedOrder.shipping_address}
                  {selectedOrder.shipping_city ? `, ${selectedOrder.shipping_city}` : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '6px' }}>
                Mã vận đơn: {selectedOrder.tracking_number || 'Chưa cấp mã'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>
              Sản phẩm trong đơn ({selectedOrder.items?.length || 1})
            </h4>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>SL</th>
                    <th style={{ textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items && selectedOrder.items.length > 0
                    ? selectedOrder.items
                    : [
                        {
                          id: 'mock-it-1',
                          order_id: selectedOrder.id,
                          product_id: 'p1',
                          product_name: 'Sản phẩm tiêu chuẩn',
                          price: selectedOrder.total_price || 0,
                          quantity: 1,
                          total_amount: selectedOrder.total_price || 0,
                        },
                      ]
                  ).map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.product_name || `Mã SP: ${item.product_id}`}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>x{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.total_amount || item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Tổng tiền thanh toán:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {formatCurrency(selectedOrder.total_price || 0)}
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
};
