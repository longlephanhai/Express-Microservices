 'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { getRoleFromToken, login, register, saveAuthSession } from '@/lib/auth-api'

const inputClass = 'w-full border-b border-[#c9cec5] bg-transparent px-1 py-3 text-sm outline-none transition placeholder:text-[#858b84] focus:border-[#182019]'

function FormMessage({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <p role={error ? 'alert' : 'status'} className={`text-sm ${error ? 'text-red-700' : 'text-[#27634d]'}`}>{children}</p>
}

export function LoginPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    try {
      const token = await login(String(formData.get('email')), String(formData.get('password')))
      const role = getRoleFromToken(token)
      if (role !== 'user') {
        throw new Error(role === 'admin' ? 'Use the admin sign-in page for this account.' : 'The login response did not contain a valid user role.')
      }
      saveAuthSession(token, role)
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.')
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f3ed] text-black lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#182019] text-white lg:block">
        <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85" alt="LUMORA collection" className="absolute inset-0 size-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111713]/80 via-transparent to-[#111713]/10" />
        <div className="absolute inset-x-12 bottom-14">
          <p className="text-[10px] uppercase tracking-[.24em] text-[#b7d1b4]">LUMORA / BOUTIQUE</p>
          <h1 className="mt-4 font-serif text-6xl leading-[.95]">Wear your<br /><em className="text-[#b7d1b4]">story.</em></h1>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="font-serif text-2xl tracking-[.14em]">LUMORA</Link>
          <p className="mt-12 text-[10px] uppercase tracking-[.2em]">Welcome back</p>
          <h2 className="mt-2 font-serif text-4xl">Sign in.</h2>
          <p className="mt-3 text-sm">Access your customer account.</p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="text-xs">Email address
              <input className={`${inputClass} mt-1`} name="email" type="email" autoComplete="email" required />
            </label>
            <label className="text-xs">Password
              <input className={`${inputClass} mt-1`} name="password" type="password" autoComplete="current-password" minLength={6} required />
            </label>
            {error && <FormMessage error>{error}</FormMessage>}
            <button type="submit" disabled={pending} className="mt-2 flex min-h-12 items-center justify-center gap-2 bg-[#182019] px-5 text-[10px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#31483a] disabled:cursor-wait disabled:opacity-60">
              <LockKeyhole size={15} /> {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-7 text-center text-sm">New to LUMORA? <Link className="underline underline-offset-4" href="/register">Create an account</Link></p>
          <Link href="/admin/login" className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.14em] hover:text-[#182019]"><ShieldCheck size={14} /> Admin sign in</Link>
        </div>
      </section>
    </main>
  )
}

export function RegisterPage() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setPending(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(form)
    const password = String(formData.get('password'))
    if (password !== String(formData.get('confirmPassword'))) {
      setError('Passwords do not match.')
      setPending(false)
      return
    }

    try {
      await register({
        firstName: String(formData.get('firstName')).trim(),
        lastName: String(formData.get('lastName')).trim(),
        email: String(formData.get('email')).trim(),
        password,
      })
      setSuccess(true)
      form.reset()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create your account. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f3ed] lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#182019] text-white lg:block">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85" alt="LUMORA new collection" className="absolute inset-0 size-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111713]/80 via-transparent to-[#111713]/10" />
        <div className="absolute inset-x-12 bottom-14">
          <p className="text-[10px] uppercase tracking-[.24em] text-[#b7d1b4]">A considered wardrobe</p>
          <h1 className="mt-4 font-serif text-6xl leading-[.95]">Find your<br /><em className="text-[#b7d1b4]">moment.</em></h1>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="font-serif text-2xl tracking-[.14em]">LUMORA</Link>
          <p className="mt-10 text-[10px] uppercase tracking-[.2em] text-[#68736b]">Join the circle</p>
          <h2 className="mt-2 font-serif text-4xl">Create account.</h2>
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs text-[#505950]">First name
                <input className={`${inputClass} mt-1`} name="firstName" autoComplete="given-name" minLength={2} required />
              </label>
              <label className="text-xs text-[#505950]">Last name
                <input className={`${inputClass} mt-1`} name="lastName" autoComplete="family-name" minLength={2} required />
              </label>
            </div>
            <label className="text-xs text-[#505950]">Email address
              <input className={`${inputClass} mt-1`} name="email" type="email" autoComplete="email" required />
            </label>
            <label className="text-xs text-[#505950]">Password
              <input className={`${inputClass} mt-1`} name="password" type="password" autoComplete="new-password" minLength={6} required />
            </label>
            <label className="text-xs text-[#505950]">Confirm password
              <input className={`${inputClass} mt-1`} name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
            </label>
            {error && <FormMessage error>{error}</FormMessage>}
            {success && <FormMessage>Account created. You can now sign in.</FormMessage>}
            <button type="submit" disabled={pending} className="mt-2 min-h-12 bg-[#182019] px-5 text-[10px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#31483a] disabled:cursor-wait disabled:opacity-60">
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#68736b]">Already a member? <Link className="text-[#182019] underline underline-offset-4" href="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}

export function AdminLoginPage() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    try {
      const token = await login(String(formData.get('email')), String(formData.get('password')))
      const role = getRoleFromToken(token)
      if (role !== 'admin') {
        throw new Error(role === 'user' ? 'This account does not have administrator access.' : 'The login response did not contain a valid admin role.')
      }
      saveAuthSession(token, role)
      setSuccess(true)
      // router.replace('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14231f] px-5 py-12 text-[#182019]">
      <section className="w-full max-w-[440px] bg-[#f7f7f2] px-7 py-9 shadow-2xl sm:px-11 sm:py-12">
        <div className="mb-10 flex items-center gap-3 text-[#365b4b]"><ShieldCheck size={22} strokeWidth={1.5} /><span className="text-[10px] font-semibold uppercase tracking-[.2em]">LUMORA / ADMIN</span></div>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#68736b]">Restricted access</p>
        <h1 className="mt-2 font-serif text-4xl">Administrator sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#68736b]">Use an account with administrator permissions.</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="text-xs text-[#505950]">Email address
            <input className={`${inputClass} mt-1`} name="email" type="email" autoComplete="username" required />
          </label>
          <label className="text-xs text-[#505950]">Password
            <input className={`${inputClass} mt-1`} name="password" type="password" autoComplete="current-password" minLength={6} required />
          </label>
          {error && <FormMessage error>{error}</FormMessage>}
          {success && <FormMessage>Admin sign-in successful. Your session is active in this browser tab.</FormMessage>}
          <button type="submit" disabled={pending} className="mt-2 flex min-h-12 items-center justify-center gap-2 bg-[#244737] px-5 text-[10px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#315d47] disabled:cursor-wait disabled:opacity-60">
            <LockKeyhole size={15} /> {pending ? 'Verifying…' : 'Sign in to admin'}
          </button>
        </form>
        <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-xs text-[#68736b] hover:text-[#182019]"><ArrowLeft size={14} /> Customer sign in</Link>
      </section>
    </main>
  )
}


