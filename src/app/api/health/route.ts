import { NextResponse } from 'next/server'

/**
 * Health check endpoint for Kubernetes liveness and readiness probes
 *
 * This endpoint is excluded from next-intl middleware (see middleware.ts matcher)
 * and responds quickly with a simple JSON status.
 *
 * @returns JSON response with status and timestamp
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

// Also support HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
