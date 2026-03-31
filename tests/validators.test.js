import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCategory,
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateTaskId,
  validateTaskCreateInput,
  validateTaskUpdateInput,
  validateFilterOptions,
  validateSortOptions,
} from '../src/utils/validators.js';

describe('validateTitle', () => {
  test('returns the title unchanged for a clean input', () => {
    assert.equal(validateTitle('Write docs'), 'Write docs');
  });

  test('trims leading and trailing whitespace', () => {
    assert.equal(validateTitle('  Buy milk  '), 'Buy milk');
  });

  test('accepts a title of exactly 100 characters', () => {
    const exactly100 = 'a'.repeat(100);
    assert.equal(validateTitle(exactly100), exactly100);
  });

  test('throws TypeError when title is not a string', () => {
    assert.throws(() => validateTitle(42), TypeError);
    assert.throws(() => validateTitle(null), TypeError);
    assert.throws(() => validateTitle(undefined), TypeError);
  });

  test('throws TypeError when title is an empty string', () => {
    assert.throws(() => validateTitle(''), TypeError);
  });

  test('throws TypeError when title is whitespace only', () => {
    assert.throws(() => validateTitle('   '), TypeError);
  });

  test('throws TypeError when title exceeds 100 characters', () => {
    assert.throws(() => validateTitle('a'.repeat(101)), TypeError);
  });
});

describe('validateDescription', () => {
  test('returns empty string when called without arguments', () => {
    assert.equal(validateDescription(), '');
  });

  test('returns empty string for explicit empty string', () => {
    assert.equal(validateDescription(''), '');
  });

  test('trims whitespace from valid description', () => {
    assert.equal(validateDescription('  Call the dentist  '), 'Call the dentist');
  });

  test('accepts a description of exactly 500 characters', () => {
    const exactly500 = 'b'.repeat(500);
    assert.equal(validateDescription(exactly500), exactly500);
  });

  test('throws TypeError when description is not a string', () => {
    assert.throws(() => validateDescription(42), TypeError);
    assert.throws(() => validateDescription({}), TypeError);
  });

  test('throws TypeError when description exceeds 500 characters', () => {
    assert.throws(() => validateDescription('b'.repeat(501)), TypeError);
  });
});

describe('validateCategory', () => {
  test('returns default category when called without arguments', () => {
    assert.equal(validateCategory(), 'general');
  });

  test('trims whitespace from category', () => {
    assert.equal(validateCategory('  Work  '), 'Work');
  });

  test('accepts category of exactly 50 characters', () => {
    const exactly50 = 'c'.repeat(50);
    assert.equal(validateCategory(exactly50), exactly50);
  });

  test('throws TypeError when category is not a string', () => {
    assert.throws(() => validateCategory(42), TypeError);
    assert.throws(() => validateCategory(null), TypeError);
  });

  test('throws TypeError when category is empty', () => {
    assert.throws(() => validateCategory(''), TypeError);
    assert.throws(() => validateCategory('   '), TypeError);
  });

  test('throws TypeError when category exceeds 50 characters', () => {
    assert.throws(() => validateCategory('c'.repeat(51)), TypeError);
  });
});

describe('validateStatus', () => {
  test('accepts "todo" and returns it unchanged', () => {
    assert.equal(validateStatus('todo'), 'todo');
  });

  test('accepts "in-progress" and returns it unchanged', () => {
    assert.equal(validateStatus('in-progress'), 'in-progress');
  });

  test('accepts "done" and returns it unchanged', () => {
    assert.equal(validateStatus('done'), 'done');
  });

  test('normalizes uppercase "TODO" to "todo"', () => {
    assert.equal(validateStatus('TODO'), 'todo');
  });

  test('normalizes mixed-case "In-Progress" to "in-progress"', () => {
    assert.equal(validateStatus('In-Progress'), 'in-progress');
  });

  test('normalizes uppercase "DONE" to "done"', () => {
    assert.equal(validateStatus('DONE'), 'done');
  });

  test('returns default "todo" when called without arguments', () => {
    assert.equal(validateStatus(), 'todo');
  });

  test('throws TypeError for unknown status value', () => {
    assert.throws(() => validateStatus('pending'), TypeError);
    assert.throws(() => validateStatus('complete'), TypeError);
    assert.throws(() => validateStatus('active'), TypeError);
  });

  test('throws TypeError when status is not a string', () => {
    assert.throws(() => validateStatus(1), TypeError);
    assert.throws(() => validateStatus(null), TypeError);
  });
});

describe('validatePriority', () => {
  test('accepts "low" and returns it unchanged', () => {
    assert.equal(validatePriority('low'), 'low');
  });

  test('accepts "medium" and returns it unchanged', () => {
    assert.equal(validatePriority('medium'), 'medium');
  });

  test('accepts "high" and returns it unchanged', () => {
    assert.equal(validatePriority('high'), 'high');
  });

  test('normalizes uppercase "HIGH" to "high"', () => {
    assert.equal(validatePriority('HIGH'), 'high');
  });

  test('normalizes uppercase "MEDIUM" to "medium"', () => {
    assert.equal(validatePriority('MEDIUM'), 'medium');
  });

  test('normalizes uppercase "LOW" to "low"', () => {
    assert.equal(validatePriority('LOW'), 'low');
  });

  test('returns default "medium" when called without arguments', () => {
    assert.equal(validatePriority(), 'medium');
  });

  test('throws TypeError for unknown priority value', () => {
    assert.throws(() => validatePriority('critical'), TypeError);
    assert.throws(() => validatePriority('urgent'), TypeError);
  });

  test('throws TypeError when priority is not a string', () => {
    assert.throws(() => validatePriority(true), TypeError);
    assert.throws(() => validatePriority(null), TypeError);
  });
});

describe('validateTaskId', () => {
  test('returns a UUID string unchanged', () => {
    const uuid = '3b2f8fca-f58c-4e95-a998-78078a8e0456';
    assert.equal(validateTaskId(uuid), uuid);
  });

  test('trims surrounding whitespace from the id', () => {
    assert.equal(validateTaskId(' task-1 '), 'task-1');
  });

  test('throws TypeError when id is not a string', () => {
    assert.throws(() => validateTaskId(42), TypeError);
    assert.throws(() => validateTaskId(null), TypeError);
    assert.throws(() => validateTaskId(undefined), TypeError);
  });

  test('throws TypeError when id is an empty string', () => {
    assert.throws(() => validateTaskId(''), TypeError);
  });

  test('throws TypeError when id is whitespace only', () => {
    assert.throws(() => validateTaskId('   '), TypeError);
  });
});

describe('validateTaskCreateInput', () => {
  test('returns normalized payload with defaults for all optional fields', () => {
    const result = validateTaskCreateInput({ title: 'Ship feature' });
    assert.equal(result.title, 'Ship feature');
    assert.equal(result.description, '');
    assert.equal(result.status, 'todo');
    assert.equal(result.priority, 'medium');
    assert.equal(result.category, 'general');
  });

  test('preserves all explicitly provided optional fields', () => {
    const result = validateTaskCreateInput({
      title: 'Fix bug',
      description: 'Repro steps here',
      priority: 'high',
      status: 'done',
      category: 'bugs',
    });
    assert.equal(result.title, 'Fix bug');
    assert.equal(result.description, 'Repro steps here');
    assert.equal(result.status, 'done');
    assert.equal(result.priority, 'high');
    assert.equal(result.category, 'bugs');
  });

  test('normalizes title whitespace', () => {
    const result = validateTaskCreateInput({ title: '  Padded  ' });
    assert.equal(result.title, 'Padded');
  });

  test('throws TypeError when input is null', () => {
    assert.throws(() => validateTaskCreateInput(null), TypeError);
  });

  test('throws TypeError when input is an array', () => {
    assert.throws(() => validateTaskCreateInput([]), TypeError);
  });

  test('throws TypeError when input is a string', () => {
    assert.throws(() => validateTaskCreateInput('string'), TypeError);
  });

  test('throws TypeError when title is missing from input', () => {
    assert.throws(() => validateTaskCreateInput({ priority: 'high' }), TypeError);
  });

  test('throws TypeError when title is empty', () => {
    assert.throws(() => validateTaskCreateInput({ title: '' }), TypeError);
  });
});

describe('validateTaskUpdateInput', () => {
  test('returns normalized patch for a valid status update', () => {
    const result = validateTaskUpdateInput({ status: 'done' });
    assert.equal(result.status, 'done');
  });

  test('returns normalized patch for multiple valid fields', () => {
    const result = validateTaskUpdateInput({ title: 'Refactor', priority: 'low' });
    assert.equal(result.title, 'Refactor');
    assert.equal(result.priority, 'low');
  });

  test('allows updating all four mutable fields at once', () => {
    const result = validateTaskUpdateInput({
      title: 'New title',
      description: 'New desc',
      status: 'in-progress',
      priority: 'high',
      category: 'work',
    });
    assert.equal(result.title, 'New title');
    assert.equal(result.description, 'New desc');
    assert.equal(result.status, 'in-progress');
    assert.equal(result.priority, 'high');
    assert.equal(result.category, 'work');
  });

  test('trims whitespace from title in patch', () => {
    const result = validateTaskUpdateInput({ title: '  Trimmed  ' });
    assert.equal(result.title, 'Trimmed');
  });

  test('throws TypeError when input is not a plain object', () => {
    assert.throws(() => validateTaskUpdateInput(null), TypeError);
    assert.throws(() => validateTaskUpdateInput('string'), TypeError);
    assert.throws(() => validateTaskUpdateInput([]), TypeError);
  });

  test('throws TypeError when patch object is empty', () => {
    assert.throws(() => validateTaskUpdateInput({}), TypeError);
  });

  test('throws TypeError when patch contains the immutable "id" field', () => {
    assert.throws(() => validateTaskUpdateInput({ id: 'new-id' }), TypeError);
  });

  test('throws TypeError when patch contains the immutable "createdAt" field', () => {
    assert.throws(() => validateTaskUpdateInput({ createdAt: new Date().toISOString() }), TypeError);
  });

  test('throws TypeError when patch contains an unknown field', () => {
    assert.throws(() => validateTaskUpdateInput({ foo: 'bar' }), TypeError);
  });

  test('throws TypeError when category in patch is invalid', () => {
    assert.throws(() => validateTaskUpdateInput({ category: '' }), TypeError);
  });
});

describe('validateFilterOptions', () => {
  test('returns empty object for empty options', () => {
    assert.deepEqual(validateFilterOptions({}), {});
  });

  test('returns empty object when called without arguments', () => {
    assert.deepEqual(validateFilterOptions(), {});
  });

  test('normalizes status filter from uppercase', () => {
    const result = validateFilterOptions({ status: 'TODO' });
    assert.equal(result.status, 'todo');
  });

  test('normalizes priority filter from uppercase', () => {
    const result = validateFilterOptions({ priority: 'HIGH' });
    assert.equal(result.priority, 'high');
  });

  test('includes both status and priority when both are provided', () => {
    const result = validateFilterOptions({ status: 'done', priority: 'low' });
    assert.equal(result.status, 'done');
    assert.equal(result.priority, 'low');
  });

  test('includes category when provided', () => {
    const result = validateFilterOptions({ category: 'work' });
    assert.equal(result.category, 'work');
  });

  test('throws TypeError when options is null', () => {
    assert.throws(() => validateFilterOptions(null), TypeError);
  });

  test('throws TypeError when options is a string', () => {
    assert.throws(() => validateFilterOptions('string'), TypeError);
  });

  test('throws TypeError when status value is invalid', () => {
    assert.throws(() => validateFilterOptions({ status: 'invalid' }), TypeError);
  });

  test('throws TypeError when priority value is invalid', () => {
    assert.throws(() => validateFilterOptions({ priority: 'critical' }), TypeError);
  });

  test('throws TypeError when category value is invalid', () => {
    assert.throws(() => validateFilterOptions({ category: '' }), TypeError);
  });
});

describe('validateSortOptions', () => {
  test('returns default sortBy "createdAt" and direction "desc" for empty options', () => {
    const result = validateSortOptions({});
    assert.equal(result.sortBy, 'createdAt');
    assert.equal(result.direction, 'desc');
  });

  test('returns defaults when called without arguments', () => {
    const result = validateSortOptions();
    assert.equal(result.sortBy, 'createdAt');
    assert.equal(result.direction, 'desc');
  });

  test('accepts sortBy "priority" with default direction', () => {
    const result = validateSortOptions({ sortBy: 'priority' });
    assert.equal(result.sortBy, 'priority');
    assert.equal(result.direction, 'desc');
  });

  test('accepts explicit sortBy and direction', () => {
    const result = validateSortOptions({ sortBy: 'priority', direction: 'asc' });
    assert.equal(result.sortBy, 'priority');
    assert.equal(result.direction, 'asc');
  });

  test('accepts createdAt with ascending direction', () => {
    const result = validateSortOptions({ sortBy: 'createdAt', direction: 'asc' });
    assert.equal(result.sortBy, 'createdAt');
    assert.equal(result.direction, 'asc');
  });

  test('throws TypeError for invalid sortBy value', () => {
    assert.throws(() => validateSortOptions({ sortBy: 'title' }), TypeError);
    assert.throws(() => validateSortOptions({ sortBy: 'updatedAt' }), TypeError);
  });

  test('throws TypeError for invalid direction value', () => {
    assert.throws(() => validateSortOptions({ direction: 'random' }), TypeError);
    assert.throws(() => validateSortOptions({ direction: 'up' }), TypeError);
  });

  test('throws TypeError when options is not a plain object', () => {
    assert.throws(() => validateSortOptions(null), TypeError);
    assert.throws(() => validateSortOptions('string'), TypeError);
  });
});
