import { randomUUID } from 'node:crypto';
import {
  validateCategory,
  validateDescription,
  validatePriority,
  validateStatus,
  validateTaskId,
  validateTaskUpdateInput,
  validateTitle
} from '../utils/validators.js';

/**
 * Represents a single task with immutable identity and timestamps.
 */
export class Task {
  /**
   * Creates a task instance.
   *
   * @param {object} input - Task payload.
   * @param {string} [input.id] - Existing id for rehydration scenarios.
   * @param {string} input.title - Task title.
   * @param {string} [input.description] - Task description.
   * @param {string} [input.status] - Task status.
   * @param {string} [input.priority] - Task priority.
  * @param {string} [input.category] - Task category.
   * @param {string} [input.createdAt] - ISO timestamp for creation.
   * @param {string} [input.updatedAt] - ISO timestamp for last update.
   */
  constructor(input) {
    if (!isPlainObject(input)) {
      throw new TypeError('Invalid input: task constructor expects a plain object.');
    }

    const now = new Date().toISOString();

    this.id = Object.hasOwn(input, 'id') ? validateTaskId(input.id) : randomUUID();
    this.title = validateTitle(input.title);
    this.description = validateDescription(input.description ?? '');
    this.status = validateStatus(input.status ?? 'todo');
    this.priority = validatePriority(input.priority ?? 'medium');
    this.category = validateCategory(input.category ?? 'general');
    this.createdAt = Object.hasOwn(input, 'createdAt') ? validateIsoTimestamp(input.createdAt, 'createdAt') : now;
    this.updatedAt = Object.hasOwn(input, 'updatedAt') ? validateIsoTimestamp(input.updatedAt, 'updatedAt') : this.createdAt;
  }

  /**
   * Applies a validated patch to mutable fields and refreshes updatedAt.
   *
   * @param {object} patch - Mutable task fields.
   * @returns {Task} The current task instance.
   */
  update(patch) {
    const normalizedPatch = validateTaskUpdateInput(patch);

    if (Object.hasOwn(normalizedPatch, 'title')) {
      this.title = normalizedPatch.title;
    }
    if (Object.hasOwn(normalizedPatch, 'description')) {
      this.description = normalizedPatch.description;
    }
    if (Object.hasOwn(normalizedPatch, 'status')) {
      this.status = normalizedPatch.status;
    }
    if (Object.hasOwn(normalizedPatch, 'priority')) {
      this.priority = normalizedPatch.priority;
    }
    if (Object.hasOwn(normalizedPatch, 'category')) {
      this.category = normalizedPatch.category;
    }

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Creates a copy of the task with a fresh id and timestamps.
   *
   * @returns {Task} A cloned task instance.
   */
  clone() {
    return new Task({
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      category: this.category
    });
  }

  /**
   * Converts the task to a plain serializable object.
   *
  * @returns {{id: string, title: string, description: string, status: 'todo'|'in-progress'|'done', priority: 'low'|'medium'|'high', category: string, createdAt: string, updatedAt: string}} Task snapshot.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateIsoTimestamp(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`Invalid input: ${fieldName} must be an ISO date string.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid input: ${fieldName} must be a valid ISO date string.`);
  }

  return date.toISOString();
}
