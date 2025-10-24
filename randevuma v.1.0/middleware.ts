import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Edge-safe middleware: ONLY redirects, NO database/prisma imports
 * Rate limiting moved to API routes to avoid Edge Function limitations
 */
export function middleware(req: NextRequest) {
  const url = new URL(req.url)

  // 301 Redirect: Remove legacy ?staffId= query params from /b/* paths
  if (url.pathname.startsWith('/b/') && url.searchParams.has('staffId')) {
    url.searchParams.delete('staffId')
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/b/:path*'],
}
