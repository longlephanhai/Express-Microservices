import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchOrdersAsync,
  updateOrderStatusAsync,
  deleteOrderAsync,
} from '../../features/orders/orderSlice';
import { orderItemApi, type OrderItemRecord } from '../../api/orderItemApi';
import { addToast } from '../../features/ui/uiSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
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
  Trash2,
} from 'lucide-react';

export const OrderListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: orders, status, error } = useAppSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRecord[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersAsync(undefined));
  }, [dispatch]);

  const handleOpenOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    setOrderItems([]);
    try {
      const res = await orderItemApi.getOrderItems(order.id);
      setOrderItems(res.data || []);
    } catch (e) {
      console.error('Lỗi khi tải order items:', e);
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

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

  const handleDeleteOrder = async (orderId: string) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId.slice(0, 8)}?`);
    if (!confirmDelete) return;

    setSubmitting(true);
    try {
      await dispatch(deleteOrderAsync(orderId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Đã xóa đơn hàng thành công' }));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Không thể xóa đơn hàng' }));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.recipient_phone && o.recipient_phone.includes(searchTerm)) ||
      (o.recipient_first_name && o.recipient_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.recipient_last_name && o.recipient_last_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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
            Dữ liệu trực tiếp từ Order Service & Order Items Database
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

      {/* Error alert */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-danger)',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Filters Bar */}
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
            placeholder="Tìm theo mã đơn, SĐT hoặc người nhận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />

          <Select
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'confirmed', label: 'Đã xác nhận' },
              { value: 'shipping', label: 'Đang giao hàng' },
              { value: 'delivered', label: 'Đã giao' },
              { value: 'canceled', label: 'Đã hủy' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong style={{ color: 'var(--text-primary)' }}>{filteredOrders.length}</strong> đơn hàng
          </div>
        </div>
      </Card>

      {/* Main Table or Loading/Empty */}
      {status === 'loading' && orders.length === 0 ? (
        <Card style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner size="lg" />
        </Card>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description="Chưa có đơn hàng nào hoặc không có kết quả phù hợp với bộ lọc hiện tại."
          icon={<ShoppingBag size={48} />}
        />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái đơn</th>
                  <th>Ngày đặt</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const statusInfo = ORDER_STATUS_MAP[ord.status] || {
                    label: ord.status,
                    variant: 'neutral',
                  };
                  const payInfo = PAYMENT_STATUS_MAP[ord.payment_status] || {
                    label: ord.payment_status,
                    variant: 'neutral',
                  };

                  return (
                    <tr key={ord.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-primary)',
                          }}
                        >
                          #{ord.id.slice(0, 8)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {ord.recipient_first_name} {ord.recipient_last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.recipient_phone || 'Không có SĐT'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(ord.total_price || 0)}
                      </td>
                      <td>
                        <Badge
                          variant={
                            ord.payment_status === 'paid'
                              ? 'success'
                              : ord.payment_status === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {payInfo.label}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            ord.status === 'delivered'
                              ? 'success'
                              : ord.status === 'confirmed' || ord.status === 'shipping'
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenOrderDetail(ord)}
                            icon={<Eye size={14} />}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa đơn hàng"
                            onClick={() => handleDeleteOrder(ord.id)}
                            icon={<Trash2 size={14} color="var(--accent-danger)" />}
                          />
                        </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  title="Xóa đơn hàng khỏi hệ thống"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  isLoading={submitting}
                  icon={<Trash2 size={14} color="var(--accent-danger)" />}
                >
                  Xóa
                </Button>
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
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                NGƯỜI NHẬN HÀNG
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {selectedOrder.recipient_first_name} {selectedOrder.recipient_last_name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Phone size={13} /> {selectedOrder.recipient_phone || 'Chưa cập nhật'}
              </div>
              {selectedOrder.recipient_email && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Mail size={13} /> {selectedOrder.recipient_email}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ĐỊA CHỈ NHẬN HÀNG
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  {selectedOrder.shipping_address}
                  {selectedOrder.shipping_city ? `, ${selectedOrder.shipping_city}` : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Mã vận đơn: {selectedOrder.tracking_number || 'Chưa cấp mã'}
              </div>
            </div>
          </div>

          {/* Items Table with Real Data from Order Items API */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>
              Sản phẩm trong đơn ({orderItems.length})
            </h4>
            {loadingItems ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spinner size="md" />
              </div>
            ) : orderItems.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                Chưa có mặt hàng nào được ghi nhận cho đơn này trong database.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Thuộc tính</th>
                      <th>Đơn giá</th>
                      <th>SL</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name || `Mã SP: ${item.product_id}`}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.attribute || '-'}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>x{item.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {formatCurrency(selectedOrder.total_price || 0)}
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
};
