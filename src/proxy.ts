import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE, verifyToken } from '@/lib/auth/jwt'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const user = token ? verifyToken(token) : null

  const path = request.nextUrl.pathname

  const publicRoutes = ['/auth/login', '/auth/register', '/vagas', '/setup-admin']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  if (!user && !isPublicRoute && path !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && path.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/redirect'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
