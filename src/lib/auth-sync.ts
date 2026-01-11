/**
 * Cross-tab authentication synchronization using BroadcastChannel API.
 * When one tab logs out, all other tabs are notified and also log out.
 */

const AUTH_CHANNEL_NAME = "auth:logout"

type AuthSyncCallback = () => void

let channel: BroadcastChannel | null = null
let onLogoutCallback: AuthSyncCallback | null = null

/**
 * Initialize the cross-tab auth sync listener.
 * Call this once when the app initializes.
 * @param callback - Function to call when logout is detected from another tab
 */
export function initAuthSync(callback: AuthSyncCallback): void {
  // Only run in browser
  if (typeof window === "undefined") return

  // Check if BroadcastChannel is supported
  if (!("BroadcastChannel" in window)) {
    console.warn("BroadcastChannel API not supported. Cross-tab logout sync disabled.")
    return
  }

  // Clean up existing channel if any
  cleanup()

  onLogoutCallback = callback
  channel = new BroadcastChannel(AUTH_CHANNEL_NAME)

  channel.onmessage = (event) => {
    if (event.data?.type === "logout") {
      // Another tab logged out, trigger local logout
      onLogoutCallback?.()
    }
  }
}

/**
 * Broadcast logout to other tabs.
 * Call this when the user logs out in the current tab.
 */
export function broadcastLogout(): void {
  if (typeof window === "undefined") return

  if (!("BroadcastChannel" in window)) return

  // Create a temporary channel to send the message
  const tempChannel = new BroadcastChannel(AUTH_CHANNEL_NAME)
  tempChannel.postMessage({ type: "logout" })
  tempChannel.close()
}

/**
 * Clean up the auth sync listener.
 * Call this when unmounting the app or when no longer needed.
 */
export function cleanup(): void {
  if (channel) {
    channel.close()
    channel = null
  }
  onLogoutCallback = null
}

/**
 * Check if auth sync is initialized and active
 */
export function isAuthSyncActive(): boolean {
  return channel !== null
}
