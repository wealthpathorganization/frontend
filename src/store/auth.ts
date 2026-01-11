import { User, api } from "@/lib/api"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LoginResult {
  requiresTOTP: boolean
  tempToken?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>
  loginWithTOTP: (tempToken: string, code: string) => Promise<void>
  loginWithBackupCode: (tempToken: string, backupCode: string) => Promise<void>
  register: (email: string, password: string, name: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string) => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true })
        try {
          const response = await api.login({ email, password, rememberMe })

          // Check if 2FA is required
          if (response.requiresTOTP && response.tempToken) {
            set({ isLoading: false })
            return { requiresTOTP: true, tempToken: response.tempToken }
          }

          // Normal login flow - use accessToken if available, fallback to token for compatibility
          const token = response.accessToken || response.token
          if (token && response.user) {
            api.setToken(token)
            set({ user: response.user, isAuthenticated: true, isLoading: false })
          }
          return { requiresTOTP: false }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      loginWithTOTP: async (tempToken, code) => {
        set({ isLoading: true })
        try {
          const response = await api.loginWithTOTP({ tempToken, code })
          const token = response.accessToken || response.token
          if (token && response.user) {
            api.setToken(token)
            set({ user: response.user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      loginWithBackupCode: async (tempToken, backupCode) => {
        set({ isLoading: true })
        try {
          const response = await api.loginWithBackupCode({ tempToken, backupCode })
          const token = response.accessToken || response.token
          if (token && response.user) {
            api.setToken(token)
            set({ user: response.user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email, password, name, rememberMe = false) => {
        set({ isLoading: true })
        try {
          const response = await api.register({ email, password, name, rememberMe })
          const token = response.accessToken || response.token
          api.setToken(token)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.logout()
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: async (token) => {
        api.setToken(token)
        set({ isAuthenticated: true, isLoading: true })
        try {
          const user = await api.getMe()
          set({ user, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      refreshAccessToken: async () => {
        const result = await api.refreshAccessToken()
        if (!result) {
          // Refresh failed, clear auth state
          set({ user: null, isAuthenticated: false })
        }
        return result
      },

      initializeAuth: () => {
        // Set up logout callback to clear state when token refresh fails
        api.setOnLogoutCallback(() => {
          set({ user: null, isAuthenticated: false })
          // Redirect to login if we're not already there
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login"
          }
        })

        // If user data is persisted but no access token in memory,
        // try to refresh the token using the HttpOnly cookie
        const state = get()
        if (state.isAuthenticated && state.user && !api.getToken()) {
          api.refreshAccessToken().then((success) => {
            if (!success) {
              // Refresh failed, clear persisted state
              set({ user: null, isAuthenticated: false, isInitialized: true })
            } else {
              set({ isInitialized: true })
            }
          })
        } else {
          // No refresh needed, mark as initialized
          set({ isInitialized: true })
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist user info, not token (token is in memory only)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)


