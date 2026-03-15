const DAY_IN_MS = 24 * 60 * 60 * 1000

export function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10)
}

export function isReminderDueToday(cancelByAt: Date, daysBefore: number, now: Date): boolean {
    const todayUtc = startOfUtcDay(now)
    const dueStart = new Date(todayUtc.getTime() + daysBefore * DAY_IN_MS)
    const dueEnd = new Date(dueStart.getTime() + DAY_IN_MS)

    return cancelByAt >= dueStart && cancelByAt < dueEnd
}
