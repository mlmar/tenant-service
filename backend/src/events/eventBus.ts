export type DomainEvent = { id: string; type: string; occurredAt: string; aggregateId: string; payload: Readonly<Record<string, unknown>> };
type Handler = (event: DomainEvent) => Promise<void> | void;
// Process-local transport for development. This does not provide durable delivery.
export class EventBus {
  private readonly listeners = new Map<string, Set<Handler>>();
  subscribe(type: string, handler: Handler): () => void {
    const handlers = this.listeners.get(type) ?? new Set<Handler>();
    handlers.add(handler);
    this.listeners.set(type, handlers);
    return () => { handlers.delete(handler); if (!handlers.size) this.listeners.delete(type); };
  }
  async publish(event: DomainEvent): Promise<void> {
    const results = await Promise.allSettled([...this.listeners.get(event.type) ?? []].map(handler => Promise.resolve().then(() => handler(event))));
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'Event subscribers failed');
  }
}
