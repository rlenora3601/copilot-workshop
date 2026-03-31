import chalk from 'chalk';

/**
 * Formats a task status value with a terminal color.
 *
 * - "done"        → green
 * - "in-progress" → yellow
 * - "todo"        → red
 *
 * @param {string} status - The task status value.
 * @returns {string} The status string wrapped in the appropriate chalk color.
 * @example colorStatus('done')        // green 'done'
 * @example colorStatus('in-progress') // yellow 'in-progress'
 */
export function colorStatus(status) {
  switch (status) {
    case 'done':        return chalk.green(status);
    case 'in-progress': return chalk.yellow(status);
    case 'todo':        return chalk.red(status);
    default:            return status;
  }
}

/**
 * Formats a task priority value with a terminal color.
 *
 * - "high"   → bold red
 * - "medium" → bold yellow
 * - "low"    → dim text
 *
 * @param {string} priority - The task priority value.
 * @returns {string} The priority string wrapped in the appropriate chalk style.
 * @example colorPriority('high')   // bold red 'high'
 * @example colorPriority('low')    // dim 'low'
 */
export function colorPriority(priority) {
  switch (priority) {
    case 'high':   return chalk.bold.red(priority);
    case 'medium': return chalk.bold.yellow(priority);
    case 'low':    return chalk.dim(priority);
    default:       return priority;
  }
}

/**
 * Formats a task as a single human-readable labeled string with colors applied
 * to status and priority fields.
 *
 * @param {object} task - A plain task object (from toJSON or listTasks).
 * @param {string} task.id        - Task unique identifier.
 * @param {string} task.title     - Task title.
 * @param {string} task.status    - Task status.
 * @param {string} task.priority  - Task priority.
 * @param {string} task.description - Task description.
 * @returns {string} A formatted multi-line string ready for console output.
 * @example formatTask(task) // returns colored multi-line task summary
 */
export function formatTask(task) {
  return [
    `  id:          ${task.id}`,
    `  title:       ${chalk.bold(task.title)}`,
    `  description: ${task.description}`,
    `  status:      ${colorStatus(task.status)}`,
    `  priority:    ${colorPriority(task.priority)}`,
    `  createdAt:   ${new Date(task.createdAt).toISOString()}`,
    `  updatedAt:   ${new Date(task.updatedAt).toISOString()}`,
  ].join('\n');
}

/**
 * Formats an array of tasks as a numbered list with colored status and priority.
 *
 * @param {object[]} tasks - Array of plain task objects.
 * @returns {string} A formatted string listing all tasks, or a message when empty.
 * @example formatTaskList([])       // returns '  (no tasks)'
 * @example formatTaskList([task])   // returns numbered colored task entries
 */
export function formatTaskList(tasks) {
  if (tasks.length === 0) return '  (no tasks)';
  return tasks
    .map((t, i) => `[${i + 1}] ${chalk.bold(t.title)}  status=${colorStatus(t.status)}  priority=${colorPriority(t.priority)}  id=${t.id}`)
    .join('\n');
}
