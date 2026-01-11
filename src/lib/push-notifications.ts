import { api } from "./api"

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

// Get current notification permission status
export function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission
}

// Request notification permission
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications not supported")
  }
  return Notification.requestPermission()
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    console.log("Service Worker registered:", registration.scope)
    return registration
  } catch (error) {
    console.error("Service Worker registration failed:", error)
    return null
  }
}

// Get the active service worker registration
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null

  try {
    return await navigator.serviceWorker.ready
  } catch (error) {
    console.error("Failed to get service worker registration:", error)
    return null
  }
}

// Convert URL-safe base64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    throw new Error("Push notifications not supported")
  }

  // Check permission
  if (Notification.permission !== "granted") {
    const permission = await requestPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }
  }

  // Register service worker if not already registered
  const registration = await getServiceWorkerRegistration()
  if (!registration) {
    throw new Error("Service worker not available")
  }

  try {
    // Get VAPID public key from server
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/notifications/vapid-public-key`
    )
    if (!response.ok) {
      throw new Error("Failed to get VAPID public key")
    }
    const { publicKey } = await response.json()

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    // Send subscription to server
    const subscriptionJson = subscription.toJSON()
    await api.subscribeToPush({
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh || "",
      auth: subscriptionJson.keys?.auth || "",
      userAgent: navigator.userAgent,
    })

    return true
  } catch (error) {
    console.error("Failed to subscribe to push:", error)
    throw error
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  const registration = await getServiceWorkerRegistration()
  if (!registration) return false

  try {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      // Unsubscribe from browser
      await subscription.unsubscribe()

      // Unsubscribe from server
      await api.unsubscribeFromPush({ endpoint: subscription.endpoint })
    }
    return true
  } catch (error) {
    console.error("Failed to unsubscribe from push:", error)
    throw error
  }
}

// Check if currently subscribed to push
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  const registration = await getServiceWorkerRegistration()
  if (!registration) return false

  try {
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error("Failed to check subscription:", error)
    return false
  }
}
