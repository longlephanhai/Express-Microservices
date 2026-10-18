'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin' | string
  phone?: string | null
  address?: string | null
  avatar?: string | null
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string }>
  register: (params: RegisterParams) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  fetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'lumora_auth_token'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchProfileWithToken = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await res.json()
      return data.data as User
    } catch (err) {
      console.warn('[AuthProvider] Invalid or expired token:', err)
      return null
    }
  }, [])

  // Check persisted session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
        if (savedToken) {
          setToken(savedToken)
          const profile = await fetchProfileWithToken(savedToken)
          if (profile) {
            setUser(profile)
          } else {
            // Token is expired or invalid
            localStorage.removeItem(TOKEN_KEY)
            setToken(null)
            setUser(null)
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Init error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [fetchProfileWithToken])

  const login = async ({ email, password }: LoginParams): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.message || data.error || 'Đăng nhập không thành công. Vui lòng thử lại.'
        return { success: false, error: errorMsg }
      }

      // Backend returns { data: token } where data may be string token or { token: string }
      const rawToken = data.data
      const receivedToken = typeof rawToken === 'string' ? rawToken : rawToken?.token

      if (!receivedToken) {
        return { success: false, error: 'Không nhận được mã xác thực từ hệ thống.' }
      }

      // Save token
      localStorage.setItem(TOKEN_KEY, receivedToken)
      setToken(receivedToken)

      // Fetch user profile
      const profile = await fetchProfileWithToken(receivedToken)
      if (profile) {
        setUser(profile)
      } else {
        // Fallback user shape if profile fails
        setUser({
          id: 'user-temp',
          email: email.trim(),
          firstName: 'User',
          lastName: '',
          role: 'user',
        })
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ'
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (params: RegisterParams): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: params.firstName.trim(),
          lastName: params.lastName.trim(),
          email: params.email.trim(),
          password: params.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.message || data.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
        return { success: false, error: errorMsg }
      }

      // Automatically log in after registration
      return await login({ email: params.email, password: params.password })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ'
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const fetchProfile = async () => {
    if (!token) return
    const profile = await fetchProfileWithToken(token)
    if (profile) setUser(profile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
