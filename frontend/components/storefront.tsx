'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Heart,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of one product item returned by the API (id is UUID string) */
type ApiProduct = {
  id: string
  name: string
  gender: string
  price: number | string
  salePrice: number | string
  colors?: string | null
  quantity: number
  brandId?: string | null
  categoryId?: string | null
  images?: string[] | string | null
  image?: string | null
  description?: string | null
  content?: string | null
  rating?: number
  saleCount?: number
  status: string
}

/** Internal Product type used throughout the UI */
type Product = {
  id: string
  brand: string
  name: string
  category: string
  categoryId?: string
  price: number
  salePrice?: number
  image: string
  color: string
  description: string
}

export type CategoryItem = {
  id: string
  name: string
  image?: string | null
  description?: string | null
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85'

// Format currency display (VND if amount >= 1000, otherwise USD)
function formatPrice(amount: number = 0): string {
  if (amount >= 1000) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return `$${amount.toFixed(2)}`
}

/** Map API response to internal Product with backend categories & brands */
function mapApiProduct(
  item: ApiProduct,
  index: number,
  categoryMap?: Record<string, string>,
  brandMap?: Record<string, string>
): Product {
  // Prefer real images from backend database
  let img = FALLBACK_IMAGE
  if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string' && item.images[0].trim().length > 0) {
    img = item.images[0]
  } else if (typeof item.images === 'string' && item.images.startsWith('http')) {
    img = item.images
  } else if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
    img = item.image
  }

  const brandName = (item.brandId && brandMap?.[item.brandId]) ? brandMap[item.brandId] : 'LUMORA'
  const categoryName = (item.categoryId && categoryMap?.[item.categoryId]) ? categoryMap[item.categoryId] : ''

  return {
    id: item.id,
    name: item.name,
    brand: brandName,
    category: categoryName,
    categoryId: item.categoryId ?? undefined,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    salePrice: item.salePrice ? (typeof item.salePrice === 'string' ? parseFloat(item.salePrice) : item.salePrice) : undefined,
    image: img,
    color: item.colors ?? '',
    description: item.description ?? item.content ?? '',
  }
}

// ─── API config ───────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

type Cart = Record<string, number>

export type StoreView = 'home' | 'products' | 'login' | 'register' | 'cart' | 'payment' | 'detail' | 'orders'

export default function Storefront({ initialView = 'home' }: { initialView?: StoreView }) {
  const [view, setView] = useState<StoreView>(initialView)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({})
  const [brandsMap, setBrandsMap] = useState<Record<string, string>>({})

  const [selected, setSelected] = useState<Product | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [redirectAfterAuth, setRedirectAfterAuth] = useState<StoreView | null>(null)

  const { user, isAuthenticated, logout } = useAuth()
  const { cart, count, toastMessage, showToast, addToCart, changeQuantity } = useCart()

  const handleFavorite = (product: Product) => {
    if (!isAuthenticated) {
      setRedirectAfterAuth(view)
      go('login')
    } else {
      addToCart(product.id, 1)
    }
  }

  // ── API state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    // Load categories, brands, and products in parallel from backend APIs
    Promise.all([
      fetch(`${API_BASE_URL}/v1/categories?page=1&limit=100`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .catch(() => ({ data: [] })),
      fetch(`${API_BASE_URL}/v1/brands?page=1&limit=100`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .catch(() => ({ data: [] })),
      fetch(`${API_BASE_URL}/v1/products?page=1&limit=50`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        }),
    ])
      .then(([catJson, brandJson, prodJson]) => {
        const catList: CategoryItem[] = catJson.data ?? []
        const brandList: { id: string; name: string }[] = brandJson.data ?? []

        const catMap: Record<string, string> = {}
        catList.forEach((c) => {
          catMap[c.id] = c.name
        })

        const bMap: Record<string, string> = {}
        brandList.forEach((b) => {
          bMap[b.id] = b.name
        })

        setCategories(catList)
        setCategoriesMap(catMap)
        setBrandsMap(bMap)

        const rawProducts: ApiProduct[] = prodJson.data ?? []
        const mapped = rawProducts.map((p, idx) => mapApiProduct(p, idx, catMap, bMap))
        setProducts(mapped)

        // Auto-select first product for detail view
        if (mapped.length > 0 && !selected) setSelected(mapped[0])
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = activeCategoryId === 'all'
    ? products
    : products.filter((p) => p.categoryId === activeCategoryId || p.category === activeCategoryId)
  const cartItems = useMemo(
    () => products.filter((p) => Boolean(cart[p.id])),
    [products, cart]
  )
  const [unselectedItemIds, setUnselectedItemIds] = useState<string[]>([])

  const toggleSelectItem = (id: string) => {
    setUnselectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const selectedCartItems = useMemo(
    () => cartItems.filter((p) => !unselectedItemIds.includes(p.id)),
    [cartItems, unselectedItemIds]
  )
  const selectedItemIds = useMemo(
    () => selectedCartItems.map((p) => p.id),
    [selectedCartItems]
  )

  const toggleSelectAll = () => {
    if (cartItems.length > 0 && selectedCartItems.length === cartItems.length) {
      // Currently all are selected -> unselect all
      setUnselectedItemIds(cartItems.map((p) => p.id))
    } else {
      // Some or all are unselected -> select all
      setUnselectedItemIds([])
    }
  }

  const clearSelection = () => {
    setUnselectedItemIds(cartItems.map((p) => p.id))
  }
  const totalSubtotal = useMemo(
    () => cartItems.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0),
    [cartItems, cart]
  )
  const selectedSubtotal = useMemo(
    () => selectedCartItems.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0),
    [selectedCartItems, cart]
  )

  const go = (next: typeof view) => { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const add = (id: string) => {
    if (!isAuthenticated) {
      setRedirectAfterAuth(view)
      go('login')
      return
    }
    addToCart(id)
  }
  const change = (id: string, delta: number) => changeQuantity(id, delta)

  // ── Loading / Error states ─────────────────────────────────────────────────
  const ProductsGrid = ({ items }: { items: Product[] }) => {
    if (loading) return (
      <div className="col-span-full flex flex-col items-center py-20 text-[#68736b]">
        <div className="mb-4 size-8 animate-spin rounded-full border-2 border-[#8fbc8f] border-t-transparent" />
        <p className="text-[11px] uppercase tracking-[.15em]">Loading collection…</p>
      </div>
    )
    if (error) return (
      <div className="col-span-full py-20 text-center">
        <p className="font-serif text-2xl text-[#182019]">Unable to load products.</p>
        <p className="mt-2 text-xs text-[#68736b]">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 border border-[#182019] px-6 py-3 text-[10px] uppercase tracking-[.16em]">Retry</button>
      </div>
    )
    if (items.length === 0) return (
      <div className="col-span-full py-20 text-center">
        <ShoppingBag className="mx-auto text-[#8fbc8f]" size={35} />
        <p className="mt-5 font-serif text-3xl">No products found.</p>
      </div>
    )
    return <>{items.map((p) => <ProductCard key={p.id} product={p} onOpen={() => { setSelected(p); go('detail') }} onAdd={() => add(p.id)} onFavorite={() => handleFavorite(p)} />)}</>
  }


  return <div className="min-h-screen bg-[#fdfcf9] text-[#182019]">
    <header className="sticky top-0 z-40 bg-[#111311] text-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <button aria-label="Open menu" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
        <button onClick={() => go('home')} className="font-serif text-2xl tracking-[.16em]">LUMORA<span className="block border-t border-white/40 pt-0.5 text-center font-sans text-[7px] tracking-[.45em]">BOUTIQUE</span></button>
        <nav className={`${menuOpen ? 'absolute left-0 top-[72px] flex' : 'hidden'} w-full flex-col gap-5 bg-[#111311] px-6 py-6 text-[11px] uppercase tracking-[.18em] lg:static lg:flex lg:w-auto lg:flex-row lg:bg-transparent lg:p-0`}>
          <button
            onClick={() => {
              setActiveCategoryId('all')
              go('products')
            }}
            className="text-left transition hover:text-[#8fbc8f]"
          >
            All Products
          </button>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryId(cat.id)
                go('products')
              }}
              className="text-left transition hover:text-[#8fbc8f]"
            >
              {cat.name}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => go('orders')}
              className="text-left transition hover:text-[#8fbc8f] lg:hidden flex items-center gap-2"
            >
              <PackageCheck size={14} className="text-[#8fbc8f]" />
              <span>Đơn hàng của tôi</span>
            </button>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="hidden sm:block"><Search size={19} strokeWidth={1.4} /></button>
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                aria-label="Account profile"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white transition hover:bg-white/20"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-[#8fbc8f] text-[10px] font-bold text-[#111311]">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] truncate text-[11px] font-medium hidden sm:inline">
                  {user.firstName}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-[#2e372e] bg-[#161a16] p-3 text-white shadow-2xl z-50">
                  <div className="border-b border-white/10 pb-2 mb-2">
                    <p className="font-semibold text-xs text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-[#8fbc8f]/20 text-[#8fbc8f]">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      go('orders')
                    }}
                    className="w-full flex items-center gap-2.5 rounded px-2 py-2 text-xs text-white hover:bg-white/10 text-left transition mb-1 cursor-pointer"
                  >
                    <PackageCheck size={14} className="text-[#8fbc8f]" />
                    <span>Đơn hàng của tôi</span>
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                      go('home')
                    }}
                    className="w-full flex items-center gap-2.5 rounded px-2 py-1.5 text-xs text-red-400 hover:bg-white/10 text-left transition cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              aria-label="Account"
              onClick={() => go('login')}
              className="flex items-center gap-1.5 text-white transition hover:text-[#8fbc8f]"
            >
              <UserRound size={19} strokeWidth={1.4} />
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Đăng nhập</span>
            </button>
          )}
          <button aria-label="Shopping bag" className="relative" onClick={() => go('cart')}>
            <ShoppingBag size={20} strokeWidth={1.4} />
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#8fbc8f] text-[9px] text-[#111311]">{count}</span>
          </button>
        </div>
      </div>
    </header>

    {view === 'home' && <>
      <section className="relative min-h-[600px] overflow-hidden bg-[#e9e0d6] lg:min-h-[670px]"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85" alt="LUMORA new collection editorial" className="absolute inset-0 size-full object-cover object-[62%_center]" /><div className="relative z-10 mx-auto flex min-h-[600px] max-w-[1440px] items-end px-6 pb-10 lg:min-h-[670px] lg:items-center lg:px-16 lg:pb-0"><div className="max-w-[430px] text-[#1d1e1a]"><p className="mb-5 text-[11px] uppercase tracking-[.25em] text-[#8f6f5d]">New collection</p><h1 className="font-serif text-[64px] leading-[.82] tracking-[-.05em] md:text-8xl">Dress<br />your<br /><em className="text-[#76584b]">moment.</em></h1><p className="mt-8 max-w-[220px] text-xs uppercase leading-5 tracking-[.1em]">Timeless pieces.<br />Made for you.</p><button onClick={() => go('products')} className="mt-7 flex items-center gap-10 bg-[#111311] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-white">Shop the edit <ArrowRight size={16} /></button></div></div></section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-center text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">The edit</p><h2 className="font-serif text-4xl tracking-[-.03em] md:text-5xl">Curated. Stylish. You.</h2></div><button onClick={() => go('products')} className="hidden items-center gap-4 border border-[#1d241f] px-4 py-2 text-[10px] uppercase tracking-[.12em] sm:flex">View all <ArrowRight size={14} /></button></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"><ProductsGrid items={products.slice(0, 4)} /></div></section>
      <section className="grid min-h-[400px] bg-[#151814] text-white lg:grid-cols-2"><div className="flex flex-col justify-center px-7 py-14 lg:px-16"><p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">The LUMORA woman</p><h2 className="mt-5 font-serif text-5xl leading-[.9] md:text-7xl">Your style.<br /><em className="text-[#8fbc8f]">Your story.</em></h2><p className="mt-6 max-w-[280px] text-sm text-white/65">Clothes that move with you. Confidence that stays with you.</p><button onClick={() => go('products')} className="mt-8 flex w-fit items-center gap-8 bg-[#8fbc8f] px-5 py-3 text-[10px] uppercase tracking-[.15em] text-[#111311]">Explore collection <ArrowRight size={15} /></button></div><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85" alt="Woman wearing LUMORA collection" className="min-h-[330px] w-full object-cover" /></section>
      <Benefits />
    </>}


    {view === 'products' && (
      <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14">
        <PageHeading eyebrow="The collection" title="Find your moment." />
        <div className="mb-9 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`shrink-0 rounded-full border px-5 py-2 text-[10px] uppercase tracking-[.14em] transition ${
              activeCategoryId === 'all'
                ? 'border-[#8fbc8f] bg-[#d8f3dc] font-semibold text-[#182019]'
                : 'border-[#d8ddd7] bg-white hover:border-[#8fbc8f]'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`shrink-0 rounded-full border px-5 py-2 text-[10px] uppercase tracking-[.14em] transition ${
                activeCategoryId === c.id
                  ? 'border-[#8fbc8f] bg-[#d8f3dc] font-semibold text-[#182019]'
                  : 'border-[#d8ddd7] bg-white hover:border-[#8fbc8f]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          <ProductsGrid items={filtered} />
        </div>
      </main>
    )}
    {view === 'detail' && selected && (
      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-10 lg:py-14">
        <button onClick={() => go('products')} className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[.15em]">
          <ArrowLeft size={15} /> Back to collection
        </button>
        <div className="grid gap-8 lg:grid-cols-2">
          <img src={selected.image} alt={selected.name} className="aspect-[4/5] w-full object-cover" />
          <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[.22em] text-[#8fbc8f]">{selected.brand}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[.16em] text-[#68736b]">{selected.category}</p>
            <h1 className="mt-3 font-serif text-5xl">{selected.name}</h1>
            <p className="mt-4 text-lg font-medium">{formatPrice(selected.price)}</p>
            <p className="mt-7 max-w-md text-sm leading-7 text-[#5e675f]">{selected.description}</p>
            <div className="mt-8 border-y border-[#dbe4dc] py-5 text-xs">
              <span className="text-[#68736b]">Color</span>
              <strong className="ml-10">{selected.color}</strong>
            </div>
            <button onClick={() => add(selected.id)} className="mt-7 flex w-full items-center justify-center gap-3 bg-[#8fbc8f] py-4 text-[11px] uppercase tracking-[.15em]">
              Add to bag <ShoppingBag size={16} />
            </button>
            <button onClick={() => go('cart')} className="mt-3 w-full border border-[#1d241f] py-4 text-[11px] uppercase tracking-[.15em]">
              View bag ({count})
            </button>
          </div>
        </div>
      </main>
    )}
    {view === 'cart' && (
      <CartView
        items={cartItems}
        cart={cart}
        subtotal={selectedSubtotal}
        totalSubtotal={totalSubtotal}
        selectedItemIds={selectedItemIds}
        onToggleItem={toggleSelectItem}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        change={change}
        go={go}
        isAuthenticated={isAuthenticated}
        onRequireLogin={() => {
          setRedirectAfterAuth('cart')
          go('login')
        }}
        onProceedToCheckout={() => {
          if (selectedCartItems.length === 0) {
            showToast('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
            return
          }
          if (!isAuthenticated) {
            setRedirectAfterAuth('payment')
            go('login')
          } else {
            go('payment')
          }
        }}
      />
    )}
    {view === 'payment' && (
      <PaymentView
        items={selectedCartItems.length > 0 ? selectedCartItems : cartItems}
        cart={cart}
        subtotal={selectedCartItems.length > 0 ? selectedSubtotal : totalSubtotal}
        go={go}
        onRequireLogin={() => {
          setRedirectAfterAuth('payment')
          go('login')
        }}
      />
    )}
    {view === 'orders' && (
      <OrdersView
        go={go}
        products={products}
        onRequireLogin={() => {
          setRedirectAfterAuth('orders')
          go('login')
        }}
        onReorder={(productId) => {
          add(productId)
          go('cart')
        }}
      />
    )}
    {(view === 'login' || view === 'register') && (
      <AuthView
        mode={view}
        go={go}
        redirectAfterAuth={redirectAfterAuth}
        onClearRedirect={() => setRedirectAfterAuth(null)}
      />
    )}
    {view !== 'login' && view !== 'register' && <footer className="border-t border-[#dce3dc] bg-white px-5 py-8 text-center text-[10px] uppercase tracking-[.16em] text-[#68736b]"><span className="font-serif text-xl tracking-[.16em] text-[#182019]">LUMORA</span><p className="mt-3">Quiet luxury, made for every moment.</p></footer>}

    {toastMessage && (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-[#8fbc8f]/40 bg-[#161a16] px-4 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <Check size={16} className="text-[#8fbc8f]" />
        <span className="text-xs font-medium">{toastMessage}</span>
      </div>
    )}
  </div>
}

function ProductCard({ product, onOpen, onAdd, onFavorite }: { product: Product; onOpen: () => void; onAdd: () => void; onFavorite?: () => void }) {
  return (
    <article className="group relative min-w-0">
      <div className="relative cursor-pointer overflow-hidden bg-[#eef2ed]" onClick={onOpen}>
        <img src={product.image} alt={product.name} className="aspect-[.78] w-full object-cover transition duration-500 group-hover:scale-105" />
        <button aria-label={`Add ${product.name} to bag`} onClick={(e) => { e.stopPropagation(); onAdd() }} className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#182019] shadow-sm"><ShoppingBag size={15} /></button>
        <button
          aria-label={`Favorite ${product.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onFavorite?.()
          }}
          className="absolute right-3 top-3 text-white hover:text-red-400 transition"
        >
          <Heart size={17} strokeWidth={1.5} />
        </button>
      </div>
      <div className="px-1 py-3">
        <p className="text-[9px] uppercase tracking-[.18em] text-[#8fbc8f]">{product.brand}</p>
        <h3 className="mt-1 truncate text-[11px] uppercase tracking-[.05em]">{product.name}</h3>
        <p className="mt-1 text-xs">{formatPrice(product.price)}</p>
        <button onClick={onOpen} className="mt-3 hidden w-full border border-[#aeb8af] py-2 text-[9px] uppercase tracking-[.12em] sm:block">Shop now <ArrowRight className="ml-2 inline" size={12} /></button>
      </div>
    </article>
  )
}
function Benefits() { return <div className="grid grid-cols-2 gap-5 border-t border-[#dce3dc] bg-white px-5 py-7 text-center text-[9px] uppercase tracking-[.12em] text-[#68736b] md:grid-cols-4"><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Secure payment</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Easy returns</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Free shipping</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>24/7 support</p></div></div> }
function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="mb-9"><p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">{eyebrow}</p><h1 className="mt-2 font-serif text-5xl tracking-[-.04em] md:text-6xl">{title}</h1></div> }

function CartView({
  items,
  cart,
  subtotal,
  totalSubtotal,
  selectedItemIds,
  onToggleItem,
  onToggleSelectAll,
  onClearSelection,
  change,
  go,
  onProceedToCheckout,
  isAuthenticated,
  onRequireLogin,
}: {
  items: Product[]
  cart: Cart
  subtotal: number
  totalSubtotal?: number
  selectedItemIds: string[]
  onToggleItem: (id: string) => void
  onToggleSelectAll: () => void
  onClearSelection: () => void
  change: (id: string, delta: number) => void
  go: (v: StoreView) => void
  onProceedToCheckout: () => void
  isAuthenticated?: boolean
  onRequireLogin?: () => void
}) {
  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length
  const selectedCount = selectedItemIds.length

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14">
      <PageHeading eyebrow="Your selection" title="Shopping bag." />
      {items.length ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            {/* Header select-all bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#dce3dc] bg-white p-4 rounded-sm shadow-xs">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="size-4 rounded border-[#aeb8af] text-[#2b4c30] accent-[#2b4c30] cursor-pointer"
                />
                <span className="text-xs font-semibold uppercase tracking-[.08em] text-[#182019]">
                  Chọn tất cả ({items.length} sản phẩm)
                </span>
              </label>
              <div className="flex items-center gap-3 text-xs text-[#68736b]">
                <span>
                  Đã chọn: <strong className="text-[#182019]">{selectedCount}</strong> / {items.length} món
                </span>
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={onClearSelection}
                    className="text-[11px] font-medium text-red-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
            </div>

            {/* List of items */}
            <div className="flex flex-col gap-4">
              {items.map((p) => {
                const isSelected = selectedItemIds.includes(p.id)
                return (
                  <div
                    key={p.id}
                    className={`flex items-start gap-3 sm:gap-4 border border-[#dce3dc] bg-white p-4 transition-all duration-200 rounded-sm ${
                      isSelected
                        ? 'ring-1 ring-[#8fbc8f]/60 shadow-xs'
                        : 'opacity-65 bg-[#fafbfa]'
                    }`}
                  >
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItem(p.id)}
                        aria-label={`Chọn sản phẩm ${p.name}`}
                        className="size-4 rounded border-[#aeb8af] text-[#2b4c30] accent-[#2b4c30] cursor-pointer"
                      />
                    </div>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-24 object-cover sm:size-32 rounded-xs shrink-0 cursor-pointer"
                      onClick={() => onToggleItem(p.id)}
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="cursor-pointer" onClick={() => onToggleItem(p.id)}>
                            <p className="text-[9px] uppercase tracking-[.16em] text-[#8fbc8f] font-semibold">{p.brand}</p>
                            <h3 className="mt-1 text-sm uppercase tracking-[.06em] font-medium text-[#182019] line-clamp-1">{p.name}</h3>
                            <p className="mt-1 text-xs text-[#68736b]">{p.color}</p>
                          </div>
                          <button
                            title="Xóa khỏi giỏ hàng"
                            aria-label="Xóa sản phẩm"
                            onClick={() => change(p.id, -1 * (cart[p.id] || 1))}
                            className="text-[#99a59b] hover:text-red-500 transition p-1.5 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-3 pt-2 border-t border-[#f0f3f0]">
                        <div className="flex items-center border border-[#dce3dc] bg-white">
                          <button aria-label="Giảm số lượng" onClick={() => change(p.id, -1)} className="p-2 hover:bg-black/5 transition cursor-pointer"><Minus size={13} /></button>
                          <span className="w-8 text-center text-xs font-medium">{cart[p.id]}</span>
                          <button aria-label="Tăng số lượng" onClick={() => change(p.id, 1)} className="p-2 hover:bg-black/5 transition cursor-pointer"><Plus size={13} /></button>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-[#68736b]">Đơn giá: {formatPrice(p.price)}</span>
                          <strong className="text-sm font-semibold text-[#182019]">{formatPrice(p.price * (cart[p.id] ?? 0))}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="h-fit bg-[#d8f3dc] p-6 rounded-sm border border-[#c6dfca]">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <div className="mt-5 flex justify-between text-xs text-[#35523a]">
              <span>Món đã chọn</span>
              <strong>{selectedCount} / {items.length} món</strong>
            </div>
            <div className="mt-3 flex justify-between border-b border-[#a8c9ad] pb-4 text-sm">
              <span>Subtotal (Tạm tính)</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="flex justify-between py-4 text-sm">
              <span>Shipping (Vận chuyển)</span>
              <span className="text-[#2b4c30] font-medium">Free</span>
            </div>
            <div className="flex justify-between border-t border-[#a8c9ad] pt-4 text-base">
              <strong>Total (Tổng thanh toán)</strong>
              <strong className="text-lg">{formatPrice(subtotal)}</strong>
            </div>

            {selectedCount === 0 && (
              <div className="mt-4 flex items-center gap-2 rounded bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
                <AlertCircle size={15} className="shrink-0 text-amber-600" />
                <span>Vui lòng chọn ít nhất 1 món để thanh toán</span>
              </div>
            )}

            <button
              disabled={selectedCount === 0}
              onClick={onProceedToCheckout}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-[#182019] py-4 text-[10px] uppercase tracking-[.17em] text-white hover:bg-[#2c382e] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <span>Tiến hành thanh toán ({selectedCount})</span>
              <ArrowRight size={14} />
            </button>
          </aside>
        </div>
      ) : (
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto text-[#8fbc8f]" size={35} />
          <p className="mt-5 font-serif text-3xl">Your bag is empty.</p>
          {!isAuthenticated ? (
            <div className="mt-5 flex flex-col items-center gap-3">
              <p className="text-xs text-[#68736b]">Bạn chưa đăng nhập. Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
              <button
                onClick={onRequireLogin || (() => go('login'))}
                className="mt-2 bg-[#182019] px-6 py-3 text-[10px] uppercase tracking-[.16em] text-white hover:bg-[#2c382e] transition cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <button onClick={() => go('products')} className="mt-6 border border-[#182019] px-6 py-3 text-[10px] uppercase tracking-[.16em] cursor-pointer">
              Explore collection
            </button>
          )}
        </div>
      )}
    </main>
  )
}

function PaymentView({ items, cart, subtotal, go, onRequireLogin }: { items: Product[]; cart: Cart; subtotal: number; go: (v: StoreView) => void; onRequireLogin: () => void }) {
  const { user, token, isAuthenticated } = useAuth()
  const { removeItems } = useCart()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
      setEmail(user.email || '')
      setAddress(user.address || '')
    }
  }, [user])

  // Login Check Guard
  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-16 text-center">
        <div className="rounded-2xl border border-[#dce3dc] bg-white p-10 shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#d8f3dc] text-[#182019]">
            <Lock size={26} className="text-[#2b4c30]" />
          </div>
          <p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f] font-semibold">Bảo mật thanh toán</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl text-[#182019]">Yêu cầu đăng nhập tài khoản</h1>
          <p className="mt-4 text-xs text-[#5e675f] leading-relaxed max-w-md mx-auto">
            Để bảo mật đơn hàng và theo dõi lộ trình vận chuyển, quý khách vui lòng đăng nhập trước khi tiến hành thanh toán.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onRequireLogin}
              className="flex w-full sm:w-auto items-center justify-center gap-2 bg-[#182019] px-7 py-3.5 text-[10px] uppercase tracking-[.18em] text-white hover:bg-[#2c382e] transition"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => go('cart')}
              className="w-full sm:w-auto border border-[#182019] px-6 py-3.5 text-[10px] uppercase tracking-[.18em] text-[#182019] hover:bg-black/5 transition"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Order Success Screen
  if (createdOrderId) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-16 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-white p-10 shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check size={32} />
          </div>
          <p className="text-[10px] uppercase tracking-[.25em] text-emerald-600 font-semibold">Đặt hàng thành công</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl text-[#182019]">Cảm ơn quý khách đã mua sắm!</h1>
          <p className="mt-4 text-xs text-[#5e675f] leading-relaxed max-w-md mx-auto">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống với mã đơn:
          </p>
          <div className="mt-3 inline-block rounded-lg bg-gray-50 border border-gray-200 px-4 py-2 font-mono text-sm font-semibold text-[#182019]">
            {createdOrderId}
          </div>
          <p className="mt-4 text-[11px] text-[#68736b]">
            Đơn hàng đã được đồng bộ với hệ thống Quản trị. Chúng tôi sẽ liên hệ để xác nhận sớm nhất.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => go('orders')}
              className="flex items-center gap-2 bg-[#182019] px-6 py-3.5 text-[10px] uppercase tracking-[.18em] text-white hover:bg-[#2c382e] transition cursor-pointer"
            >
              <PackageCheck size={14} className="text-[#8fbc8f]" />
              <span>Xem đơn hàng vừa đặt</span>
            </button>
            <button
              onClick={() => go('cart')}
              className="border border-[#182019] px-6 py-3.5 text-[10px] uppercase tracking-[.18em] text-[#182019] hover:bg-black/5 transition cursor-pointer"
            >
              Xem giỏ hàng
            </button>
            <button
              onClick={() => go('products')}
              className="border border-[#182019] px-6 py-3.5 text-[10px] uppercase tracking-[.18em] text-[#182019] hover:bg-black/5 transition cursor-pointer"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Empty selection screen guard
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-16 text-center">
        <div className="rounded-2xl border border-[#dce3dc] bg-white p-10 shadow-sm">
          <ShoppingBag className="mx-auto text-[#8fbc8f]" size={35} />
          <h1 className="mt-4 font-serif text-3xl text-[#182019]">Chưa có món hàng nào được chọn</h1>
          <p className="mt-3 text-xs text-[#68736b]">
            Quý khách chưa chọn món hàng nào từ giỏ hàng để tiến hành thanh toán.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => go('cart')}
              className="bg-[#182019] px-6 py-3.5 text-[10px] uppercase tracking-[.18em] text-white hover:bg-[#2c382e] transition cursor-pointer"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </main>
    )
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) {
      setOrderError('Vui lòng nhập địa chỉ giao hàng.')
      return
    }

    setSubmitting(true)
    setOrderError(null)

    try {
      const orderPayload = {
        shipping_address: address.trim(),
        shipping_city: city.trim() || 'Hanoi',
        recipient_first_name: user?.firstName || fullName.trim().split(' ')[0] || 'Customer',
        recipient_last_name: user?.lastName || fullName.trim().split(' ').slice(1).join(' ') || '',
        recipient_email: email.trim(),
        items: items.map((item) => ({
          product_id: item.id,
          quantity: Number(cart[item.id]) || 1,
          price: Number(item.price) || 0,
          name: (item.name || '').slice(0, 150),
          image: (item.image || '').slice(0, 200),
          attribute: (item.color && item.color.trim()) || 'default',
        })),
      }

      const res = await fetch(`${API_BASE_URL}/v1/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
      }

      const orderId = json.data?.id

      // Remove only the checked-out items from the cart
      await removeItems(items.map((it) => it.id))
      setCreatedOrderId(orderId || 'ORD-' + Date.now().toString(36).toUpperCase())
    } catch (err: any) {

      setOrderError(err.message || 'Lỗi khi gửi đơn hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14">
      <button
        type="button"
        onClick={() => go('cart')}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#68736b] hover:text-[#182019] transition cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Quay lại giỏ hàng</span>
      </button>
      <PageHeading eyebrow="Almost yours" title="Checkout." />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <form className="flex flex-col gap-5" onSubmit={handlePlaceOrder}>
          <h2 className="font-serif text-2xl">Delivery details</h2>

          {orderError && (
            <div className="flex items-start gap-2.5 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{orderError}</span>
            </div>
          )}

          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-label="Full name"
            placeholder="Full name"
            className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            placeholder="Email address"
            className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]"
          />
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Address"
            placeholder="Address"
            className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]"
          />
          <div className="grid grid-cols-2 gap-5">
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="City"
              placeholder="City"
              className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]"
            />
            <input
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              aria-label="Postal code"
              placeholder="Postal code"
              className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 flex items-center justify-center gap-2 bg-[#8fbc8f] py-4 text-[10px] uppercase tracking-[.17em] text-[#111311] font-semibold hover:bg-[#7ea87e] transition disabled:opacity-60 cursor-pointer"
          >
            {submitting && <Loader2 size={14} className="animate-spin text-[#111311]" />}
            <span>{submitting ? 'Đang tạo đơn hàng...' : 'Place order'}</span>
            {!submitting && <Check size={14} />}
          </button>
        </form>
        <aside className="h-fit bg-white p-5 ring-1 ring-[#dce3dc]">
          <div className="flex items-center justify-between border-b border-[#edf0ed] pb-3">
            <h2 className="font-serif text-2xl">Your order</h2>
            <span className="text-[11px] font-semibold text-[#3b6340] bg-[#d8f3dc] px-2 py-0.5 rounded-full">{items.length} món</span>
          </div>
          {items.map((p) => (
            <div key={p.id} className="mt-4 flex justify-between gap-4 border-b border-[#edf0ed] pb-3 text-xs">
              <span><strong className="block text-[9px] uppercase tracking-[.14em] text-[#8fbc8f]">{p.brand}</strong>{p.name} × {cart[p.id]}</span>
              <span>{formatPrice(p.price * (cart[p.id] ?? 0))}</span>
            </div>
          ))}
          <div className="mt-5 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}

type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'canceled'
  | 'refunded'

interface OrderRecord {
  id: string
  user_id: string
  shipping_address: string
  shipping_city?: string | null
  shipping_method?: string | null
  payment_method?: string | null
  payment_status: string
  recipient_first_name?: string | null
  recipient_last_name?: string | null
  recipient_phone?: string | null
  recipient_email?: string | null
  tracking_number?: string | null
  status: OrderStatusType
  total_price?: number
  items?: OrderItemDetail[]
  created_at?: string
  updated_at?: string
}


interface OrderItemDetail {
  id: string
  order_id: string
  product_id: string
  name?: string | null
  image?: string | null
  attribute?: string | null
  quantity: number
  price: number | string
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  pending: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200' },
  processing: { label: 'Đang xử lý', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  shipping: { label: 'Đang giao hàng', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  delivered: { label: 'Đã nhận hàng', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  completed: { label: 'Hoàn thành', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  canceled: { label: 'Đã hủy', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  refunded: { label: 'Đã hoàn tiền', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
}

function formatOrderDate(dateStr?: string | Date): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function OrdersView({
  go,
  products,
  onRequireLogin,
  onReorder,
}: {
  go: (v: StoreView) => void
  products: Product[]
  onRequireLogin: () => void
  onReorder: (productId: string) => void
}) {
  const { token, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItemDetail[]>>({})
  const [loadingItemsMap, setLoadingItemsMap] = useState<Record<string, boolean>>({})

  const productsMap = useMemo(() => {
    const map: Record<string, Product> = {}
    products.forEach((p) => {
      map[p.id] = p
    })
    return map
  }, [products])

  const fetchOrders = async (clearCache = false) => {
    if (!token) return
    setLoading(true)
    setError(null)
    if (clearCache) {
      setOrderItemsMap({})
    }
    try {
      const res = await fetch(`${API_BASE_URL}/v1/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const json = await res.json()
      const list: OrderRecord[] = json.data || []
      // Sắp xếp đơn mới nhất lên đầu
      list.sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0
        return tB - tA
      })
      setOrders(list)

      // Pre-fill items from orders if available
      const itemsMap: Record<string, OrderItemDetail[]> = {}
      for (const ord of list) {
        if (ord.items && Array.isArray(ord.items)) {
          itemsMap[ord.id] = ord.items
        }
      }
      setOrderItemsMap((prev) => ({ ...itemsMap, ...prev }))

      if (list.length > 0) {
        setExpandedOrderId(list[0].id)
        if (!itemsMap[list[0].id]) {
          loadOrderItems(list[0].id, clearCache)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  const loadOrderItems = async (orderId: string, force = false) => {
    if (!force && (orderItemsMap[orderId] || loadingItemsMap[orderId])) return

    setLoadingItemsMap((prev) => ({ ...prev, [orderId]: true }))
    try {
      const res = await fetch(`${API_BASE_URL}/v1/orders/${orderId}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const json = await res.json()
        setOrderItemsMap((prev) => ({ ...prev, [orderId]: json.data || [] }))
      }
    } catch (err) {
      console.warn(`[OrdersView] Failed to load items for order ${orderId}:`, err)
    } finally {
      setLoadingItemsMap((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const toggleExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
      loadOrderItems(orderId)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-[700px] px-5 py-16 text-center">
        <div className="rounded-2xl border border-[#dce3dc] bg-white p-10 shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#d8f3dc] text-[#182019]">
            <Lock size={26} className="text-[#2b4c30]" />
          </div>
          <p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f] font-semibold">Tra cứu đơn hàng</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl text-[#182019]">Yêu cầu đăng nhập</h1>
          <p className="mt-4 text-xs text-[#5e675f] leading-relaxed max-w-md mx-auto">
            Vui lòng đăng nhập tài khoản của bạn để xem và theo dõi lộ trình các đơn hàng đã đặt.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={onRequireLogin}
              className="flex items-center gap-2 bg-[#182019] px-7 py-3.5 text-[10px] uppercase tracking-[.18em] text-white hover:bg-[#2c382e] transition cursor-pointer"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    )
  }

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true
    if (activeTab === 'completed') return o.status === 'completed' || o.status === 'delivered'
    if (activeTab === 'processing') return o.status === 'processing' || o.status === 'confirmed'
    return o.status === activeTab
  })

  const TABS = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'pending', label: 'Chờ xác nhận', count: orders.filter((o) => o.status === 'pending').length },
    { id: 'processing', label: 'Đang chuẩn bị', count: orders.filter((o) => o.status === 'processing' || o.status === 'confirmed').length },
    { id: 'shipping', label: 'Đang giao', count: orders.filter((o) => o.status === 'shipping').length },
    { id: 'completed', label: 'Hoàn thành', count: orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length },
    { id: 'canceled', label: 'Đã hủy', count: orders.filter((o) => o.status === 'canceled').length },
  ]

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go('products')}
          className="inline-flex items-center gap-1.5 text-xs text-[#68736b] hover:text-[#182019] transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Tiếp tục mua sắm</span>
        </button>
        <button
          onClick={() => fetchOrders(true)}
          className="flex items-center gap-1.5 text-xs text-[#48634c] hover:text-[#182019] transition cursor-pointer"
          title="Tải lại đơn hàng"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <PageHeading eyebrow="Account history" title="My orders." />

      {/* Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 border-b border-[#e1e7e1]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] uppercase tracking-[.12em] transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#182019] text-white font-medium shadow-xs'
                  : 'bg-white text-[#68736b] border border-[#dce3dc] hover:border-[#8fbc8f] hover:text-[#182019]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#eef2ed] text-[#48544a]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-[#68736b]">
          <Loader2 size={32} className="animate-spin text-[#8fbc8f] mb-4" />
          <p className="text-xs uppercase tracking-[.16em]">Đang tải danh sách đơn hàng...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-red-600 mb-3" />
          <p className="font-serif text-xl text-red-900">Không thể tải đơn hàng</p>
          <p className="mt-1 text-xs text-red-700">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="mt-5 border border-red-800 bg-white px-6 py-2.5 text-[10px] uppercase tracking-[.16em] text-red-800 hover:bg-red-50 transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#dce3dc] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#d8f3dc]/60 text-[#35593b]">
            <Package size={28} />
          </div>
          <h2 className="font-serif text-2xl text-[#182019]">
            {orders.length === 0 ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng nào trong mục này'}
          </h2>
          <p className="mt-2 text-xs text-[#68736b] max-w-md mx-auto">
            {orders.length === 0
              ? 'Khi bạn đặt hàng, toàn bộ thông tin đơn hàng và lộ trình giao hàng sẽ hiển thị tại đây.'
              : 'Hãy thử chọn mục trạng thái khác hoặc quay lại kiểm tra sau.'}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => go('products')}
              className="bg-[#182019] px-7 py-3.5 text-[10px] uppercase tracking-[.18em] text-white hover:bg-[#2c382e] transition cursor-pointer"
            >
              Khám phá bộ sưu tập ngay
            </button>
          </div>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="flex flex-col gap-5">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id
            const items = orderItemsMap[order.id] || []
            const isLoadingItems = loadingItemsMap[order.id]
            const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
              label: order.status,
              badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
            }

            const calculatedTotal = items.reduce(
              (sum, it) => sum + Number(it.price) * it.quantity,
              0
            )

            const recipientName = [order.recipient_first_name, order.recipient_last_name]
              .filter(Boolean)
              .join(' ') || 'Quý khách'

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-md border border-[#dce3dc] bg-white shadow-xs transition hover:border-[#b8c7b8]"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] bg-[#fbfdfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-semibold tracking-wider text-[#182019]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-[#68736b] flex items-center gap-1">
                      <Calendar size={13} className="text-[#8fbc8f]" />
                      {formatOrderDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[.08em] ${statusConfig.badgeClass}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {statusConfig.label}
                    </span>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex items-center gap-1 border border-[#dce3dc] bg-white px-3 py-1.5 text-xs text-[#182019] hover:bg-[#f2f5f2] transition rounded-xs cursor-pointer"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Compact preview when collapsed */}
                {!isExpanded && (
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
                    <div className="flex items-center gap-2 text-[#68736b]">
                      <MapPin size={14} className="shrink-0 text-[#8fbc8f]" />
                      <span className="line-clamp-1 max-w-md">
                        {order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-[11px] font-medium text-[#2d5232] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye size={13} />
                      <span>Xem sản phẩm trong đơn</span>
                    </button>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-white animate-in fade-in duration-200">
                    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                      {/* Products in this order */}
                      <div>
                        <h3 className="font-serif text-lg text-[#182019] mb-3">Sản phẩm trong đơn</h3>

                        {isLoadingItems && (
                          <div className="flex items-center gap-2 py-6 text-xs text-[#68736b]">
                            <Loader2 size={16} className="animate-spin text-[#8fbc8f]" />
                            <span>Đang tải danh sách sản phẩm...</span>
                          </div>
                        )}

                        {!isLoadingItems && items.length === 0 && (
                          <div className="rounded border border-dashed border-[#dce3dc] bg-[#fafbfa] p-4 text-xs text-[#68736b]">
                            <p className="italic">Chưa có thông tin danh sách sản phẩm cho đơn hàng này.</p>
                            <button
                              type="button"
                              onClick={() => loadOrderItems(order.id, true)}
                              className="mt-2 inline-flex items-center gap-1 font-medium text-[#2d5232] underline hover:text-[#182019] cursor-pointer not-italic"
                            >
                              <RefreshCw size={12} />
                              <span>Thử tải lại sản phẩm</span>
                            </button>
                          </div>
                        )}

                        {!isLoadingItems && items.length > 0 && (
                          <div className="divide-y divide-[#edf0ed] border-y border-[#edf0ed]">
                            {items.map((it) => {
                              const prod = productsMap[it.product_id]
                              const itemImg = it.image || prod?.image || FALLBACK_IMAGE
                              const itemName = it.name || prod?.name || 'Sản phẩm LUMORA'
                              const itemBrand = prod?.brand || 'LUMORA'
                              const itemPrice = Number(it.price) || prod?.price || 0
                              const itemAttr = it.attribute && it.attribute !== 'default' ? it.attribute : prod?.color

                              return (
                                <div key={it.id} className="flex items-center justify-between gap-4 py-3.5">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={itemImg}
                                      alt={itemName}
                                      className="size-16 object-cover rounded-xs border border-[#dce3dc] shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-[9px] uppercase tracking-[.15em] text-[#8fbc8f] font-semibold">
                                        {itemBrand}
                                      </p>
                                      <h4 className="truncate text-xs font-medium text-[#182019]">
                                        {itemName}
                                      </h4>
                                      {itemAttr && (
                                        <p className="text-[11px] text-[#68736b]">{itemAttr}</p>
                                      )}
                                      <p className="text-[11px] text-[#68736b] mt-0.5">
                                        Số lượng: <strong className="text-[#182019]">{it.quantity}</strong> × {formatPrice(itemPrice)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <strong className="text-xs text-[#182019]">
                                      {formatPrice(itemPrice * it.quantity)}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => onReorder(it.product_id)}
                                      className="text-[10px] uppercase tracking-wider text-[#35593b] hover:underline cursor-pointer"
                                    >
                                      Mua lại
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Recipient and delivery summary */}
                      <div className="rounded-sm bg-[#f8faf8] border border-[#dce3dc] p-4 text-xs flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-base text-[#182019] mb-3 pb-2 border-b border-[#dce3dc]">
                            Thông tin nhận hàng
                          </h4>
                          <div className="space-y-2 text-[#465248]">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Người nhận</span>
                              <strong className="text-[#182019]">{recipientName}</strong>
                            </div>
                            {order.recipient_email && (
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Email</span>
                                <span>{order.recipient_email}</span>
                              </div>
                            )}
                            {order.recipient_phone && (
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Điện thoại</span>
                                <span>{order.recipient_phone}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Địa chỉ</span>
                              <span>
                                {order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Thanh toán</span>
                              <span className="capitalize">
                                {order.payment_method === 'cod' || !order.payment_method
                                  ? 'Thanh toán khi nhận hàng (COD)'
                                  : order.payment_method}
                              </span>
                            </div>
                            {order.tracking_number && (
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#68736b] block">Mã vận đơn</span>
                                <span className="font-mono text-[#2b4c30]">{order.tracking_number}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order total amount */}
                        <div className="mt-5 pt-3 border-t border-[#dce3dc]">
                          <div className="flex justify-between text-xs text-[#68736b] mb-1">
                            <span>Vận chuyển:</span>
                            <span className="text-[#2b4c30] font-medium">Miễn phí</span>
                          </div>
                          <div className="flex justify-between items-baseline text-sm">
                            <span className="font-semibold text-[#182019]">Tổng thanh toán:</span>
                            <strong className="font-serif text-lg text-[#182019]">
                              {formatPrice(calculatedTotal || order.total_price || 0)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

function AuthView({ mode, go, redirectAfterAuth, onClearRedirect }: { mode: 'login' | 'register'; go: (v: StoreView) => void; redirectAfterAuth?: StoreView | null; onClearRedirect?: () => void }) {
  const login = mode === 'login'
  const { login: doLogin, register: doRegister, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleFillDemo = () => {
    setEmail('admin@example.com')
    setPassword('Password123@')
    setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (login) {
      if (!email.trim() || !password) {
        setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.')
        return
      }
      setLoading(true)
      const res = await doLogin({ email: email.trim(), password })
      setLoading(false)
      if (res.success) {
        setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...')
        const target = redirectAfterAuth || 'products'
        onClearRedirect?.()
        setTimeout(() => go(target), 600)
      } else {
        setErrorMessage(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.')
      }
    } else {
      if (!firstName.trim() || firstName.trim().length < 2) {
        setErrorMessage('Họ phải chứa ít nhất 2 ký tự.')
        return
      }
      if (!lastName.trim() || lastName.trim().length < 2) {
        setErrorMessage('Tên phải chứa ít nhất 2 ký tự.')
        return
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Vui lòng nhập định dạng email hợp lệ.')
        return
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp.')
        return
      }

      setLoading(true)
      const res = await doRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      })
      setLoading(false)
      if (res.success) {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang đăng nhập...')
        const target = redirectAfterAuth || 'products'
        onClearRedirect?.()
        setTimeout(() => go(target), 700)
      } else {
        setErrorMessage(res.error || 'Đăng ký không thành công. Email có thể đã tồn tại.')
      }
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#d8f3dc] px-5 py-12">
      <div className="grid w-full max-w-[960px] overflow-hidden bg-white shadow-xl lg:grid-cols-2">
        {/* Left Column: Visual Brand Editorial */}
        <div className="relative hidden min-h-[580px] bg-[#182019] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="z-10">
            <span className="font-serif text-2xl tracking-[.18em]">LUMORA</span>
            <span className="block text-[8px] uppercase tracking-[.35em] text-[#8fbc8f] mt-1">Boutique</span>
          </div>
          <div className="z-10">
            <p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">Welcome to the circle</p>
            <h1 className="mt-4 font-serif text-6xl leading-[.95]">
              Wear your<br />
              <em className="text-[#8fbc8f]">story.</em>
            </h1>
            <p className="mt-6 max-w-[280px] text-xs text-white/70 leading-relaxed">
              Truy cập tủ đồ cá nhân, theo dõi trạng thái đơn hàng và trải nghiệm thời trang tinh tế mỗi ngày.
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8fbc8f_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Right Column: Form */}
        <div className="p-7 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => go('home')} className="font-serif text-2xl tracking-[.15em] text-[#182019]">
              LUMORA
            </button>
            <button
              onClick={() => go('home')}
              className="text-[10px] uppercase tracking-[.15em] text-[#68736b] hover:text-[#182019] transition"
            >
              Về trang chủ →
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-[.22em] text-[#8fbc8f] font-semibold">
            {login ? 'Welcome back' : 'Join the circle'}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#182019]">
            {login ? 'Sign in.' : 'Create account.'}
          </h1>
          <p className="mt-1 text-xs text-[#68736b]">
            {login ? 'Nhập thông tin tài khoản của bạn để tiếp tục' : 'Tạo tài khoản mới để bắt đầu trải nghiệm'}
          </p>

          {redirectAfterAuth === 'payment' && (
            <div className="mt-4 flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Lock size={15} className="shrink-0 text-amber-600" />
              <span>Vui lòng đăng nhập tài khoản để tiếp tục thanh toán đơn hàng của bạn.</span>
            </div>
          )}

          {redirectAfterAuth && redirectAfterAuth !== 'payment' && (
            <div className="mt-4 flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Lock size={15} className="shrink-0 text-amber-600" />
              <span>Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng và mua sắm.</span>
            </div>
          )}

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="mt-5 flex items-start gap-2.5 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-5 flex items-start gap-2.5 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <Check size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {!login && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#68736b] mb-1">Họ *</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nguyễn"
                    className="w-full border-b border-[#aeb8af] pb-2 text-sm outline-none focus:border-[#8fbc8f] bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#68736b] mb-1">Tên *</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Văn An"
                    className="w-full border-b border-[#aeb8af] pb-2 text-sm outline-none focus:border-[#8fbc8f] bg-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#68736b] mb-1">Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border-b border-[#aeb8af] pb-2 text-sm outline-none focus:border-[#8fbc8f] bg-transparent"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#68736b] mb-1">Mật khẩu *</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-[#aeb8af] pb-2 text-sm outline-none focus:border-[#8fbc8f] bg-transparent"
              />
            </div>

            {!login && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#68736b] mb-1">Xác nhận mật khẩu *</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-b border-[#aeb8af] pb-2 text-sm outline-none focus:border-[#8fbc8f] bg-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 bg-[#182019] py-3.5 text-[10px] uppercase tracking-[.18em] text-white transition hover:bg-[#283229] disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin text-[#8fbc8f]" />}
              <span>{loading ? 'Đang xử lý...' : (login ? 'Đăng nhập' : 'Tạo tài khoản')}</span>
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          {login && (
            <div className="mt-5 pt-4 border-t border-dashed border-[#dce3dc]">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full flex items-center justify-center gap-2 rounded border border-[#8fbc8f]/60 bg-[#d8f3dc]/30 py-2.5 text-[10px] uppercase tracking-[.12em] text-[#244229] hover:bg-[#d8f3dc] transition"
              >
                <Sparkles size={13} className="text-[#48734e]" />
                <span>Điền tài khoản test có sẵn</span>
              </button>
              <p className="mt-1.5 text-center text-[10px] text-[#68736b]">
                (admin@example.com / Password123@)
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-[#68736b]">
            {login ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            {' '}
            <button
              onClick={() => {
                setErrorMessage(null)
                setSuccessMessage(null)
                go(login ? 'register' : 'login')
              }}
              className="font-semibold text-[#3b6340] underline hover:text-[#182019] transition ml-1"
            >
              {login ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
