import { Task } from '../models/task.js';
import {
  validateFilterOptions,
  validateSortOptions,
  validateTaskCreateInput,
  validateTaskId,
  validateTaskUpdateInput
} from '../utils/validators.js';

const state = {
  tasks: []
};

const priorityRank = {
  high: 3,
  medium: 2,
  low: 1
};

/**
 * Creates and stores a new task.
 *
 * @param {object} input - Create payload.
 * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}} Created task.
 */
export function createTask(input) {
  const normalizedInput = validateTaskCreateInput(input);
  const task = new Task(normalizedInput);
  state.tasks.push(task);
  return task.toJSON();
}

/**
 * Returns a single task by id.
 *
 * @param {string} id - Task id.
 * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}} Task snapshot.
 */
export function getTaskById(id) {
  const normalizedId = validateTaskId(id);
  const task = findTaskById(normalizedId);
  return task.toJSON();
}

/**
 * Lists tasks with optional filtering and sorting.
 *
 * @param {{status?: string, priority?: string, sortBy?: string, direction?: string}} [options={}] - Query options.
 * @returns {Array<{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}>} Task snapshots.
 */
export function listTasks(options = {}) {
  const filters = validateFilterOptions(options);
  const sort = validateSortOptions(options);

  const snapshots = state.tasks.map((task) => task.toJSON());
  const filtered = applyFilters(snapshots, filters);
  return applySort(filtered, sort);
}

/**
 * Returns tasks that match a category value.
 *
 * @param {string} category - Category value.
 * @returns {Array<{id: string, title: string, description: string, status: string, priority: string, category: string, createdAt: string, updatedAt: string}>} Task snapshots.
 */
export function filterTasksByCategory(category) {
  return listTasks({ category });
}

/**
 * Lists all unique categories currently present in tasks.
 *
 * @returns {string[]} Sorted unique category values.
 */
export function listCategories() {
  return [...new Set(state.tasks.map((task) => task.category))].sort((a, b) => a.localeCompare(b));
}

/**
 * Updates a task by id.
 *
 * @param {string} id - Task id.
 * @param {object} patch - Mutable task fields.
 * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}} Updated task.
 */
export function updateTask(id, patch) {
  const normalizedId = validateTaskId(id);
  const normalizedPatch = validateTaskUpdateInput(patch);
  const task = findTaskById(normalizedId);
  task.update(normalizedPatch);
  return task.toJSON();
}

/**
 * Deletes a task by id.
 *
 * @param {string} id - Task id.
 * @returns {{id: string, title: string, description: string, status: string, priority: string, createdAt: string, updatedAt: string}} Deleted task.
 */
export function deleteTask(id) {
  const normalizedId = validateTaskId(id);
  const taskIndex = findTaskIndexById(normalizedId);
  const [deletedTask] = state.tasks.splice(taskIndex, 1);
  return deletedTask.toJSON();
}

function applyFilters(tasks, filters) {
  let filtered = [...tasks];

  if (filters.status) {
    filtered = filtered.filter((task) => task.status === filters.status);
  }

  if (filters.priority) {
    filtered = filtered.filter((task) => task.priority === filters.priority);
  }

  if (filters.category) {
    filtered = filtered.filter((task) => task.category === filters.category);
  }

  return filtered;
}

function applySort(tasks, sort) {
  const directionFactor = sort.direction === 'asc' ? 1 : -1;
  const sorted = [...tasks];

  if (sort.sortBy === 'priority') {
    sorted.sort((a, b) => (priorityRank[a.priority] - priorityRank[b.priority]) * directionFactor);
    return sorted;
  }

  sorted.sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();
    return (first - second) * directionFactor;
  });
  return sorted;
}

function findTaskById(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }
  return task;
}

function findTaskIndexById(id) {
  const taskIndex = state.tasks.findIndex((item) => item.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task not found: ${id}`);
  }
  return taskIndex;
}
