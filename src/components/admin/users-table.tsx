'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export type UserRow = {
    id: string
    email: string
    role: 'USER' | 'ADMIN'
    createdAt: string
    lastSeenIp: string | null
    lastSeenDevice: string | null
    subscriptionCount: number
}

type UsersTableProps = {
    rows: UserRow[]
    currentUserId: string
}

function formatDate(isoStr: string): string {
    return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(isoStr))
}

function truncateDevice(ua: string | null): string {
    if (!ua) return '—'
    return ua.length > 60 ? ua.slice(0, 60) + '…' : ua
}

function DeleteButton({ user, currentUserId }: { user: UserRow; currentUserId: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const isSelf = user.id === currentUserId

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSelf}
                title={isSelf ? 'Нельзя удалить себя' : 'Удалить пользователя'}
                onClick={() => setOpen(true)}
                className="text-grays px-2 hover:text-red-400"
            >
                <Trash2 className="size-3.5" />
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex size-8 items-center justify-center text-red-400">
                            <Trash2 className="size-4" />
                        </div>
                        <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Аккаунт «{user.email}» и все связанные данные будут удалены. Это
                            действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            className="border-red-500 bg-red-500 text-white hover:opacity-80"
                            disabled={isDeleting}
                            onClick={async () => {
                                setIsDeleting(true)
                                const res = await fetch(`/api/admin/users/${user.id}`, {
                                    method: 'DELETE',
                                })
                                setIsDeleting(false)
                                if (res.ok) {
                                    setOpen(false)
                                    router.refresh()
                                }
                            }}
                        >
                            {isDeleting ? 'Удаление…' : 'Удалить'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export function UsersTable({ rows, currentUserId }: UsersTableProps) {
    if (rows.length === 0) {
        return <p className="text-grays text-sm">Нет пользователей.</p>
    }

    return (
        <div className="border-border overflow-x-auto border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-border border-b">
                        <th className="text-grays px-4 py-2 text-left font-medium">Email</th>
                        <th className="text-grays px-4 py-2 text-left font-medium">Роль</th>
                        <th className="text-grays px-4 py-2 text-left font-medium whitespace-nowrap">
                            Регистрация
                        </th>
                        <th className="text-grays px-4 py-2 text-left font-medium">IP</th>
                        <th className="text-grays px-4 py-2 text-left font-medium">Устройство</th>
                        <th className="text-grays px-4 py-2 text-right font-medium">Подписки</th>
                        <th className="px-4 py-2" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-border border-b last:border-0">
                            <td className="text-light px-4 py-2">{row.email}</td>
                            <td className="px-4 py-2">
                                <span
                                    className={
                                        row.role === 'ADMIN'
                                            ? 'text-primary text-xs font-medium'
                                            : 'text-grays text-xs'
                                    }
                                >
                                    {row.role}
                                </span>
                            </td>
                            <td className="text-grays px-4 py-2 whitespace-nowrap">
                                {formatDate(row.createdAt)}
                            </td>
                            <td className="text-grays px-4 py-2 font-mono text-xs">
                                {row.lastSeenIp ?? '—'}
                            </td>
                            <td
                                className="text-grays max-w-xs truncate px-4 py-2 text-xs"
                                title={row.lastSeenDevice ?? undefined}
                            >
                                {truncateDevice(row.lastSeenDevice)}
                            </td>
                            <td className="text-light px-4 py-2 text-right">
                                {row.subscriptionCount}
                            </td>
                            <td className="px-2 py-1">
                                <DeleteButton user={row} currentUserId={currentUserId} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
