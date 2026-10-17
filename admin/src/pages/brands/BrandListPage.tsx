import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchBrandsAsync,
  createBrandAsync,
  updateBrandAsync,
  deleteBrandAsync,
} from '../../features/brands/brandSlice';
import { addToast } from '../../features/ui/uiSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { formatDate } from '../../utils/formatters';
import type { Brand, BrandCreateInput } from '../../types';
import { Plus, Edit3, Trash2, Tag, Search, RefreshCw } from 'lucide-react';

export const BrandListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: brands, status } = useAppSelector((state) => state.brands);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<BrandCreateInput>({
    name: '',
    description: '',
    logo: '',
    status: 'active',
  });

  useEffect(() => {
    dispatch(fetchBrandsAsync());
  }, [dispatch]);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logo: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Brand) => {
    setEditingBrand(b);
    setFormData({
      name: b.name,
      description: b.description || '',
      logo: b.logo || '',
      status: b.status === 'deleted' ? 'inactive' : b.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBrand) {
        await dispatch(updateBrandAsync({ id: editingBrand.id, input: formData })).unwrap();
        dispatch(addToast({ type: 'success', message: 'Cập nhật thương hiệu thành công!' }));
      } else {
        await dispatch(createBrandAsync(formData)).unwrap();
        dispatch(addToast({ type: 'success', message: 'Tạo thương hiệu mới thành công!' }));
      }
      setIsModalOpen(false);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Có lỗi xảy ra khi lưu thương hiệu' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await dispatch(deleteBrandAsync(deletingId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Đã xóa thương hiệu thành công!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Không thể xóa thương hiệu' }));
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

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
            Quản lý <span className="text-gradient">Thương hiệu</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Kết nối Brand Service qua API Gateway (Port 3001)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(fetchBrandsAsync())}
            isLoading={status === 'loading'}
            icon={<RefreshCw size={14} />}
          >
            Làm mới
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} icon={<Plus size={16} />}>
            Thêm thương hiệu mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ maxWidth: '400px' }}>
          <Input
            placeholder="Tìm theo tên thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {/* Grid of Brand Cards */}
      {filteredBrands.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Tag size={32} />}
            title="Chưa có thương hiệu nào"
            description="Thêm các đối tác thương hiệu để gắn nhãn cho sản phẩm."
            actionText="Thêm thương hiệu"
            onAction={handleOpenCreateModal}
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredBrands.map((b) => (
            <Card key={b.id} hoverable={true} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge variant={b.status === 'active' || !b.status ? 'success' : 'neutral'}>
                    {b.status === 'active' || !b.status ? 'Hoạt động' : 'Tạm ẩn'}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {b.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, minHeight: '38px' }}>
                  {b.description || 'Không có mô tả chi tiết'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(b.createdAt)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="btn-icon"
                    title="Chỉnh sửa"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingId(b.id)}
                    className="btn-icon"
                    title="Xóa thương hiệu"
                    style={{ background: 'var(--color-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitModal} isLoading={submitting}>
              {editingBrand ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitModal}>
          <Input
            label="Tên thương hiệu *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Nike, Adidas, Puma..."
            required
          />

          <Input
            label="Đường dẫn Logo (URL)"
            value={formData.logo || ''}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://..."
          />

          <div className="form-group">
            <label className="form-label">Mô tả hoặc slogan thương hiệu</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Slogan, thông tin đối tác..."
            />
          </div>

          <Select
            label="Trạng thái"
            options={[
              { value: 'active', label: 'Hoạt động (Active)' },
              { value: 'inactive', label: 'Tạm ẩn (Inactive)' },
            ]}
            value={formData.status || 'active'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa thương hiệu"
        message="Bạn có chắc chắn muốn xóa thương hiệu này?"
        isLoading={submitting}
      />
    </div>
  );
};
