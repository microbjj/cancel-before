import assert from 'node:assert/strict'
import test from 'node:test'

import { isReminderDueToday, startOfUtcDay, toIsoDate } from './reminders'

test('startOfUtcDay returns midnight UTC', () => {
    const value = new Date('2026-03-03T14:37:11.000Z')
    const dayStart = startOfUtcDay(value)

    assert.equal(dayStart.toISOString(), '2026-03-03T00:00:00.000Z')
})

test('isReminderDueToday returns true for matching cancelBy date', () => {
    const now = new Date('2026-03-03T08:00:00.000Z')
    const cancelByAt = new Date('2026-03-10T12:00:00.000Z')

    assert.equal(isReminderDueToday(cancelByAt, 7, now), true)
})

test('isReminderDueToday returns false when outside due window', () => {
    const now = new Date('2026-03-03T08:00:00.000Z')
    const cancelByAt = new Date('2026-03-11T12:00:00.000Z')

    assert.equal(isReminderDueToday(cancelByAt, 7, now), false)
})

test('toIsoDate returns yyyy-mm-dd', () => {
    assert.equal(toIsoDate(new Date('2026-03-03T22:00:00.000Z')), '2026-03-03')
})
