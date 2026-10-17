import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCategoriesAsync,
  createCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
} from '../../features/categories/categorySlice';
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
import type { Category, CategoryCreateInput } from '../../types';
import { Plus, Edit3, Trash2, Layers, Search, RefreshCw } from 'lucide-react';

export const CategoryListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: categories, status } = useAppSelector((state) => state.categories);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CategoryCreateInput>({
    name: '',
    description: '',
    parentId: null,
    status: 'active',
  });

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: null, status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      parentId: cat.parentId || null,
      status: cat.status === 'deleted' ? 'inactive' : cat.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await dispatch(updateCategoryAsync({ id: editingCategory.id, input: formData })).unwrap();
        dispatch(addToast({ type: 'success', message: 'Cập nhật danh mục thành công!' }));
      } else {
        await dispatch(createCategoryAsync(formData)).unwrap();
        dispatch(addToast({ type: 'success', message: 'Tạo danh mục mới thành công!' }));
      }
      setIsModalOpen(false);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Có lỗi xảy ra khi lưu danh mục' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await dispatch(deleteCategoryAsync(deletingId)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Đã xóa danh mục thành công!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Không thể xóa danh mục' }));
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Page Title & Actions */}
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
            Quản lý <span className="text-gradient">Danh mục</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Kết nối Category Service qua API Gateway (Port 3002)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(fetchCategoriesAsync())}
            isLoading={status === 'loading'}
            icon={<RefreshCw size={14} />}
          >
            Làm mới
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} icon={<Plus size={16} />}>
            Thêm danh mục mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ maxWidth: '400px' }}>
          <Input
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {/* Table */}
      {filteredCategories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers size={32} />}
            title="Chưa có danh mục nào"
            description="Tạo danh mục mới để phân loại các sản phẩm trong cửa hàng."
            actionText="Thêm danh mục"
            onAction={handleOpenCreateModal}
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Danh mục cha</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} color="var(--accent-primary)" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '300px' }}>
                      {cat.description || '-'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {cat.parentId ? 'Cấp con' : 'Cấp gốc (Root)'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={cat.status === 'active' || !cat.status ? 'success' : 'neutral'}>
                        {cat.status === 'active' || !cat.status ? 'Hoạt động' : 'Tạm ẩn'}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(cat.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="btn-icon"
                          title="Chỉnh sửa"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(cat.id)}
                          className="btn-icon"
                          title="Xóa danh mục"
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitModal} isLoading={submitting}>
              {editingCategory ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitModal}>
          <Input
            label="Tên danh mục *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Giày thể thao nam"
            required
          />

          <div className="form-group">
            <label className="form-label">Mô tả danh mục</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Thông tin giới thiệu về danh mục này..."
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
        title="Xác nhận xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hãy chắc chắn không còn sản phẩm nào thuộc danh mục trước khi xóa."
        isLoading={submitting}
      />
    </div>
  );
};
