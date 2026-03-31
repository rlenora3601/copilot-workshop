import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../src/models/task.js';

describe('Task constructor - success paths', () => {
  test('creates task with required title and applies default values', () => {
    const task = new Task({ title: 'My task' });
    assert.equal(task.title, 'My task');
    assert.equal(task.status, 'todo');
    assert.equal(task.priority, 'medium');
    assert.equal(task.description, '');
    assert.ok(typeof task.id === 'string' && task.id.length > 0);
    assert.ok(typeof task.createdAt === 'string');
    assert.ok(typeof task.updatedAt === 'string');
  });

  test('creates task with all fields explicitly provided', () => {
    const task = new Task({
      title: 'Full task',
      description: 'Some details',
      status: 'in-progress',
      priority: 'high',
    });
    assert.equal(task.title, 'Full task');
    assert.equal(task.description, 'Some details');
    assert.equal(task.status, 'in-progress');
    assert.equal(task.priority, 'high');
  });

  test('trims whitespace from title on construction', () => {
    const task = new Task({ title: '  Trimmed title  ' });
    assert.equal(task.title, 'Trimmed title');
  });

  test('accepts explicit id for rehydration scenarios', () => {
    const task = new Task({ title: 'Rehydrated', id: 'custom-id-123' });
    assert.equal(task.id, 'custom-id-123');
  });

  test('accepts explicit ISO createdAt and updatedAt timestamps', () => {
    const ts = '2024-01-15T10:00:00.000Z';
    const task = new Task({ title: 'Timed task', createdAt: ts, updatedAt: ts });
    assert.equal(task.createdAt, ts);
    assert.equal(task.updatedAt, ts);
  });

  test('generates unique ids for two tasks created without explicit id', () => {
    const a = new Task({ title: 'Task A' });
    const b = new Task({ title: 'Task B' });
    assert.notEqual(a.id, b.id);
  });
});

describe('Task constructor - error paths', () => {
  test('throws TypeError when input is a string', () => {
    assert.throws(() => new Task('not-an-object'), TypeError);
  });

  test('throws TypeError when input is null', () => {
    assert.throws(() => new Task(null), TypeError);
  });

  test('throws TypeError when input is an array', () => {
    assert.throws(() => new Task([]), TypeError);
  });

  test('throws TypeError when title is missing', () => {
    assert.throws(() => new Task({}), TypeError);
  });

  test('throws TypeError when title is empty string', () => {
    assert.throws(() => new Task({ title: '' }), TypeError);
  });

  test('throws TypeError when title is whitespace only', () => {
    assert.throws(() => new Task({ title: '   ' }), TypeError);
  });

  test('throws TypeError when title exceeds 100 characters', () => {
    assert.throws(() => new Task({ title: 'x'.repeat(101) }), TypeError);
  });

  test('throws TypeError when status value is invalid', () => {
    assert.throws(() => new Task({ title: 'T', status: 'unknown' }), TypeError);
  });

  test('throws TypeError when priority value is invalid', () => {
    assert.throws(() => new Task({ title: 'T', priority: 'critical' }), TypeError);
  });

  test('throws TypeError when createdAt is not a valid ISO string', () => {
    assert.throws(() => new Task({ title: 'T', createdAt: 'not-a-date' }), TypeError);
  });

  test('throws TypeError when updatedAt is not a valid ISO string', () => {
    assert.throws(() => new Task({ title: 'T', updatedAt: 'bad-date' }), TypeError);
  });
});

describe('Task.update() - success paths', () => {
  test('updates a single field', () => {
    const task = new Task({ title: 'Original' });
    task.update({ title: 'Updated' });
    assert.equal(task.title, 'Updated');
  });

  test('updates multiple fields at once', () => {
    const task = new Task({ title: 'Multi', status: 'todo', priority: 'low' });
    task.update({ status: 'done', priority: 'high' });
    assert.equal(task.status, 'done');
    assert.equal(task.priority, 'high');
  });

  test('updates description field', () => {
    const task = new Task({ title: 'No desc' });
    task.update({ description: 'Now it has one' });
    assert.equal(task.description, 'Now it has one');
  });

  test('refreshes updatedAt after update', () => {
    const task = new Task({ title: 'Time test', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' });
    task.update({ status: 'in-progress' });
    assert.ok(new Date(task.updatedAt) > new Date('2020-01-01T00:00:00.000Z'));
  });

  test('returns the task instance for chaining', () => {
    const task = new Task({ title: 'Fluent' });
    const result = task.update({ status: 'in-progress' });
    assert.strictEqual(result, task);
  });

  test('normalizes status casing in update', () => {
    const task = new Task({ title: 'Case test' });
    task.update({ status: 'DONE' });
    assert.equal(task.status, 'done');
  });
});

describe('Task.update() - error paths', () => {
  test('throws TypeError for empty patch object', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update({}), TypeError);
  });

  test('throws TypeError for unsupported field "id" in patch', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update({ id: 'new-id' }), TypeError);
  });

  test('throws TypeError for unsupported field "createdAt" in patch', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update({ createdAt: new Date().toISOString() }), TypeError);
  });

  test('throws TypeError when patch is not a plain object', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update('invalid'), TypeError);
    assert.throws(() => task.update(null), TypeError);
  });

  test('throws TypeError when status value in patch is invalid', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update({ status: 'pending' }), TypeError);
  });

  test('throws TypeError when priority value in patch is invalid', () => {
    const task = new Task({ title: 'Test' });
    assert.throws(() => task.update({ priority: 'urgent' }), TypeError);
  });
});

describe('Task.clone()', () => {
  test('returns a new Task instance', () => {
    const task = new Task({ title: 'Original' });
    const cloned = task.clone();
    assert.ok(cloned instanceof Task);
  });

  test('cloned task has a different id than the original', () => {
    const task = new Task({ title: 'Original' });
    const cloned = task.clone();
    assert.notEqual(cloned.id, task.id);
  });

  test('cloned task copies title', () => {
    const task = new Task({ title: 'Copy me' });
    assert.equal(task.clone().title, 'Copy me');
  });

  test('cloned task copies description', () => {
    const task = new Task({ title: 'T', description: 'Some desc' });
    assert.equal(task.clone().description, 'Some desc');
  });

  test('cloned task copies status', () => {
    const task = new Task({ title: 'T', status: 'done' });
    assert.equal(task.clone().status, 'done');
  });

  test('cloned task copies priority', () => {
    const task = new Task({ title: 'T', priority: 'high' });
    assert.equal(task.clone().priority, 'high');
  });

  test('mutating the clone does not affect the original', () => {
    const task = new Task({ title: 'Original' });
    const cloned = task.clone();
    cloned.update({ title: 'Modified clone' });
    assert.equal(task.title, 'Original');
  });

  test('cloned task gets fresh createdAt and updatedAt timestamps', () => {
    const ts = '2020-01-01T00:00:00.000Z';
    const task = new Task({ title: 'T', createdAt: ts, updatedAt: ts });
    const cloned = task.clone();
    assert.ok(new Date(cloned.createdAt) > new Date(ts));
  });
});

describe('Task.toJSON()', () => {
  test('returns a plain object with all required fields', () => {
    const task = new Task({ title: 'JSON task' });
    const json = task.toJSON();
    assert.ok(typeof json === 'object' && json !== null && !Array.isArray(json));
    assert.ok(Object.hasOwn(json, 'id'));
    assert.ok(Object.hasOwn(json, 'title'));
    assert.ok(Object.hasOwn(json, 'description'));
    assert.ok(Object.hasOwn(json, 'status'));
    assert.ok(Object.hasOwn(json, 'priority'));
    assert.ok(Object.hasOwn(json, 'createdAt'));
    assert.ok(Object.hasOwn(json, 'updatedAt'));
  });

  test('returned object is a plain object (not a Task instance)', () => {
    const task = new Task({ title: 'Snapshot' });
    const json = task.toJSON();
    assert.equal(json.constructor, Object);
  });

  test('each call returns a new object reference', () => {
    const task = new Task({ title: 'Snapshot' });
    assert.notStrictEqual(task.toJSON(), task.toJSON());
  });

  test('field values match the task instance properties', () => {
    const task = new Task({ title: 'Match test', status: 'done', priority: 'low' });
    const json = task.toJSON();
    assert.equal(json.id, task.id);
    assert.equal(json.title, task.title);
    assert.equal(json.status, 'done');
    assert.equal(json.priority, 'low');
  });
});
