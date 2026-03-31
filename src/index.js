import {
  createTask,
  deleteTask,
  filterTasksByCategory,
  getTaskById,
  listCategories,
  listTasks,
  updateTask
} from './services/taskService.js';
import { formatTask, formatTaskList } from './utils/colors.js';

/**
 * Demonstrates Task Manager features from the command line.
 */
function main() {
  try {
    console.log('Create tasks');
    const taskA = createTask({
      title: 'Write workshop plan',
      description: 'Prepare milestones and acceptance criteria.',
      priority: 'high',
      category: 'planning'
    });
    const taskB = createTask({
      title: 'Review pull request',
      description: 'Check comments and push final fixes.',
      status: 'in-progress',
      priority: 'medium',
      category: 'development'
    });
    const taskC = createTask({
      title: 'Clean inbox',
      description: 'Archive outdated threads.',
      status: 'todo',
      priority: 'low',
      category: 'admin'
    });
    console.log(formatTask(taskA));
    console.log(formatTask(taskB));
    console.log(formatTask(taskC));

    console.log('\nList all tasks');
    console.log(formatTaskList(listTasks()));

    console.log('\nFilter by status: todo');
    console.log(formatTaskList(listTasks({ status: 'todo' })));

    console.log('\nFilter by priority: high');
    console.log(formatTaskList(listTasks({ priority: 'high' })));

    console.log('\nFilter by category: planning');
    console.log(formatTaskList(filterTasksByCategory('planning')));

    console.log('\nUnique categories');
    console.log(`  ${listCategories().join(', ')}`);

    console.log('\nSort by priority (high to low)');
    console.log(formatTaskList(listTasks({ sortBy: 'priority', direction: 'desc' })));

    console.log('\nSort by creation date (oldest first)');
    console.log(formatTaskList(listTasks({ sortBy: 'createdAt', direction: 'asc' })));

    console.log('\nUpdate first task');
    const updatedTask = updateTask(taskA.id, {
      status: 'done',
      priority: 'medium',
      category: 'completed',
      description: 'Plan reviewed and finalized.'
    });
    console.log(formatTask(updatedTask));

    console.log('\nGet updated task by id');
    console.log(formatTask(getTaskById(taskA.id)));

    console.log('\nDelete one task');
    console.log(formatTask(deleteTask(taskB.id)));

    console.log('\nList tasks after deletion');
    console.log(formatTaskList(listTasks()));
  } catch (error) {
    console.error('Task Manager demo failed:', error.message);
    process.exitCode = 1;
  }
}

main();
