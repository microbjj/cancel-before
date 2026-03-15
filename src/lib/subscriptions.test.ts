import assert from 'node:assert/strict'
import test from 'node:test'

import { validateSubscriptionInput } from './subscriptions'

test('validates a minimal create payload', () => {
    const result = validateSubscriptionInput({
        name: 'YouTube Premium',
    })

    assert.equal(result.ok, true)
    if (result.ok) {
        assert.equal(result.data.name, 'YouTube Premium')
        assert.equal(result.data.currency, undefined)
    }
})

test('rejects invalid currency length', () => {
    const result = validateSubscriptionInput({
        name: 'YouTube Premium',
        currency: 'RUBLE',
    })

    assert.equal(result.ok, false)
})

test('accepts cancelByAt', () => {
    const result = validateSubscriptionInput({
        name: 'YouTube Premium',
        cancelByAt: '2026-03-08T00:00:00.000Z',
    })

    assert.equal(result.ok, true)
    if (result.ok) {
        assert.ok(result.data.cancelByAt instanceof Date)
    }
})

test('normalizes currency and converts cancelByAt to Date', () => {
    const result = validateSubscriptionInput({
        name: ' Netflix ',
        currency: ' usd ',
        cancelByAt: '2026-03-01T00:00:00.000Z',
    })

    assert.equal(result.ok, true)
    if (result.ok) {
        assert.equal(result.data.name, 'Netflix')
        assert.equal(result.data.currency, 'USD')
        assert.ok(result.data.cancelByAt instanceof Date)
    }
})

test('validates partial payload updates', () => {
    const result = validateSubscriptionInput(
        {
            currency: 'rub',
            amountCents: null,
        },
        { partial: true },
    )

    assert.equal(result.ok, true)
    if (result.ok) {
        assert.equal(result.data.currency, 'RUB')
        assert.equal(result.data.amountCents, null)
    }
})

test('rejects empty partial update payload', () => {
    const result = validateSubscriptionInput({}, { partial: true })

    assert.equal(result.ok, false)
})
