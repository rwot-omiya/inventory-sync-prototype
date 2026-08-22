import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckInService, MessageQueue } from '../src/checkin-service.js';

test('queues three attendee scans and leaves each in pending state', () => {
  const service = createCheckInService();
  for (const attendeeId of ['attendee-a', 'attendee-b', 'attendee-c']) {
    const result = service.scan(attendeeId);
    assert.equal(result.accepted, true);
    assert.equal(service.get(attendeeId).status, 'pending');
  }
  assert.deepEqual(service.queueStatus(), { published: 3, pending: 3 });
});

test('does not publish a second print request for a duplicate scan', () => {
  const service = createCheckInService();
  const first = service.scan('duplicate-attendee');
  const second = service.scan('duplicate-attendee');
  assert.equal(first.accepted, true);
  assert.equal(second.duplicate, true);
  assert.equal(second.state.status, 'pending');
  assert.equal(service.queueStatus().published, 1);
});

test('shows checked in only after the printer completion callback', () => {
  const service = createCheckInService();
  const request = service.scan('attendee-success').state;
  assert.equal(service.get('attendee-success').status, 'pending');
  const result = service.complete({ attendeeId: 'attendee-success', requestId: request.requestId, success: true });
  assert.equal(result.state.status, 'checked_in');
  assert.equal(service.get('attendee-success').status, 'checked_in');
  assert.equal(service.scan('attendee-success').duplicate, true);
});

test('ignores an out-of-order callback for an old request', () => {
  const service = createCheckInService();
  const oldRequest = service.scan('attendee-order').state.requestId;
  service.complete({ attendeeId: 'attendee-order', requestId: oldRequest, success: true });
  const duplicate = service.scan('attendee-order');
  assert.equal(duplicate.duplicate, true);
  const stale = service.complete({ attendeeId: 'attendee-order', requestId: 'old-out-of-order-request', success: true });
  assert.equal(stale.stale, true);
  assert.equal(service.get('attendee-order').status, 'checked_in');
});

test('message queue publishes and consumes print requests', () => {
  const queue = new MessageQueue();
  queue.publish({ requestId: 'req-1', attendeeId: 'attendee-a' });
  assert.equal(queue.pendingCount, 1);
  assert.equal(queue.consume().requestId, 'req-1');
  assert.equal(queue.pendingCount, 0);
});
