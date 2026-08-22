import crypto from 'node:crypto';

export class MessageQueue {
  #items = [];
  #consumed = new Set();

  publish(message) {
    this.#items.push({ ...message, queuedAt: new Date().toISOString() });
    return message.requestId;
  }

  consume() {
    const message = this.#items.find(item => !this.#consumed.has(item.requestId));
    if (!message) return null;
    this.#consumed.add(message.requestId);
    return message;
  }

  get pendingCount() {
    return this.#items.filter(item => !this.#consumed.has(item.requestId)).length;
  }

  get publishedCount() {
    return this.#items.length;
  }
}

export function createCheckInService({ queue = new MessageQueue() } = {}) {
  const attendees = new Map();
  const completedRequests = new Set();

  function scan(attendeeId) {
    if (!attendeeId) throw new Error('attendee_id_required');
    const existing = attendees.get(attendeeId);
    if (existing?.status === 'checked_in') return { accepted: false, duplicate: true, state: existing };
    if (existing?.status === 'pending') return { accepted: false, duplicate: true, state: existing };

    const requestId = crypto.randomUUID();
    const state = { attendeeId, status: 'pending', requestId, requestedAt: new Date().toISOString() };
    attendees.set(attendeeId, state);
    queue.publish({ requestId, attendeeId, type: 'badge.print.requested' });
    return { accepted: true, duplicate: false, state, queueDepth: queue.pendingCount };
  }

  function complete({ attendeeId, requestId, success = true, completedAt = new Date().toISOString() }) {
    if (!attendeeId || !requestId) throw new Error('attendee_id_and_request_id_required');
    if (completedRequests.has(requestId)) return { accepted: true, duplicate: true, stale: false, state: attendees.get(attendeeId) || null };
    const current = attendees.get(attendeeId);
    if (!current || current.requestId !== requestId) {
      completedRequests.add(requestId);
      return { accepted: true, duplicate: false, stale: true, state: current || null };
    }
    completedRequests.add(requestId);
    const next = { ...current, status: success ? 'checked_in' : 'print_failed', completedAt };
    attendees.set(attendeeId, next);
    return { accepted: true, duplicate: false, stale: false, state: next };
  }

  function get(attendeeId) {
    return attendees.get(attendeeId) || null;
  }

  function queueStatus() {
    return { published: queue.publishedCount, pending: queue.pendingCount };
  }

  return { queue, scan, complete, get, queueStatus };
}
