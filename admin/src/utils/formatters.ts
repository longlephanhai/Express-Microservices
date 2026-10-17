export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateString);
  }
};

export const formatNumber = (num: number = 0): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const truncateText = (text: string, maxLength: number = 40): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
