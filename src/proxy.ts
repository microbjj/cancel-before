import { type NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { AUTH_SECRET } from '@/lib/auth-secret'

export async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: AUTH_SECRET,
    })

    if (token) {
        return NextResponse.next()
    }

    const callbackPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', callbackPath)

    return NextResponse.redirect(loginUrl)
}

export const config = {
    matcher: ['/dashboard/:path*', '/subscriptions/:path*'],
}
