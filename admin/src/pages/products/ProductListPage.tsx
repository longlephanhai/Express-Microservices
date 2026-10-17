import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchProductsAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
} from '../../features/products/productSlice';
import { addToast } from '../../features/ui/uiSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ProductModal } from './ProductModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Product, ProductCreateInput } from '../../types';
import { Plus, Search, Edit3, Trash2, Tag, Layers, RefreshCw } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: products, status } = useAppSelector((state) => state.products);
  const categories = useAppSelector((state) => state.categories.items);
  const brands = useAppSelector((state) => state.brands.items);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsAsync(undefined));
  }, [dispatch]);

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter ? p.categoryId === selectedCategoryFilter : true;
    const matchesBrand = selectedBrandFilter ? p.brandId === selectedBrandFilter : true;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData: ProductCreateInput) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await dispatch(updateProductAsync({ id: editingProduct.id, input: formData })).unwrap();
        dispatch(addToast({ type: 'success', message: 'Cập nhật sản phẩm thành công!' }));
      } else {
        await dispatch(createProductAsync(formData)).unwrap();
        dispatch(addToast({ type: 'success', message: 'Tạo sản phẩm mới thành công!' }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: 'Có lỗi xảy ra khi lưu sản phẩm' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    setSubmitting(true);
    try {
      await dispatch(deleteProductAsync(deletingProductId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Đã xóa sản phẩm thành công!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Có lỗi xảy ra khi xóa' }));
    } finally {
      setSubmitting(false);
      setDeletingProductId(null);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Tất cả danh mục' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const brandOptions = [
    { value: '', label: 'Tất cả thương hiệu' },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
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
            Quản lý <span className="text-gradient">Sản phẩm</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Kết nối trực tiếp Product Service qua API Gateway (Port 3003)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(fetchProductsAsync(undefined))}
            isLoading={status === 'loading'}
            icon={<RefreshCw size={14} />}
          >
            Làm mới
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} icon={<Plus size={16} />}>
            Thêm sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />

          <Select
            options={categoryOptions}
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />

          <Select
            options={brandOptions}
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Tìm thấy <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> sản phẩm
          </div>
        </div>
      </Card>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            title="Không tìm thấy sản phẩm nào"
            description="Hãy thử đổi bộ lọc tìm kiếm hoặc bấm Thêm sản phẩm để tạo mặt hàng đầu tiên."
            actionText="Thêm sản phẩm mới"
            onAction={handleOpenCreateModal}
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Giá bán</th>
                  <th>Kho hàng</th>
                  <th>Đã bán</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const brand = brands.find((b) => b.id === p.brandId);
                  const category = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        {p.colors && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Màu: {p.colors}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Layers size={12} /> {category?.name || 'Mặc định'}
                          </span>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={12} /> {brand?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(p.salePrice || p.price)}
                        </div>
                        {p.salePrice > 0 && p.salePrice < p.price && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatCurrency(p.price)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: p.quantity > 5 ? 'var(--color-success)' : p.quantity > 0 ? 'var(--color-warning)' : 'var(--color-danger)',
                          }}
                        >
                          {p.quantity} chiếc
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-info)' }}>
                          {p.saleCount || 0}
                        </span>
                      </td>
                      <td>
                        <Badge variant={p.status === 'active' ? 'success' : 'neutral'}>
                          {p.status === 'active' ? 'Đang bán' : 'Tạm ẩn'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(p.updatedAt || p.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="btn-icon"
                            title="Sửa sản phẩm"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="btn-icon"
                            title="Xóa sản phẩm"
                            style={{
                              background: 'var(--color-danger-bg)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: 'var(--color-danger)',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingProduct}
        isLoading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sản phẩm"
        message="Hành động này sẽ xóa sản phẩm khỏi danh mục quản lý. Bạn có chắc chắn muốn tiếp tục?"
        isLoading={submitting}
      />
    </div>
  );
};
