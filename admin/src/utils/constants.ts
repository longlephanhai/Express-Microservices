export const STORAGE_KEYS = {
  TOKEN: 'admin_access_token',
  USER: 'admin_user_profile',
  THEME: 'admin_theme_preference',
  SIDEBAR: 'admin_sidebar_collapsed',
} as const;

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  processing: { label: 'Đang đóng gói', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  shipping: { label: 'Đang giao hàng', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  delivered: { label: 'Đã giao thành công', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  completed: { label: 'Hoàn tất', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  canceled: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  refunded: { label: 'Đã hoàn tiền', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' },
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chưa thanh toán', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  paid: { label: 'Đã thanh toán', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  failed: { label: 'Thanh toán lỗi', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

export const GENDER_MAP: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  unisex: 'Unisex',
};
