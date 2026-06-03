import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token       = request.cookies.get('admin_token')?.value
  const isAdmin     = pathname.startsWith('/admin')
  const isLogin     = pathname === '/admin/login'

  if (isAdmin && !isLogin && token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (isLogin && token === process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
