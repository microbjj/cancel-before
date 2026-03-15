type ReminderNotificationInput = {
    to: string
    subscriptionName: string
    cancelByAt: Date
    daysBefore: number
}

export async function sendReminderEmail(input: ReminderNotificationInput) {
    // MVP stub: replace with a real email provider (Resend, Postmark, etc.).
    console.info('Reminder email stub', {
        to: input.to,
        subscriptionName: input.subscriptionName,
        cancelByAt: input.cancelByAt.toISOString(),
        daysBefore: input.daysBefore,
    })

    return {
        ok: true as const,
    }
}
