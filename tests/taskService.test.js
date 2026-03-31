import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  deleteTask,
  filterTasksByCategory,
  getTaskById,
  listCategories,
  listTasks,
  updateTask,
} from '../src/services/taskService.js';

describe('createTask', () => {
  test('creates a task with only a title and applies default values', () => {
    const task = createTask({ title: 'Default task' });
    try {
      assert.equal(task.title, 'Default task');
      assert.equal(task.status, 'todo');
      assert.equal(task.priority, 'medium');
      assert.equal(task.description, '');
      assert.ok(typeof task.id === 'string' && task.id.length > 0);
    } finally {
      deleteTask(task.id);
    }
  });

  test('creates a task with all fields explicitly specified', () => {
    const task = createTask({
      title: 'Full task',
      description: 'Some details',
      status: 'in-progress',
      priority: 'high',
      category: 'development',
    });
    try {
      assert.equal(task.description, 'Some details');
      assert.equal(task.status, 'in-progress');
      assert.equal(task.priority, 'high');
      assert.equal(task.category, 'development');
    } finally {
      deleteTask(task.id);
    }
  });

  test('applies default category when omitted', () => {
    const task = createTask({ title: 'No category provided' });
    try {
      assert.equal(task.category, 'general');
    } finally {
      deleteTask(task.id);
    }
  });

  test('created task has ISO string createdAt and updatedAt timestamps', () => {
    const task = createTask({ title: 'Timestamped task' });
    try {
      assert.ok(typeof task.createdAt === 'string');
      assert.ok(typeof task.updatedAt === 'string');
      assert.ok(!Number.isNaN(new Date(task.createdAt).getTime()));
      assert.ok(!Number.isNaN(new Date(task.updatedAt).getTime()));
    } finally {
      deleteTask(task.id);
    }
  });

  test('each created task receives a unique id', () => {
    const a = createTask({ title: 'Task A' });
    const b = createTask({ title: 'Task B' });
    try {
      assert.notEqual(a.id, b.id);
    } finally {
      deleteTask(a.id);
      deleteTask(b.id);
    }
  });

  test('throws TypeError when input is not a plain object', () => {
    assert.throws(() => createTask(null), TypeError);
    assert.throws(() => createTask([]), TypeError);
    assert.throws(() => createTask('string'), TypeError);
  });

  test('throws TypeError when title is missing from input', () => {
    assert.throws(() => createTask({ priority: 'high' }), TypeError);
  });

  test('throws TypeError when title is empty', () => {
    assert.throws(() => createTask({ title: '' }), TypeError);
  });
});

describe('getTaskById', () => {
  let taskId;

  before(() => {
    taskId = createTask({ title: 'Get by ID task' }).id;
  });

  after(() => {
    try { deleteTask(taskId); } catch { /* already deleted */ }
  });

  test('returns the task matching the given id', () => {
    const task = getTaskById(taskId);
    assert.equal(task.id, taskId);
    assert.equal(task.title, 'Get by ID task');
  });

  test('returns a plain object snapshot, not a class instance', () => {
    const task = getTaskById(taskId);
    assert.equal(task.constructor, Object);
  });

  test('returned snapshot includes all Task fields', () => {
    const task = getTaskById(taskId);
    for (const field of ['id', 'title', 'description', 'status', 'priority', 'category', 'createdAt', 'updatedAt']) {
      assert.ok(Object.hasOwn(task, field), `missing field: ${field}`);
    }
  });

  test('throws Error when the id does not exist in the store', () => {
    assert.throws(
      () => getTaskById('00000000-0000-0000-0000-000000000000'),
      Error
    );
  });

  test('throws TypeError when id is not a string', () => {
    assert.throws(() => getTaskById(123), TypeError);
    assert.throws(() => getTaskById(null), TypeError);
  });

  test('throws TypeError when id is an empty string', () => {
    assert.throws(() => getTaskById(''), TypeError);
  });
});

describe('listTasks', () => {
  let todoLowId, todoHighId, doneMediumId;

  before(async () => {
    todoLowId = createTask({ title: 'List:todo-low', status: 'todo', priority: 'low', category: 'ops' }).id;
    await new Promise((r) => setTimeout(r, 5));
    todoHighId = createTask({ title: 'List:todo-high', status: 'todo', priority: 'high', category: 'work' }).id;
    await new Promise((r) => setTimeout(r, 5));
    doneMediumId = createTask({ title: 'List:done-medium', status: 'done', priority: 'medium', category: 'work' }).id;
  });

  after(() => {
    for (const id of [todoLowId, todoHighId, doneMediumId]) {
      try { deleteTask(id); } catch { /* already deleted */ }
    }
  });

  test('returns all tasks including the three created in setup', () => {
    const all = listTasks();
    const ids = all.map((t) => t.id);
    assert.ok(ids.includes(todoLowId));
    assert.ok(ids.includes(todoHighId));
    assert.ok(ids.includes(doneMediumId));
  });

  test('filters by status: returns only todo tasks', () => {
    const todos = listTasks({ status: 'todo' });
    assert.ok(todos.length >= 2);
    assert.ok(todos.every((t) => t.status === 'todo'));
    const ids = todos.map((t) => t.id);
    assert.ok(ids.includes(todoLowId));
    assert.ok(ids.includes(todoHighId));
    assert.ok(!ids.includes(doneMediumId));
  });

  test('filters by status: returns only done tasks', () => {
    const done = listTasks({ status: 'done' });
    assert.ok(done.every((t) => t.status === 'done'));
    const ids = done.map((t) => t.id);
    assert.ok(ids.includes(doneMediumId));
    assert.ok(!ids.includes(todoLowId));
  });

  test('filters by priority: returns only high priority tasks', () => {
    const high = listTasks({ priority: 'high' });
    assert.ok(high.every((t) => t.priority === 'high'));
    const ids = high.map((t) => t.id);
    assert.ok(ids.includes(todoHighId));
    assert.ok(!ids.includes(todoLowId));
  });

  test('filters by both status and priority simultaneously', () => {
    const result = listTasks({ status: 'todo', priority: 'high' });
    assert.ok(result.every((t) => t.status === 'todo' && t.priority === 'high'));
    assert.ok(result.some((t) => t.id === todoHighId));
  });

  test('filters by category value', () => {
    const workTasks = listTasks({ category: 'work' });
    assert.ok(workTasks.length >= 2);
    assert.ok(workTasks.every((t) => t.category === 'work'));
    const ids = workTasks.map((t) => t.id);
    assert.ok(ids.includes(todoHighId));
    assert.ok(ids.includes(doneMediumId));
    assert.ok(!ids.includes(todoLowId));
  });

  test('sorts by priority descending: high appears before low', () => {
    const sorted = listTasks({ status: 'todo', sortBy: 'priority', direction: 'desc' });
    const highIdx = sorted.findIndex((t) => t.id === todoHighId);
    const lowIdx = sorted.findIndex((t) => t.id === todoLowId);
    assert.ok(highIdx < lowIdx, 'high priority should appear before low priority');
  });

  test('sorts by priority ascending: low appears before high', () => {
    const sorted = listTasks({ status: 'todo', sortBy: 'priority', direction: 'asc' });
    const highIdx = sorted.findIndex((t) => t.id === todoHighId);
    const lowIdx = sorted.findIndex((t) => t.id === todoLowId);
    assert.ok(lowIdx < highIdx, 'low priority should appear before high priority');
  });

  test('sorts by createdAt descending: last created appears first', () => {
    const sorted = listTasks({ sortBy: 'createdAt', direction: 'desc' });
    const ids = sorted.map((t) => t.id);
    const doneIdx = ids.indexOf(doneMediumId);
    const todoLowIdx = ids.indexOf(todoLowId);
    assert.ok(doneIdx < todoLowIdx, 'last created task should appear first in desc order');
  });

  test('sorts by createdAt ascending: first created appears first', () => {
    const sorted = listTasks({ sortBy: 'createdAt', direction: 'asc' });
    const ids = sorted.map((t) => t.id);
    const doneIdx = ids.indexOf(doneMediumId);
    const todoLowIdx = ids.indexOf(todoLowId);
    assert.ok(todoLowIdx < doneIdx, 'first created task should appear first in asc order');
  });

  test('returns empty array when no tasks match the filter', () => {
    const result = listTasks({ status: 'in-progress', priority: 'low' });
    assert.ok(Array.isArray(result));
    assert.ok(result.every((t) => t.status === 'in-progress' && t.priority === 'low'));
  });

  test('throws TypeError when options is not a plain object', () => {
    assert.throws(() => listTasks(null), TypeError);
    assert.throws(() => listTasks('string'), TypeError);
  });

  test('throws TypeError for invalid status filter value', () => {
    assert.throws(() => listTasks({ status: 'invalid' }), TypeError);
  });

  test('throws TypeError for invalid category filter value', () => {
    assert.throws(() => listTasks({ category: '' }), TypeError);
  });

  test('returns plain object snapshots, not class instances', () => {
    const all = listTasks();
    for (const task of all) {
      assert.equal(task.constructor, Object);
    }
  });
});

describe('updateTask', () => {
  let taskId;

  before(() => {
    taskId = createTask({ title: 'Update me', status: 'todo', priority: 'low' }).id;
  });

  after(() => {
    try { deleteTask(taskId); } catch { /* already deleted */ }
  });

  test('updates status field and returns the updated task', () => {
    const updated = updateTask(taskId, { status: 'in-progress' });
    assert.equal(updated.status, 'in-progress');
    assert.equal(updated.id, taskId);
  });

  test('updates priority field and returns the updated task', () => {
    const updated = updateTask(taskId, { priority: 'high' });
    assert.equal(updated.priority, 'high');
  });

  test('updates title and description simultaneously', () => {
    const updated = updateTask(taskId, { title: 'Renamed', description: 'New desc' });
    assert.equal(updated.title, 'Renamed');
    assert.equal(updated.description, 'New desc');
  });

  test('updates category field and persists it', () => {
    const updated = updateTask(taskId, { category: 'work' });
    assert.equal(updated.category, 'work');
    assert.equal(getTaskById(taskId).category, 'work');
  });

  test('updatedAt is refreshed after update', () => {
    const snapshot1 = getTaskById(taskId);
    updateTask(taskId, { status: 'done' });
    const snapshot2 = getTaskById(taskId);
    assert.ok(new Date(snapshot2.updatedAt) >= new Date(snapshot1.updatedAt));
  });

  test('update is reflected when the task is retrieved again by id', () => {
    updateTask(taskId, { title: 'Persisted update' });
    const task = getTaskById(taskId);
    assert.equal(task.title, 'Persisted update');
  });

  test('throws Error when the task id does not exist', () => {
    assert.throws(
      () => updateTask('00000000-0000-0000-0000-000000000000', { status: 'done' }),
      Error
    );
  });

  test('throws TypeError when the patch is empty', () => {
    assert.throws(() => updateTask(taskId, {}), TypeError);
  });

  test('throws TypeError when patch contains an immutable field', () => {
    assert.throws(() => updateTask(taskId, { id: 'new-id' }), TypeError);
  });

  test('throws TypeError when category in patch is invalid', () => {
    assert.throws(() => updateTask(taskId, { category: '' }), TypeError);
  });

  test('throws TypeError when the id is not a string', () => {
    assert.throws(() => updateTask(123, { status: 'done' }), TypeError);
  });
});

describe('deleteTask', () => {
  test('removes the task and returns a snapshot of the deleted task', () => {
    const created = createTask({ title: 'Delete me' });
    const deleted = deleteTask(created.id);
    assert.equal(deleted.id, created.id);
    assert.equal(deleted.title, 'Delete me');
  });

  test('the deleted task can no longer be retrieved by id', () => {
    const created = createTask({ title: 'Gone soon' });
    deleteTask(created.id);
    assert.throws(() => getTaskById(created.id), Error);
  });

  test('the deleted task is absent from listTasks results', () => {
    const created = createTask({ title: 'Remove from list' });
    deleteTask(created.id);
    const all = listTasks();
    assert.ok(!all.some((t) => t.id === created.id));
  });

  test('throws Error when the id does not exist in the store', () => {
    assert.throws(
      () => deleteTask('00000000-0000-0000-0000-000000000000'),
      Error
    );
  });

  test('throws TypeError when the id is not a string', () => {
    assert.throws(() => deleteTask(null), TypeError);
    assert.throws(() => deleteTask(42), TypeError);
  });

  test('throws TypeError when id is an empty string', () => {
    assert.throws(() => deleteTask(''), TypeError);
  });
});

describe('category helpers', () => {
  let alphaId;
  let betaId;
  let gammaId;

  before(() => {
    alphaId = createTask({ title: 'Cat alpha', category: 'alpha' }).id;
    betaId = createTask({ title: 'Cat beta', category: 'beta' }).id;
    gammaId = createTask({ title: 'Cat alpha 2', category: 'alpha' }).id;
  });

  after(() => {
    for (const id of [alphaId, betaId, gammaId]) {
      try { deleteTask(id); } catch { /* already deleted */ }
    }
  });

  test('filterTasksByCategory returns only tasks in the requested category', () => {
    const alphaTasks = filterTasksByCategory('alpha');
    assert.ok(alphaTasks.length >= 2);
    assert.ok(alphaTasks.every((task) => task.category === 'alpha'));
  });

  test('filterTasksByCategory throws TypeError for invalid category input', () => {
    assert.throws(() => filterTasksByCategory(''), TypeError);
  });

  test('listCategories returns unique sorted category values', () => {
    const categories = listCategories();
    assert.ok(categories.includes('alpha'));
    assert.ok(categories.includes('beta'));
    assert.equal(new Set(categories).size, categories.length);
  });
});
