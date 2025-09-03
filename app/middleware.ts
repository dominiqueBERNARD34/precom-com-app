import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/inscription') {
    const plan = req.nextUrl.searchParams.get('plan')
    if (!plan) {
      const url = req.nextUrl.clone()
      url.pathname = '/formules'
      url.search = '?h=pro'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/inscription'] }
