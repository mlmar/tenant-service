import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus, type DomainEvent } from './eventBus.js';
const event: DomainEvent = { id: 'test-1', type: 'contact.created', occurredAt: new Date().toISOString(), aggregateId: 'contact-1', payload: {} };
test('delivers only matching events and honors unsubscribe', async () => {
  const bus = new EventBus(); let count = 0;
  const unsubscribe = bus.subscribe(event.type, () => { count++; });
  bus.subscribe('other', () => assert.fail('unrelated subscriber called'));
  await bus.publish(event); unsubscribe(); await bus.publish(event);
  assert.equal(count, 1);
});
test('reports subscriber errors while delivering to other subscribers', async () => {
  const bus = new EventBus(); let delivered = false;
  bus.subscribe(event.type, () => { throw new Error('failure'); });
  bus.subscribe(event.type, async () => { delivered = true; });
  await assert.rejects(bus.publish(event), AggregateError);
  assert.equal(delivered, true);
});
