import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { UsersTable } from '@/components/admin/users-table'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await getAuthSession()

    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            lastSeenIp: true,
            lastSeenDevice: true,
            _count: { select: { subscriptions: true } },
        },
    })

    const rows = users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role as 'USER' | 'ADMIN',
        createdAt: u.createdAt.toISOString(),
        lastSeenIp: u.lastSeenIp,
        lastSeenDevice: u.lastSeenDevice,
        subscriptionCount: u._count.subscriptions,
    }))

    return (
        <section>
            <p className="text-light mb-4 text-sm font-medium">Пользователи — {rows.length}</p>
            <UsersTable rows={rows} currentUserId={session!.user.id} />
        </section>
    )
}
