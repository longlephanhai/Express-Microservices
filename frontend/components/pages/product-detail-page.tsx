import Storefront from '@/components/storefront'

export default function ProductDetailPage({ productId }: { productId?: string }) {
  return <Storefront initialView="detail" initialProductId={productId} />
}
