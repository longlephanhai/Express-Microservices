import type { Metadata } from 'next'
import BrandManagement from '@/components/brands/brand-management'

export const metadata: Metadata = {
  title: 'Quản lý Thương hiệu (Brands) | LUMORA',
  description: 'Giao diện quản lý thương hiệu và đối tác thời trang trong hệ thống microservices.',
}

export default function BrandsPage() {
  return <BrandManagement />
}

