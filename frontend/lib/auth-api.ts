const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
).replace(/\/+$/, '')

type ApiResponse<T> = {
  data?: T
  message?: string
  error?: unknown
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot connect to the API. Check that the backend is running and NEXT_PUBLIC_API_URL is configured.')
  }

  const result = await response.json().catch(() => null) as ApiResponse<T> | null
  if (!response.ok) {
    const detail = result?.message ?? result?.error
    throw new Error(typeof detail === 'string' ? detail : `Request failed (${response.status}).`)
  }
  if (!result || result.data === undefined) {
    throw new Error('The API returned an unexpected response.')
  }
  return result.data
}

export function login(email: string, password: string): Promise<string> {
  return post<string>('/v1/auth/login', { email, password })
}

export function register(input: { firstName: string; lastName: string; email: string; password: string }): Promise<string> {
  return post<string>('/v1/auth/register', input)
}

export function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(window.atob(normalized)) as { role?: unknown }
    return typeof claims.role === 'string' ? claims.role : null
  } catch {
    return null
  }
}

export function saveAuthSession(token: string, role: string): void {
  window.sessionStorage.setItem('auth_token', token)
  window.sessionStorage.setItem('auth_role', role)
}