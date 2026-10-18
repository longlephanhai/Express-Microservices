'use client'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Heart, Menu, Minus, Plus, Search, ShoppingBag, UserRound, Trash2 } from 'lucide-react'

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
  price: number
  image: string
  color: string
  description: string
}

/** Kiểu dữ liệu một item giỏ hàng trả về từ Backend API */
type CartItemApi = {
  id: string // Cart item ID (dùng cho PATCH/DELETE)
  userId: string
  productId: string
  attribute?: string
  quantity: number
  createdAt: string
  updatedAt: string
}

// ─── Hard-coded images (kept exactly as original per requirements) ──────────
const HARD_CODED_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=85',
]

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85'

/** Map API response to internal Product, keeping hard-coded images */
function mapApiProduct(item: ApiProduct, index: number): Product {
  return {
    id: item.id,
    name: item.name,
    // brandId is a UUID — do not display raw UUID as brand name
    brand: 'LUMORA',
    // categoryId is a UUID — do not display raw UUID as category name
    category: '',
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    // Images remain hard-coded per project requirements
    image: HARD_CODED_IMAGES[index % HARD_CODED_IMAGES.length] ?? FALLBACK_IMAGE,
    color: item.colors ?? '',
    description: item.description ?? item.content ?? '',
  }
}

// ─── API config ───────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const CART_API_URL = process.env.NEXT_PUBLIC_CART_API_URL ?? API_BASE_URL


const categories = ['All', 'Clothing', 'Dresses', 'Shoes', 'Bags', 'Sets']

type Cart = Record<string, number>

export type StoreView = 'home' | 'products' | 'login' | 'register' | 'cart' | 'payment' | 'detail'

export default function Storefront({ initialView = 'home' }: { initialView?: StoreView }) {
  const [view, setView] = useState<StoreView>(initialView)
  const [activeCategory, setActiveCategory] = useState('All')

  // const [cart, setCart] = useState<Cart>({})
  const [selected, setSelected] = useState<Product | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // ── API state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Cart State từ Backend ──────────────────────────────────────────────────
  const [cartItemsApi, setCartItemsApi] = useState<CartItemApi[]>([])
  const [cartLoading, setCartLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${API_BASE_URL}/v1/products?page=1&limit=20`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((json: { data: ApiProduct[] }) => {
        const mapped = (json.data ?? []).map(mapApiProduct)
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

  // Fetch danh sách giỏ hàng từ Backend khi người dùng mở trang giỏ hàng hoặc khởi tạo
  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setCartLoading(true)
    try {
      const res = await fetch(`${CART_API_URL}/v1/carts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Failed to fetch cart items')
      const json = await res.json()
      setCartItemsApi(json.data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setCartLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Thêm sản phẩm vào giỏ hàng (POST /carts)
  const addToCart = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please log in to add products to your cart!')
      go('login')
      return
    }

    try {
      const res = await fetch(`${CART_API_URL}/v1/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      if (!res.ok) throw new Error('Failed to add product to cart.')
      
      // Load lại giỏ hàng sau khi thêm thành công
      await fetchCart()
      alert('Product added to cart successfully!')
    } catch (err: any) {
      alert(err.message || 'Connection error. Please try again later.')
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng (PATCH /carts/:id)
  const updateCartQuantity = async (cartItemId: string, currentQty: number, delta: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    const newQty = currentQty + delta

    // Nếu số lượng mới nhỏ hơn 1 thì chặn lại, không cho giảm nữa
    if (newQty < 1) {
      return
    }

    try {
      const res = await fetch(`${CART_API_URL}/v1/carts/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQty })
      })

      if (!res.ok) throw new Error('Failed to update quantity.')
      await fetchCart()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Xóa trực tiếp một item khỏi giỏ hàng (DELETE /carts/:id)
  const removeCartItem = async (cartItemId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`${CART_API_URL}/v1/carts/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Failed to delete product from cart')
      await fetchCart()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Mapping dữ liệu giỏ hàng backend với thông tin sản phẩm hiển thị trên UI
  const detailedCartItems = cartItemsApi.map((ci) => {
    const productInfo = products.find((p) => p.id === ci.productId)
    return {
      cartItemId: ci.id,
      productId: ci.productId,
      quantity: ci.quantity,
      product: productInfo ?? {
        id: ci.productId,
        brand: 'LUMORA',
        name: 'Sản phẩm',
        category: '',
        price: 0,
        image: FALLBACK_IMAGE,
        color: '',
        description: ''
      }
    }
  })

  // const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)
  // const cartItems = products.filter((p) => cart[p.id])
  // const count = Object.values(cart).reduce((a, b) => a + b, 0)
  // const subtotal = cartItems.reduce((sum, p) => sum + p.price * (cart[p.id] ?? 0), 0)

  // const go = (next: typeof view) => { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  // const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
  // const change = (id: string, delta: number) => setCart((c) => { const next = Math.max(0, (c[id] || 0) + delta); const copy = { ...c }; if (next) copy[id] = next; else delete copy[id]; return copy })

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)
  
  // Tính tổng số lượng hiển thị lên badge icon giỏ hàng ở header
  const totalCount = cartItemsApi.reduce((sum, item) => sum + item.quantity, 0)
  // Tính tổng tiền subtotal dựa trên dữ liệu backend trả về
  const subtotal = detailedCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const go = (next: typeof view) => { 
    setView(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (next === 'cart') {
      fetchCart() // Đồng bộ lại giỏ hàng khi người dùng chuyển sang trang cart
    }
  }

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
    return <>{items.map((p) => <ProductCard key={p.id} product={p} onOpen={() => { setSelected(p); go('detail') }} onAdd={() => addToCart(p.id)} />)}</>
  }


  return <div className="min-h-screen bg-[#fdfcf9] text-[#182019]">
    <header className="sticky top-0 z-40 bg-[#111311] text-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <button aria-label="Open menu" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
        <button onClick={() => go('home')} className="font-serif text-2xl tracking-[.16em]">LUMORA<span className="block border-t border-white/40 pt-0.5 text-center font-sans text-[7px] tracking-[.45em]">BOUTIQUE</span></button>
        <nav className={`${menuOpen ? 'absolute left-0 top-[72px] flex' : 'hidden'} w-full flex-col gap-5 bg-[#111311] px-6 py-6 text-[11px] uppercase tracking-[.18em] lg:static lg:flex lg:w-auto lg:flex-row lg:bg-transparent lg:p-0`}>
          {['New In', 'Clothing', 'Dresses', 'Sets', 'Accessories'].map((label) => <button key={label} onClick={() => go('products')} className="text-left transition hover:text-[#8fbc8f]">{label}</button>)}
          <button onClick={() => go('products')} className="text-left text-[#8fbc8f]">Sale</button>
        </nav>
        <div className="flex items-center gap-4"><button aria-label="Search" className="hidden sm:block"><Search size={19} strokeWidth={1.4} /></button><button aria-label="Account" onClick={() => go('login')}><UserRound size={19} strokeWidth={1.4} /></button><button aria-label="Shopping bag" className="relative" onClick={() => go('cart')}><ShoppingBag size={20} strokeWidth={1.4} /><span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#8fbc8f] text-[9px] text-[#111311]">{totalCount}</span></button></div>
      </div>
    </header>

    {view === 'home' && <>
      <section className="relative min-h-[600px] overflow-hidden bg-[#e9e0d6] lg:min-h-[670px]"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85" alt="LUMORA new collection editorial" className="absolute inset-0 size-full object-cover object-[62%_center]" /><div className="relative z-10 mx-auto flex min-h-[600px] max-w-[1440px] items-end px-6 pb-10 lg:min-h-[670px] lg:items-center lg:px-16 lg:pb-0"><div className="max-w-[430px] text-[#1d1e1a]"><p className="mb-5 text-[11px] uppercase tracking-[.25em] text-[#8f6f5d]">New collection</p><h1 className="font-serif text-[64px] leading-[.82] tracking-[-.05em] md:text-8xl">Dress<br />your<br /><em className="text-[#76584b]">moment.</em></h1><p className="mt-8 max-w-[220px] text-xs uppercase leading-5 tracking-[.1em]">Timeless pieces.<br />Made for you.</p><button onClick={() => go('products')} className="mt-7 flex items-center gap-10 bg-[#111311] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-white">Shop the edit <ArrowRight size={16} /></button></div></div></section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-center text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">The edit</p><h2 className="font-serif text-4xl tracking-[-.03em] md:text-5xl">Curated. Stylish. You.</h2></div><button onClick={() => go('products')} className="hidden items-center gap-4 border border-[#1d241f] px-4 py-2 text-[10px] uppercase tracking-[.12em] sm:flex">View all <ArrowRight size={14} /></button></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"><ProductsGrid items={products.slice(0, 4)} /></div></section>
      <section className="grid min-h-[400px] bg-[#151814] text-white lg:grid-cols-2"><div className="flex flex-col justify-center px-7 py-14 lg:px-16"><p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">The LUMORA woman</p><h2 className="mt-5 font-serif text-5xl leading-[.9] md:text-7xl">Your style.<br /><em className="text-[#8fbc8f]">Your story.</em></h2><p className="mt-6 max-w-[280px] text-sm text-white/65">Clothes that move with you. Confidence that stays with you.</p><button onClick={() => go('products')} className="mt-8 flex w-fit items-center gap-8 bg-[#8fbc8f] px-5 py-3 text-[10px] uppercase tracking-[.15em] text-[#111311]">Explore collection <ArrowRight size={15} /></button></div><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85" alt="Woman wearing LUMORA collection" className="min-h-[330px] w-full object-cover" /></section>
      <Benefits />
    </>}


    {view === 'products' && <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14"><PageHeading eyebrow="The collection" title="Find your moment." /><div className="mb-9 flex gap-2 overflow-x-auto pb-2">{categories.map((c) => <button key={c} onClick={() => setActiveCategory(c)} className={`shrink-0 rounded-full border px-5 py-2 text-[10px] uppercase tracking-[.14em] transition ${activeCategory === c ? 'border-[#8fbc8f] bg-[#d8f3dc]' : 'border-[#d8ddd7] bg-white'}`}>{c}</button>)}</div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5"><ProductsGrid items={filtered} /></div></main>}
    {view === 'detail' && selected && <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-10 lg:py-14"><button onClick={() => go('products')} className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[.15em]"><ArrowLeft size={15} /> Back to collection</button><div className="grid gap-8 lg:grid-cols-2"><img src={selected.image} alt={selected.name} className="aspect-[4/5] w-full object-cover" /><div className="flex flex-col justify-center"><p className="text-[10px] uppercase tracking-[.22em] text-[#8fbc8f]">{selected.brand}</p><p className="mt-2 text-[10px] uppercase tracking-[.16em] text-[#68736b]">{selected.category}</p><h1 className="mt-3 font-serif text-5xl">{selected.name}</h1><p className="mt-4 text-lg">${selected.price.toFixed(2)}</p><p className="mt-7 max-w-md text-sm leading-7 text-[#5e675f]">{selected.description}</p><div className="mt-8 border-y border-[#dbe4dc] py-5 text-xs"><span className="text-[#68736b]">Color</span><strong className="ml-10">{selected.color}</strong></div><button onClick={() => addToCart(selected.id)} className="mt-7 flex w-full items-center justify-center gap-3 bg-[#8fbc8f] py-4 text-[11px] uppercase tracking-[.15em]">Add to bag <ShoppingBag size={16} /></button><button onClick={() => go('cart')} className="mt-3 w-full border border-[#1d241f] py-4 text-[11px] uppercase tracking-[.15em]">View bag ({totalCount})</button></div></div></main>}
    {/* {view === 'cart' && <CartView items={cartItems} cart={cart} subtotal={subtotal} change={change} go={go} />}
    {view === 'payment' && <PaymentView items={cartItems} cart={cart} subtotal={subtotal} go={go} />} */}
    {view === 'cart' && <CartView detailedItems={detailedCartItems} subtotal={subtotal} onUpdateQty={updateCartQuantity} onDeleteItem={removeCartItem} loading={cartLoading} go={go} />}
    {view === 'payment' && <PaymentView detailedItems={detailedCartItems} subtotal={subtotal} go={go} />}
    {(view === 'login' || view === 'register') && <AuthView mode={view} go={go} />}
    {view !== 'login' && view !== 'register' && <footer className="border-t border-[#dce3dc] bg-white px-5 py-8 text-center text-[10px] uppercase tracking-[.16em] text-[#68736b]"><span className="font-serif text-xl tracking-[.16em] text-[#182019]">LUMORA</span><p className="mt-3">Quiet luxury, made for every moment.</p></footer>}
  </div>
}

function ProductCard({ product, onOpen, onAdd }: { product: Product; onOpen: () => void; onAdd: () => void }) { return <article className="group relative min-w-0"><div className="relative cursor-pointer overflow-hidden bg-[#eef2ed]" onClick={onOpen}><img src={product.image} alt={product.name} className="aspect-[.78] w-full object-cover transition duration-500 group-hover:scale-105" /><button aria-label={`Add ${product.name} to bag`} onClick={(e) => { e.stopPropagation(); onAdd() }} className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#182019] shadow-sm"><ShoppingBag size={15} /></button><button aria-label={`Favorite ${product.name}`} className="absolute right-3 top-3 text-white"><Heart size={17} strokeWidth={1.5} /></button></div><div className="px-1 py-3"><p className="text-[9px] uppercase tracking-[.18em] text-[#8fbc8f]">{product.brand}</p><h3 className="mt-1 truncate text-[11px] uppercase tracking-[.05em]">{product.name}</h3><p className="mt-1 text-xs">${product.price.toFixed(2)}</p><button onClick={onOpen} className="mt-3 hidden w-full border border-[#aeb8af] py-2 text-[9px] uppercase tracking-[.12em] sm:block">Shop now <ArrowRight className="ml-2 inline" size={12} /></button></div></article> }
function Benefits() { return <div className="grid grid-cols-2 gap-5 border-t border-[#dce3dc] bg-white px-5 py-7 text-center text-[9px] uppercase tracking-[.12em] text-[#68736b] md:grid-cols-4"><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Secure payment</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Easy returns</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>Free shipping</p></div><div><Check className="mx-auto mb-2 text-[#8fbc8f]" size={21} /><p>24/7 support</p></div></div> }
function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="mb-9"><p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">{eyebrow}</p><h1 className="mt-2 font-serif text-5xl tracking-[-.04em] md:text-6xl">{title}</h1></div> }

// function CartView({ items, cart, subtotal, change, go }: { items: Product[]; cart: Cart; subtotal: number; change: (id: string, delta: number) => void; go: (v: 'home' | 'products' | 'login' | 'register' | 'cart' | 'payment' | 'detail') => void }) { return <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14"><PageHeading eyebrow="Your selection" title="Shopping bag." />{items.length ? <div className="grid gap-10 lg:grid-cols-[1fr_360px]"><div className="flex flex-col gap-5">{items.map((p) => <div key={p.id} className="flex gap-4 border-b border-[#dce3dc] pb-5"><img src={p.image} alt={p.name} className="size-28 object-cover sm:size-36" /><div className="flex min-w-0 flex-1 flex-col justify-between"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#8fbc8f]">{p.brand}</p><h3 className="mt-1 text-sm uppercase tracking-[.06em]">{p.name}</h3><p className="mt-1 text-xs text-[#68736b]">{p.color}</p></div><div className="flex items-end justify-between"><div className="flex items-center border border-[#dce3dc]"><button aria-label="Decrease quantity" onClick={() => change(p.id, -1)} className="p-2"><Minus size={13} /></button><span className="w-7 text-center text-xs">{cart[p.id]}</span><button aria-label="Increase quantity" onClick={() => change(p.id, 1)} className="p-2"><Plus size={13} /></button></div><strong className="text-sm">${(p.price * (cart[p.id] ?? 0)).toFixed(2)}</strong></div></div></div>)}</div><aside className="h-fit bg-[#d8f3dc] p-6"><h2 className="font-serif text-2xl">Order summary</h2><div className="mt-6 flex justify-between border-b border-[#a8c9ad] pb-4 text-sm"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div className="flex justify-between py-4 text-sm"><span>Shipping</span><span>Free</span></div><div className="flex justify-between border-t border-[#a8c9ad] pt-4"><strong>Total</strong><strong>${subtotal.toFixed(2)}</strong></div><button onClick={() => go('payment')} className="mt-6 w-full bg-[#182019] py-4 text-[10px] uppercase tracking-[.17em] text-white">Proceed to checkout <ArrowRight className="ml-2 inline" size={14} /></button></aside></div> : <div className="py-20 text-center"><ShoppingBag className="mx-auto text-[#8fbc8f]" size={35} /><p className="mt-5 font-serif text-3xl">Your bag is empty.</p><button onClick={() => go('products')} className="mt-6 border border-[#182019] px-6 py-3 text-[10px] uppercase tracking-[.16em]">Explore collection</button></div>}</main> }
// function PaymentView({ items, cart, subtotal, go }: { items: Product[]; cart: Cart; subtotal: number; go: (v: 'home' | 'products' | 'login' | 'register' | 'cart' | 'payment' | 'detail') => void }) { return <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14"><PageHeading eyebrow="Almost yours" title="Checkout." /><div className="grid gap-10 lg:grid-cols-[1fr_380px]"><form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}><h2 className="font-serif text-2xl">Delivery details</h2><input required aria-label="Full name" placeholder="Full name" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" /><input required type="email" aria-label="Email address" placeholder="Email address" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" /><input required aria-label="Address" placeholder="Address" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" /><div className="grid grid-cols-2 gap-5"><input required aria-label="City" placeholder="City" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" /><input required aria-label="Postal code" placeholder="Postal code" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" /></div><button className="mt-4 bg-[#8fbc8f] py-4 text-[10px] uppercase tracking-[.17em]" onClick={() => alert('Thank you for your order!')}>Place order <Check className="ml-2 inline" size={14} /></button></form><aside className="h-fit bg-white p-5 ring-1 ring-[#dce3dc]"><h2 className="font-serif text-2xl">Your order</h2>{items.map((p) => <div key={p.id} className="mt-4 flex justify-between gap-4 border-b border-[#edf0ed] pb-3 text-xs"><span><strong className="block text-[9px] uppercase tracking-[.14em] text-[#8fbc8f]">{p.brand}</strong>{p.name} × {cart[p.id]}</span><span>${(p.price * (cart[p.id] ?? 0)).toFixed(2)}</span></div>)}<div className="mt-5 flex justify-between text-sm font-semibold"><span>Total</span><span>${subtotal.toFixed(2)}</span></div></aside></div></main> }
function CartView({ detailedItems, subtotal, onUpdateQty, onDeleteItem, loading, go }: { 
  detailedItems: Array<{ cartItemId: string; productId: string; quantity: number; product: Product }>; 
  subtotal: number; 
  onUpdateQty: (cartItemId: string, currentQty: number, delta: number) => Promise<void>; 
  onDeleteItem: (cartItemId: string) => Promise<void>;
  loading: boolean;
  go: (v: StoreView) => void 
}) { 
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14">
      <PageHeading eyebrow="Your selection" title="Shopping bag." />
      {loading ? (
        <div className="py-20 text-center text-xs uppercase tracking-[.15em] text-[#68736b]">Loading cart…</div>
      ) : detailedItems.length ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            {detailedItems.map(({ cartItemId, quantity, product }) => (
              <div key={cartItemId} className="flex gap-4 border-b border-[#dce3dc] pb-5">
                <img src={product.image} alt={product.name} className="size-28 object-cover sm:size-36" />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-[.16em] text-[#8fbc8f]">{product.brand}</p>
                      <button onClick={() => onDeleteItem(cartItemId)} className="text-[#68736b] hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                    <h3 className="mt-1 text-sm uppercase tracking-[.06em]">{product.name}</h3>
                    <p className="mt-1 text-xs text-[#68736b]">{product.color}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center border border-[#dce3dc]">
                      <button aria-label="Decrease quantity" onClick={() => onUpdateQty(cartItemId, quantity, -1)} className="p-2"><Minus size={13} /></button>
                      <span className="w-7 text-center text-xs">{quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => onUpdateQty(cartItemId, quantity, 1)} className="p-2"><Plus size={13} /></button>
                    </div>
                    <strong className="text-sm">${(product.price * quantity).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit bg-[#d8f3dc] p-6">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <div className="mt-6 flex justify-between border-b border-[#a8c9ad] pb-4 text-sm"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div className="flex justify-between py-4 text-sm"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between border-t border-[#a8c9ad] pt-4"><strong>Total</strong><strong>${subtotal.toFixed(2)}</strong></div>
            <button onClick={() => go('payment')} className="mt-6 w-full bg-[#182019] py-4 text-[10px] uppercase tracking-[.17em] text-white">Proceed to checkout <ArrowRight className="ml-2 inline" size={14} /></button>
          </aside>
        </div>
      ) : (
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto text-[#8fbc8f]" size={35} />
          <p className="mt-5 font-serif text-3xl">Your bag is empty.</p>
          <button onClick={() => go('products')} className="mt-6 border border-[#182019] px-6 py-3 text-[10px] uppercase tracking-[.16em]">Explore collection</button>
        </div>
      )}
    </main>
  )
}

function PaymentView({ detailedItems, subtotal, go }: { 
  detailedItems: Array<{ cartItemId: string; productId: string; quantity: number; product: Product }>; 
  subtotal: number; 
  go: (v: StoreView) => void 
}) { 
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-10 lg:py-14">
      <PageHeading eyebrow="Almost yours" title="Checkout." />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="font-serif text-2xl">Delivery details</h2>
          <input required aria-label="Full name" placeholder="Full name" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" />
          <input required type="email" aria-label="Email address" placeholder="Email address" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" />
          <input required aria-label="Address" placeholder="Address" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" />
          <div className="grid grid-cols-2 gap-5">
            <input required aria-label="City" placeholder="City" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" />
            <input required aria-label="Postal code" placeholder="Postal code" className="border-b border-[#aeb8af] bg-transparent px-1 py-4 text-sm outline-none focus:border-[#8fbc8f]" />
          </div>
          <button className="mt-4 bg-[#8fbc8f] py-4 text-[10px] uppercase tracking-[.17em]" onClick={() => alert('Thank you for your order!')}>
            Place order <Check className="ml-2 inline" size={14} />
          </button>
        </form>
        <aside className="h-fit bg-white p-5 ring-1 ring-[#dce3dc]">
          <h2 className="font-serif text-2xl">Your order</h2>
          {detailedItems.map(({ cartItemId, quantity, product }) => (
            <div key={cartItemId} className="mt-4 flex justify-between gap-4 border-b border-[#edf0ed] pb-3 text-xs">
              <span>
                <strong className="block text-[9px] uppercase tracking-[.14em] text-[#8fbc8f]">{product.brand}</strong>
                {product.name} × {quantity}
              </span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-5 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}
function AuthView({ mode, go }: { mode: 'login' | 'register'; go: (v: 'home' | 'products' | 'login' | 'register' | 'cart' | 'payment' | 'detail') => void }) { const login = mode === 'login'; return <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#d8f3dc] px-5 py-12"><div className="grid w-full max-w-[920px] overflow-hidden bg-white shadow-sm lg:grid-cols-2"><div className="hidden min-h-[560px] bg-[#182019] p-10 text-white lg:flex lg:flex-col lg:justify-end"><p className="text-[10px] uppercase tracking-[.25em] text-[#8fbc8f]">Welcome to LUMORA</p><h1 className="mt-4 font-serif text-6xl leading-[.9]">Wear your<br /><em className="text-[#8fbc8f]">story.</em></h1></div><div className="p-7 sm:p-12"><button onClick={() => go('home')} className="mb-16 font-serif text-2xl tracking-[.15em]">LUMORA</button><p className="text-[10px] uppercase tracking-[.22em] text-[#8fbc8f]">{login ? 'Welcome back' : 'Join the circle'}</p><h1 className="mt-3 font-serif text-4xl">{login ? 'Sign in.' : 'Create account.'}</h1><form className="mt-8 flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); go('products') }}><input required type="email" aria-label="Email" placeholder="Email address" className="border-b border-[#aeb8af] px-1 py-3 text-sm outline-none focus:border-[#8fbc8f]" /><input required type="password" aria-label="Password" placeholder="Password" className="border-b border-[#aeb8af] px-1 py-3 text-sm outline-none focus:border-[#8fbc8f]" />{!login && <input required type="password" aria-label="Confirm password" placeholder="Confirm password" className="border-b border-[#aeb8af] px-1 py-3 text-sm outline-none focus:border-[#8fbc8f]" />}<button className="mt-3 bg-[#182019] py-4 text-[10px] uppercase tracking-[.17em] text-white">{login ? 'Sign in' : 'Create account'}</button></form><p className="mt-7 text-center text-xs text-[#68736b]">{login ? "Don't have an account?" : 'Already a member?'} <button onClick={() => go(login ? 'register' : 'login')} className="font-semibold text-[#48734e] underline">{login ? 'Create one' : 'Sign in'}</button></p></div></div></main> }
