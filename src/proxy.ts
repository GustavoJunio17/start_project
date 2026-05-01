import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE = 'auth_token'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/login-test',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/vagas',
  '/setup-admin',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/setup-admin',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/vagas',
]

const ROUTE_ROLES: [string, string[]][] = [
  ['/admin', ['super_admin', 'super_gestor']],
  ['/empresa', ['user_empresa', 'gestor_rh', 'admin', 'super_admin', 'super_gestor']],
  ['/gestor', ['gestor_rh', 'colaborador', 'user_empresa', 'admin', 'super_admin', 'super_gestor']],
  ['/candidato', ['candidato']],
  ['/api/admin', ['super_admin', 'super_gestor']],
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'),
  )
}

function getAllowedRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of ROUTE_ROLES) {
    if (pathname.startsWith(prefix)) return roles
  }
  return null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // CSRF: reject API mutations from foreign origins
  if (pathname.startsWith('/api/') && req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.get('origin')
    if (origin) {
      const host = req.headers.get('host') || req.nextUrl.host
      const expected = `${req.nextUrl.protocol}//${host}`
      if (origin !== expected) {
        return new NextResponse(JSON.stringify({ error: 'CSRF validation failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  if (isPublic(pathname)) return NextResponse.next()

  const token = req.cookies.get(AUTH_COOKIE)?.value

  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
    )
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    const allowedRoles = getAllowedRoles(pathname)
    if (allowedRoles && !allowedRoles.includes(role)) {
      const dashboardMap: Record<string, string> = {
        super_admin: '/admin/dashboard',
        super_gestor: '/admin/dashboard',
        admin: '/empresa/dashboard',
        user_empresa: '/empresa/dashboard',
        gestor_rh: '/empresa/dashboard',
        candidato: '/candidato/dashboard',
        colaborador: '/gestor/dashboard',
      }
      const dest = dashboardMap[role] ?? '/auth/login'
      return NextResponse.redirect(new URL(dest, req.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(AUTH_COOKIE)
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
