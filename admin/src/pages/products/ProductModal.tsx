import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import type { Product, ProductCreateInput, ProductGender } from '../../types';
import { useAppSelector } from '../../app/hooks';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateInput) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const brands = useAppSelector((state) => state.brands.items);
  const categories = useAppSelector((state) => state.categories.items);

  const [formData, setFormData] = useState<ProductCreateInput>({
    name: '',
    gender: 'unisex',
    price: 0,
    salePrice: 0,
    colors: '',
    quantity: 10,
    brandId: '',
    categoryId: '',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        gender: initialData.gender,
        price: initialData.price,
        salePrice: initialData.salePrice,
        colors: initialData.colors || '',
        quantity: initialData.quantity,
        brandId: initialData.brandId || '',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        status: initialData.status === 'deleted' ? 'inactive' : initialData.status,
      });
    } else {
      setFormData({
        name: '',
        gender: 'unisex',
        price: 0,
        salePrice: 0,
        colors: '',
        quantity: 10,
        brandId: brands[0]?.id || '',
        categoryId: categories[0]?.id || '',
        description: '',
        status: 'active',
      });
    }
  }, [initialData, isOpen, brands, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const genderOptions = [
    { value: 'unisex', label: 'Unisex (Cả nam & nữ)' },
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Đang bán (Active)' },
    { value: 'inactive', label: 'Tạm ẩn (Inactive)' },
  ];

  const brandOptions = [
    { value: '', label: '-- Chọn Thương hiệu --' },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ];

  const categoryOptions = [
    { value: '', label: '-- Chọn Danh mục --' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      maxWidth="640px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Tên sản phẩm *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ví dụ: Giày Nike Air Zoom Pegasus 40"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Giá niêm yết (VNĐ) *"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
            required
          />
          <Input
            label="Giá khuyến mãi (VNĐ)"
            type="number"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
            min={0}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Danh mục *"
            options={categoryOptions}
            value={formData.categoryId || ''}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          />
          <Select
            label="Thương hiệu *"
            options={brandOptions}
            value={formData.brandId || ''}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Select
            label="Giới tính"
            options={genderOptions}
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as ProductGender })}
          />
          <Input
            label="Số lượng kho *"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            min={0}
            required
          />
          <Select
            label="Trạng thái"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
          />
        </div>

        <Input
          label="Màu sắc (phân cách bằng dấu phẩy)"
          value={formData.colors || ''}
          onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
          placeholder="Trắng, Đen, Đỏ"
        />

        <div className="form-group">
          <label className="form-label">Mô tả sản phẩm</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Thông tin chi tiết về chất liệu, thông số..."
          />
        </div>
      </form>
    </Modal>
  );
};
