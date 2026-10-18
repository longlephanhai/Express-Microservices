'use client'

import React, { useState, useEffect, useMemo, useId } from 'react'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Copy,
  LayoutGrid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ArrowLeft,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import {
  Brand,
  BrandCreateDTO,
  BrandUpdateDTO,
  Paging,
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '@/lib/api/brand'

// ─── Initial Mock Data (Fallback khi backend chưa chạy hoặc user muốn xem thử) ───
const SAMPLE_BRANDS: Brand[] = [
  {
    id: '0192e210-658a-773a-9e12-427fbf381201',
    name: 'Chanel Haute Couture',
    tagLine: 'Timeless French luxury & elegance',
    description: 'Iconic Parisian fashion house specializing in luxury goods and haute couture.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '0192e210-658a-773a-9e12-427fbf381202',
    name: 'Gucci Atelier',
    tagLine: 'Redefining modern luxury',
    description: 'Influential, innovative and progressive, Gucci is reinventing modern approach to fashion.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '0192e210-658a-773a-9e12-427fbf381203',
    name: 'Loro Piana Studio',
    tagLine: 'Uncompromising Italian craftsmanship',
    description: 'World benchmark for luxury cashmere, vicuña and the finest natural fibers.',
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: '0192e210-658a-773a-9e12-427fbf381204',
    name: 'Maison Margiela',
    tagLine: 'Deconstructed sartorial innovation',
    description: 'Avant-garde fashion brand redefining high fashion with anonymity and subversion.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    status: 'inactive',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
]

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  type: ToastType
  text: string
}

export default function BrandManagement() {
  const formNameId = useId()
  const formTaglineId = useId()
  const formImageId = useId()
  const formDescriptionId = useId()

  // ── States ──────────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // View & Filter states
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all')

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [paging, setPaging] = useState<Paging>({ page: 1, limit: 10, total: 0 })

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Active items for actions
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState<{
    name: string
    tagLine: string
    image: string
    description: string
  }>({
    name: '',
    tagLine: '',
    image: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<{ name?: string }>({})

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (text: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const fetchBrands = async (pageNumber = page, pageSize = limit) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBrands(pageNumber, pageSize)
      setBrands(res.data || [])
      if (res.paging) {
        setPaging(res.paging)
      } else {
        setPaging({ page: pageNumber, limit: pageSize, total: res.data?.length || 0 })
      }
      setUsingMockData(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi tải danh sách thương hiệu'
      setError(errorMsg)
      // Fallback sample data nếu backend chưa kết nối để người dùng kiểm tra giao diện
      if (brands.length === 0) {
        setBrands(SAMPLE_BRANDS)
        setPaging({ page: 1, limit: pageSize, total: SAMPLE_BRANDS.length })
        setUsingMockData(true)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands(page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  // ── Filtering & Searching ───────────────────────────────────────────────────
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.tagLine && brand.tagLine.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        brand.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === 'all' ? true : brand.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [brands, searchTerm, statusFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = brands.length
    const active = brands.filter((b) => b.status === 'active').length
    const inactive = brands.filter((b) => b.status === 'inactive').length
    const deleted = brands.filter((b) => b.status === 'deleted').length
    return { total, active, inactive, deleted }
  }, [brands])

  // ── Form Validation ─────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors: { name?: string } = {}
    if (!formData.name.trim()) {
      errors.name = 'Tên thương hiệu không được để trống'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Tên thương hiệu phải có ít nhất 2 ký tự (theo Brand Schema)'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Handlers: Create ────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setFormData({
      name: '',
      tagLine: '',
      image: '',
      description: '',
    })
    setFormErrors({})
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    const payload: BrandCreateDTO = {
      name: formData.name.trim(),
      tagLine: formData.tagLine.trim() || undefined,
      image: formData.image.trim() || undefined,
      description: formData.description.trim() || undefined,
    }

    try {
      if (!usingMockData) {
        await createBrand(payload)
      } else {
        // Mock creation
        const newBrand: Brand = {
          id: `0192e210-${Math.random().toString(16).slice(2, 10)}-brand`,
          name: payload.name,
          tagLine: payload.tagLine,
          image: payload.image,
          description: payload.description,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setBrands((prev) => [newBrand, ...prev])
      }

      addToast(`Thương hiệu "${payload.name}" đã được tạo thành công!`, 'success')
      setIsCreateOpen(false)
      if (!usingMockData) fetchBrands(1, limit)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo thương hiệu thất bại'
      addToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Handlers: Edit ──────────────────────────────────────────────────────────
  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setFormData({
      name: brand.name,
      tagLine: brand.tagLine || '',
      image: brand.image || '',
      description: brand.description || '',
    })
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand) return
    if (!validateForm()) return

    setSubmitting(true)
    const payload: BrandUpdateDTO = {
      name: formData.name.trim(),
      tagLine: formData.tagLine.trim() || undefined,
      image: formData.image.trim() || undefined,
      description: formData.description.trim() || undefined,
    }

    try {
      if (!usingMockData) {
        await updateBrand(selectedBrand.id, payload)
      } else {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === selectedBrand.id
              ? {
                  ...b,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        )
      }

      addToast(`Cập nhật thông tin "${payload.name}" thành công!`, 'success')
      setIsEditOpen(false)
      if (!usingMockData) fetchBrands(page, limit)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thương hiệu thất bại'
      addToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Handlers: Detail ────────────────────────────────────────────────────────
  const openDetailModal = async (brand: Brand) => {
    setSelectedBrand(brand)
    setIsDetailOpen(true)

    // Lấy thông tin mới nhất từ API chi tiết (nếu backend đang chạy)
    if (!usingMockData) {
      try {
        const detail = await getBrandById(brand.id)
        setSelectedBrand(detail)
      } catch {
        // Giữ selectedBrand hiện tại nếu fetch chi tiết gặp sự cố
      }
    }
  }

  // ── Handlers: Delete ────────────────────────────────────────────────────────
  const openDeleteModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return
    setSubmitting(true)
    try {
      if (!usingMockData) {
        await deleteBrand(selectedBrand.id)
      } else {
        setBrands((prev) =>
          prev.map((b) => (b.id === selectedBrand.id ? { ...b, status: 'deleted' as const } : b)),
        )
      }

      addToast(`Đã xóa thương hiệu "${selectedBrand.name}"!`, 'info')
      setIsDeleteOpen(false)
      if (!usingMockData) fetchBrands(page, limit)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa thương hiệu thất bại'
      addToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
    addToast('Đã sao chép Brand UUID vào clipboard', 'info')
  }

  // Status Badge Component
  const StatusBadge = ({ status }: { status: Brand['status'] }) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Inactive
          </span>
        )
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Deleted
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#182019]">
      {/* ── Top Bar / Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#e5e9e4] bg-[#111311] text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Về Cửa Hàng
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <Building2 className="text-[#8fbc8f]" size={20} />
              <h1 className="font-serif text-lg tracking-[0.08em] sm:text-xl">
                LUMORA <span className="font-sans text-xs text-[#8fbc8f]">/ Brand Studio</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBrands(page, limit)}
              disabled={loading}
              title="Làm mới danh sách"
              className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs tracking-wider text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-md bg-[#8fbc8f] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#111311] shadow transition hover:bg-[#a0cca0]"
            >
              <Plus size={16} />
              <span>Tạo thương hiệu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner thông báo chế độ Fallback / Backend Warning nếu có */}
        {usingMockData && (
          <div className="mb-6 flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div>
                <h4 className="text-sm font-semibold">Chế độ Xem Mẫu & Thử Nghiệm (Interactive Demo Mode)</h4>
                <p className="mt-1 text-xs text-amber-800">
                  Backend API ({process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/brands) chưa phản hồi
                  hoặc database chưa kết nối. Giao diện đang tự động nạp dữ liệu mẫu giúp bạn trải nghiệm trọn vẹn mọi
                  thao tác CRUD: Tạo mới, Xem chi tiết, Chỉnh sửa, và Xóa thương hiệu.
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchBrands(page, limit)}
              className="ml-3 shrink-0 rounded border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              Kết nối lại
            </button>
          </div>
        )}

        {/* ── Title & Stats Bar ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6d946d]">
                Microservices Module
              </p>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-[#161f18] sm:text-4xl">
                Quản lý Thương hiệu
              </h2>
              <p className="mt-1 text-xs text-[#5f6b61]">
                Quản lý thông tin thương hiệu, đối tác thời trang cao cấp, tagline và hình ảnh hiển thị.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 rounded-lg border border-[#e1e7df] bg-white p-2 shadow-xs">
              <div className="px-3 text-center">
                <span className="block font-serif text-xl font-medium text-[#182019]">{stats.total}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#6b766d]">Tổng số</span>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="px-3 text-center">
                <span className="block font-serif text-xl font-medium text-emerald-700">{stats.active}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#6b766d]">Active</span>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="px-3 text-center">
                <span className="block font-serif text-xl font-medium text-amber-700">{stats.inactive}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#6b766d]">Inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter, Search & View Controls ────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#e2e8e0] bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, tagline, mô tả hoặc UUID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#d6ded4] bg-[#fafcf9] py-2 pl-10 pr-4 text-xs text-[#182019] placeholder:text-gray-400 focus:border-[#8fbc8f] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-gray-400" />
              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-lg border border-[#d6ded4] bg-[#fafcf9] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Chỉ Active</option>
                <option value="inactive">Chỉ Inactive</option>
                <option value="deleted">Đã xóa (Deleted)</option>
              </select>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-3 md:border-t-0 md:pt-0">
            <span className="mr-2 text-[11px] text-gray-400">Hiển thị:</span>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-[#182019] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={15} />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === 'grid' ? 'bg-[#182019] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Lưới</span>
            </button>
          </div>
        </div>

        {/* ── Brand Listing: Table or Grid ─────────────────────────────────── */}
        {loading && brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5eae3] bg-white py-24 text-[#5e6b61]">
            <div className="mb-4 size-9 animate-spin rounded-full border-2 border-[#8fbc8f] border-t-transparent" />
            <p className="font-serif text-lg text-[#182019]">Đang tải dữ liệu thương hiệu...</p>
            <p className="mt-1 text-xs text-gray-400">Kết nối tới module Brand trên Backend</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d8e0d6] bg-white py-20 text-center">
            <Building2 className="mb-3 size-12 text-[#8fbc8f]" strokeWidth={1.2} />
            <h3 className="font-serif text-2xl text-[#182019]">Không tìm thấy thương hiệu nào</h3>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Không có kết quả nào phù hợp với bộ lọc tìm kiếm hiện tại.'
                : 'Hệ thống chưa có thương hiệu nào. Hãy bắt đầu bằng cách thêm thương hiệu đầu tiên.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 flex items-center gap-2 rounded-md bg-[#182019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#2b392d]"
            >
              <Plus size={15} /> Tạo thương hiệu mới
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ── Table View ─────────────────────────────────────────────────── */
          <div className="overflow-hidden rounded-xl border border-[#e2e8e0] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#182019]">
                <thead className="border-b border-[#e6ece4] bg-[#f7f9f6] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#556457]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Thương hiệu / Logo
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Khẩu hiệu (Tagline)
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Mô tả
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Thời gian
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ec]">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="transition-colors hover:bg-[#fafcf9]">
                      {/* Name & Logo */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[#e1e6df] bg-[#f2f5f1]">
                            {brand.image ? (
                              <img
                                src={brand.image}
                                alt={brand.name}
                                className="size-full object-cover"
                                onError={(e) => {
                                  // Fallback to building icon on error
                                  ;(e.target as HTMLElement).style.display = 'none'
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center text-xs font-serif font-bold text-[#6b7b6c]">
                              {brand.name.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <span className="font-serif text-sm font-medium text-[#182019]">{brand.name}</span>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span className="font-mono text-[10px] text-gray-400">
                                {brand.id.slice(0, 8)}...{brand.id.slice(-4)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(brand.id)}
                                title="Sao chép UUID"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {copiedId === brand.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tagline */}
                      <td className="px-5 py-4">
                        <span className="text-xs italic text-[#59655b]">{brand.tagLine || '—'}</span>
                      </td>

                      {/* Description */}
                      <td className="max-w-xs px-5 py-4">
                        <p className="line-clamp-2 text-xs text-gray-600">{brand.description || 'Chưa có mô tả'}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={brand.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-[11px] text-gray-500">
                        {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetailModal(brand)}
                            title="Xem chi tiết"
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(brand)}
                            title="Chỉnh sửa"
                            className="rounded-md p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(brand)}
                            title="Xóa"
                            className="rounded-md p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Grid View ──────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e2e8e0] bg-white p-5 shadow-xs transition hover:border-[#8fbc8f] hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#e0e7de] bg-[#f4f7f3]">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 -z-10 flex items-center justify-center font-serif text-base font-bold text-[#5c6e5e]">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <StatusBadge status={brand.status} />
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-medium tracking-tight text-[#182019]">{brand.name}</h3>

                  {brand.tagLine && (
                    <p className="mt-1 text-xs italic text-[#637365]">{brand.tagLine}</p>
                  )}

                  <p className="mt-2 line-clamp-3 text-xs text-gray-600">
                    {brand.description || 'Không có phần giới thiệu chi tiết cho thương hiệu này.'}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#edf2ec] pt-4">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-gray-400">
                    <span>UUID:</span>
                    <button
                      onClick={() => copyToClipboard(brand.id)}
                      className="font-mono text-gray-500 hover:text-gray-800"
                    >
                      {brand.id.slice(0, 8)}...
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openDetailModal(brand)}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                    <button
                      onClick={() => openEditModal(brand)}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                    >
                      <Pencil size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => openDeleteModal(brand)}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination Controls ───────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#e2e7e0] pt-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-[#5e6b61]">
            <span>Hiển thị</span>
            <select
              aria-label="Số thương hiệu mỗi trang"
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value)
                setLimit(newLimit)
                setPage(1)
              }}
              className="rounded-md border border-[#d6ded4] bg-white px-2 py-1 text-xs text-[#182019] focus:outline-none"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
            <span>thương hiệu ({filteredBrands.length} hiển thị)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-md border border-[#d6ded4] bg-white px-3 py-1.5 text-xs text-[#182019] transition hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <span className="px-3 text-xs font-medium text-[#182019]">Trang {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={brands.length < limit}
              className="flex items-center gap-1 rounded-md border border-[#d6ded4] bg-white px-3 py-1.5 text-xs text-[#182019] transition hover:bg-gray-50 disabled:opacity-40"
            >
              Tiếp <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* ── Modal: Create Brand ───────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#8fbc8f]" size={20} />
                <h3 className="font-serif text-xl font-medium text-[#182019]">Tạo Thương Hiệu Mới</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor={formNameId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Tên thương hiệu <span className="text-rose-500">*</span>
                </label>
                <input
                  id={formNameId}
                  type="text"
                  placeholder="Ví dụ: Dior, Chanel, Saint Laurent..."
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (formErrors.name) setFormErrors({})
                  }}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs text-[#182019] focus:outline-none focus:ring-1 ${
                    formErrors.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-[#d6ded4] focus:border-[#8fbc8f] focus:ring-[#8fbc8f]'
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-[11px] text-rose-500">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor={formTaglineId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Khẩu hiệu / Slogan (Tagline)
                </label>
                <input
                  id={formTaglineId}
                  type="text"
                  placeholder="Ví dụ: Quiet luxury, made for every moment"
                  value={formData.tagLine}
                  onChange={(e) => setFormData({ ...formData, tagLine: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                />
              </div>

              <div>
                <label htmlFor={formImageId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Đường dẫn ảnh Logo / Đại diện (Image URL)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id={formImageId}
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                  />
                  {formData.image && (
                    <div className="size-8 shrink-0 overflow-hidden rounded border border-gray-200">
                      <img src={formData.image} alt="preview" className="size-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={formDescriptionId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Mô tả thương hiệu (Description)
                </label>
                <textarea
                  id={formDescriptionId}
                  rows={3}
                  placeholder="Lịch sử, phong cách và định hướng sáng tạo của thương hiệu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#182019] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#2b392d] disabled:opacity-50"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  Lưu thương hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Brand ─────────────────────────────────────────────── */}
      {isEditOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="text-[#8fbc8f]" size={18} />
                <h3 className="font-serif text-xl font-medium text-[#182019]">Chỉnh Sửa Thương Hiệu</h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Tên thương hiệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (formErrors.name) setFormErrors({})
                  }}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs text-[#182019] focus:outline-none focus:ring-1 ${
                    formErrors.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-[#d6ded4] focus:border-[#8fbc8f] focus:ring-[#8fbc8f]'
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-[11px] text-rose-500">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Khẩu hiệu / Slogan (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.tagLine}
                  onChange={(e) => setFormData({ ...formData, tagLine: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Đường dẫn ảnh Logo / Đại diện (Image URL)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                  />
                  {formData.image && (
                    <div className="size-8 shrink-0 overflow-hidden rounded border border-gray-200">
                      <img src={formData.image} alt="preview" className="size-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Mô tả thương hiệu (Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d6ded4] px-3 py-2 text-xs text-[#182019] focus:border-[#8fbc8f] focus:outline-none focus:ring-1 focus:ring-[#8fbc8f]"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#182019] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#2b392d] disabled:opacity-50"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Detail Brand ───────────────────────────────────────────── */}
      {isDetailOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="text-[#8fbc8f]" size={18} />
                <h3 className="font-serif text-xl font-medium text-[#182019]">Chi Tiết Thương Hiệu</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Image banner or fallback */}
              <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#f0f4ef]">
                {selectedBrand.image ? (
                  <img
                    src={selectedBrand.image}
                    alt={selectedBrand.name}
                    className="size-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={36} strokeWidth={1.5} />
                  <span className="mt-1 text-xs">Không có ảnh minh họa</span>
                </div>
              </div>

              {/* Information List */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Tên thương hiệu
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-2xl font-medium text-[#182019]">{selectedBrand.name}</p>
                    <StatusBadge status={selectedBrand.status} />
                  </div>
                </div>

                {selectedBrand.tagLine && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Khẩu hiệu (Tagline)
                    </span>
                    <p className="italic text-[#526354]">{selectedBrand.tagLine}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    UUID Định danh
                  </span>
                  <div className="mt-1 flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-gray-700">
                    <span className="truncate">{selectedBrand.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedBrand.id)}
                      className="ml-2 text-gray-400 hover:text-gray-700"
                    >
                      {copiedId === selectedBrand.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Mô tả chi tiết
                  </span>
                  <p className="mt-1 leading-relaxed text-gray-700">
                    {selectedBrand.description || 'Chưa có thông tin mô tả chi tiết cho thương hiệu này.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
                  <div>
                    <span className="block text-gray-400">Ngày tạo:</span>
                    <span>
                      {selectedBrand.createdAt ? new Date(selectedBrand.createdAt).toLocaleString('vi-VN') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Cập nhật lần cuối:</span>
                    <span>
                      {selectedBrand.updatedAt ? new Date(selectedBrand.updatedAt).toLocaleString('vi-VN') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons in Detail Modal */}
              <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setIsDetailOpen(false)
                    openEditModal(selectedBrand)
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={14} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="rounded-lg bg-[#182019] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#2b392d]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Confirmation ────────────────────────────────────── */}
      {isDeleteOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-rose-600">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 size={20} />
              </div>
              <h3 className="font-serif text-xl font-medium text-gray-900">Xác Nhận Xóa Thương Hiệu</h3>
            </div>

            <p className="text-xs leading-relaxed text-gray-600">
              Bạn có chắc chắn muốn xóa thương hiệu{' '}
              <strong className="text-gray-900 font-semibold">{selectedBrand.name}</strong>? Thao tác này sẽ cập nhật
              trạng thái của thương hiệu thành <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded">deleted</code>{' '}
              trên cơ sở dữ liệu.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {submitting && <RefreshCw size={14} className="animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ───────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-xs shadow-lg transition-all ${
              toast.type === 'success'
                ? 'bg-[#182019] text-white'
                : toast.type === 'error'
                  ? 'bg-rose-700 text-white'
                  : 'bg-gray-800 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check size={16} className="text-[#8fbc8f]" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-300" />
            ) : (
              <Building2 size={16} className="text-gray-300" />
            )}
            <span>{toast.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 text-white/60 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

