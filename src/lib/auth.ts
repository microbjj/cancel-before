import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { AUTH_SECRET } from '@/lib/auth-secret'
import { db } from '@/lib/db'
import { loginCredentialsSchema } from '@/lib/schemas/login'

export const authOptions: NextAuthOptions = {
    secret: AUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                name: { label: 'Name', type: 'text' },
            },
            async authorize(credentials) {
                const parsed = loginCredentialsSchema.safeParse({
                    email: credentials?.email,
                    name: credentials?.name,
                })
                if (!parsed.success) {
                    return null
                }

                const { email, name } = parsed.data

                const user = await db.user.upsert({
                    where: { email },
                    update: name ? { name } : {},
                    create: {
                        email,
                        name,
                    },
                })

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) {
                token.sub = user.id
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }

            return session
        },
    },
    pages: {
        signIn: '/login',
    },
}

export function getAuthSession() {
    return getServerSession(authOptions)
}
