import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  
  // Block known search engine bots and crawlers
  const blockedBots = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegram',
    'crawler', 'spider', 'bot', 'scraper', 'wget', 'curl'
  ]
  
  const isBot = blockedBots.some(bot => userAgent.includes(bot))
  
  if (isBot) {
    return new NextResponse('Access Denied', { 
      status: 403,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache'
      }
    })
  }

  const response = NextResponse.next()

  // Add security headers to prevent indexing and caching
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache')
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'no-referrer')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 