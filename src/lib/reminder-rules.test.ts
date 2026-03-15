import assert from 'node:assert/strict'
import test from 'node:test'

import { validateReminderRuleInput } from './reminder-rules'

test('validates reminder rule create payload', () => {
    const result = validateReminderRuleInput({
        daysBefore: 7,
        isActive: true,
    })

    assert.equal(result.ok, true)
})

test('rejects negative daysBefore', () => {
    const result = validateReminderRuleInput({
        daysBefore: -1,
    })

    assert.equal(result.ok, false)
})

test('requires at least one field for partial update', () => {
    const result = validateReminderRuleInput({}, { partial: true })

    assert.equal(result.ok, false)
})
