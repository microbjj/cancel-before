import { redirect } from 'next/navigation'

import { ProfileSignOutButton } from '@/components/profile/sign-out-button'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function ProfilePage() {
    const session = await getAuthSession()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { userPlan: true },
    })

    if (!user) {
        redirect('/login')
    }

    const planLabel = user.userPlan?.tier ?? 'FREE'

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Профиль</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Здесь вы можете увидеть данные своего аккаунта и текущий тариф.
                </p>
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        Email
                    </p>
                    <p className="text-sm">
                        {session.user.email ?? user.email}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                        Текущий тариф
                    </p>
                    <p className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                        {planLabel}
                    </p>
                </div>

                <div className="pt-2">
                    <ProfileSignOutButton />
                </div>
            </div>
        </div>
    )
}

