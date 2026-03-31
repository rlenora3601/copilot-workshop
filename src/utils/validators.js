/**
 * Validates and normalizes a task title.
 *
 * @param {string} title - Raw title input.
 * @returns {string} Normalized title.
 * @throws {TypeError} When title is not a valid string between 1 and 100 characters.
 * @example
 * validateTitle('  Buy milk  ');
 * // => 'Buy milk'
 * @example
 * validateTitle('Write docs');
 * // => 'Write docs'
 */
export function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new TypeError('Invalid input: title must be a string.');
  }

  const normalized = title.trim();
  if (normalized.length === 0) {
    throw new TypeError('Invalid input: title is required.');
  }

  if (normalized.length > 100) {
    throw new TypeError('Invalid input: title must be 100 characters or fewer.');
  }

  return normalized;
}

/**
 * Validates and normalizes a task description.
 *
 * @param {string} [description=''] - Raw description input.
 * @returns {string} Normalized description.
 * @throws {TypeError} When description is not a string or exceeds 500 characters.
 * @example
 * validateDescription('  Call the dentist  ');
 * // => 'Call the dentist'
 * @example
 * validateDescription();
 * // => ''
 */
export function validateDescription(description = '') {
  if (typeof description !== 'string') {
    throw new TypeError('Invalid input: description must be a string.');
  }

  const normalized = description.trim();
  if (normalized.length > 500) {
    throw new TypeError('Invalid input: description must be 500 characters or fewer.');
  }

  return normalized;
}

/**
 * Validates and normalizes a task category.
 *
 * @param {string} [category='general'] - Raw category input.
 * @returns {string} Normalized category.
 * @throws {TypeError} When category is not a string, is empty, or exceeds 50 characters.
 * @example
 * validateCategory('  Work  ');
 * // => 'Work'
 * @example
 * validateCategory();
 * // => 'general'
 */
export function validateCategory(category = 'general') {
  if (typeof category !== 'string') {
    throw new TypeError('Invalid input: category must be a string.');
  }

  const normalized = category.trim();
  if (normalized.length === 0) {
    throw new TypeError('Invalid input: category must be a non-empty string.');
  }

  if (normalized.length > 50) {
    throw new TypeError('Invalid input: category must be 50 characters or fewer.');
  }

  return normalized;
}

/**
 * Validates and normalizes task status.
 *
 * @param {string} [status='todo'] - Raw status input.
 * @returns {'todo'|'in-progress'|'done'} Normalized status.
 * @throws {TypeError} When status is not one of: todo, in-progress, done.
 * @example
 * validateStatus('IN-PROGRESS');
 * // => 'in-progress'
 * @example
 * validateStatus();
 * // => 'todo'
 */
export function validateStatus(status = 'todo') {
  if (typeof status !== 'string') {
    throw new TypeError('Invalid input: status must be a string.');
  }

  const normalized = status.trim().toLowerCase();
  const allowed = new Set(['todo', 'in-progress', 'done']);
  if (!allowed.has(normalized)) {
    throw new TypeError('Invalid input: status must be one of todo, in-progress, done.');
  }

  return normalized;
}

/**
 * Validates and normalizes task priority.
 *
 * @param {string} [priority='medium'] - Raw priority input.
 * @returns {'low'|'medium'|'high'} Normalized priority.
 * @throws {TypeError} When priority is not one of: low, medium, high.
 * @example
 * validatePriority('HIGH');
 * // => 'high'
 * @example
 * validatePriority();
 * // => 'medium'
 */
export function validatePriority(priority = 'medium') {
  if (typeof priority !== 'string') {
    throw new TypeError('Invalid input: priority must be a string.');
  }

  const normalized = priority.trim().toLowerCase();
  const allowed = new Set(['low', 'medium', 'high']);
  if (!allowed.has(normalized)) {
    throw new TypeError('Invalid input: priority must be one of low, medium, high.');
  }

  return normalized;
}

/**
 * Validates a task id.
 *
 * @param {string} id - Task identifier.
 * @returns {string} The normalized id.
 * @throws {TypeError} When id is not a non-empty string.
 * @example
 * validateTaskId('3b2f8fca-f58c-4e95-a998-78078a8e0456');
 * // => '3b2f8fca-f58c-4e95-a998-78078a8e0456'
 * @example
 * validateTaskId(' task-1 ');
 * // => 'task-1'
 */
export function validateTaskId(id) {
  if (typeof id !== 'string') {
    throw new TypeError('Invalid input: id must be a string.');
  }

  const normalized = id.trim();
  if (normalized.length === 0) {
    throw new TypeError('Invalid input: id must be a non-empty string.');
  }

  return normalized;
}

/**
 * Validates and normalizes task create input.
 *
 * @param {object} input - Create input payload.
 * @returns {{title: string, description: string, status: 'todo'|'in-progress'|'done', priority: 'low'|'medium'|'high', category: string}} Normalized create input.
 * @throws {TypeError} When input is not a plain object or fields are invalid.
 * @example
 * validateTaskCreateInput({ title: 'Ship feature' });
 * // => { title: 'Ship feature', description: '', status: 'todo', priority: 'medium' }
 * @example
 * validateTaskCreateInput({ title: 'Fix bug', priority: 'high', status: 'done' });
 * // => { title: 'Fix bug', description: '', status: 'done', priority: 'high' }
 */
export function validateTaskCreateInput(input) {
  if (!isPlainObject(input)) {
    throw new TypeError('Invalid input: create payload must be a plain object.');
  }

  return {
    title: validateTitle(input.title),
    description: validateDescription(input.description ?? ''),
    status: validateStatus(input.status ?? 'todo'),
    priority: validatePriority(input.priority ?? 'medium'),
    category: validateCategory(input.category ?? 'general')
  };
}

/**
 * Validates and normalizes task update input.
 *
 * @param {object} input - Update patch payload.
 * @returns {{title?: string, description?: string, status?: 'todo'|'in-progress'|'done', priority?: 'low'|'medium'|'high', category?: string}} Normalized patch.
 * @throws {TypeError} When payload is invalid, empty, or contains unsupported fields.
 * @example
 * validateTaskUpdateInput({ status: 'done' });
 * // => { status: 'done' }
 * @example
 * validateTaskUpdateInput({ title: 'Refactor', priority: 'low' });
 * // => { title: 'Refactor', priority: 'low' }
 */
export function validateTaskUpdateInput(input) {
  if (!isPlainObject(input)) {
    throw new TypeError('Invalid input: update payload must be a plain object.');
  }

  const allowedKeys = new Set(['title', 'description', 'status', 'priority', 'category']);
  const keys = Object.keys(input);
  if (keys.length === 0) {
    throw new TypeError('Invalid input: update payload must include at least one mutable field.');
  }

  for (const key of keys) {
    if (!allowedKeys.has(key)) {
      throw new TypeError(`Invalid input: unsupported update field "${key}".`);
    }
  }

  const patch = {};
  if (Object.hasOwn(input, 'title')) {
    patch.title = validateTitle(input.title);
  }
  if (Object.hasOwn(input, 'description')) {
    patch.description = validateDescription(input.description);
  }
  if (Object.hasOwn(input, 'status')) {
    patch.status = validateStatus(input.status);
  }
  if (Object.hasOwn(input, 'priority')) {
    patch.priority = validatePriority(input.priority);
  }
  if (Object.hasOwn(input, 'category')) {
    patch.category = validateCategory(input.category);
  }

  return patch;
}

/**
 * Validates and normalizes filter options.
 *
 * @param {object} [options={}] - Optional filter payload.
 * @returns {{status?: 'todo'|'in-progress'|'done', priority?: 'low'|'medium'|'high', category?: string}} Normalized filters.
 * @throws {TypeError} When options is not a plain object.
 * @example
 * validateFilterOptions({ status: 'todo' });
 * // => { status: 'todo' }
 * @example
 * validateFilterOptions({ priority: 'HIGH' });
 * // => { priority: 'high' }
 */
export function validateFilterOptions(options = {}) {
  if (!isPlainObject(options)) {
    throw new TypeError('Invalid input: filter options must be a plain object.');
  }

  const normalized = {};
  if (Object.hasOwn(options, 'status')) {
    normalized.status = validateStatus(options.status);
  }
  if (Object.hasOwn(options, 'priority')) {
    normalized.priority = validatePriority(options.priority);
  }
  if (Object.hasOwn(options, 'category')) {
    normalized.category = validateCategory(options.category);
  }

  return normalized;
}

/**
 * Validates and normalizes sort options.
 *
 * @param {object} [options={}] - Optional sort payload.
 * @returns {{sortBy: 'priority'|'createdAt', direction: 'asc'|'desc'}} Normalized sort options.
 * @throws {TypeError} When options are invalid.
 * @example
 * validateSortOptions({ sortBy: 'priority' });
 * // => { sortBy: 'priority', direction: 'desc' }
 * @example
 * validateSortOptions({ sortBy: 'createdAt', direction: 'asc' });
 * // => { sortBy: 'createdAt', direction: 'asc' }
 */
export function validateSortOptions(options = {}) {
  if (!isPlainObject(options)) {
    throw new TypeError('Invalid input: sort options must be a plain object.');
  }

  const sortBy = options.sortBy ?? 'createdAt';
  const direction = options.direction ?? 'desc';

  if (typeof sortBy !== 'string') {
    throw new TypeError('Invalid input: sortBy must be a string.');
  }
  if (typeof direction !== 'string') {
    throw new TypeError('Invalid input: direction must be a string.');
  }

  const normalizedSortBy = sortBy.trim();
  const normalizedDirection = direction.trim().toLowerCase();

  if (normalizedSortBy !== 'priority' && normalizedSortBy !== 'createdAt') {
    throw new TypeError('Invalid input: sortBy must be "priority" or "createdAt".');
  }

  if (normalizedDirection !== 'asc' && normalizedDirection !== 'desc') {
    throw new TypeError('Invalid input: direction must be "asc" or "desc".');
  }

  return {
    sortBy: normalizedSortBy,
    direction: normalizedDirection
  };
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
