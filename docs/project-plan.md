# Task Manager CLI Application - Project Plan

## Project Overview

A command-line task manager application built with Node.js that allows users to create, organize, and track tasks. Users can manage tasks with priorities and statuses, filter by these attributes, and sort results for efficient task management. All data is stored in memory during the session, making it lightweight and suitable for learning task management workflows.

## User Stories

1. **Create a new task**
   - As a user, I want to add a new task with a title, description, and initial priority
   - Acceptance: Task is created with title, description, priority, status (default: "todo"), createdAt, and updatedAt timestamps

2. **List all tasks**
   - As a user, I want to view all tasks in a formatted table
   - Acceptance: Display shows task ID, title, status, priority, and created date information

3. **View task details**
   - As a user, I want to see the full details of a specific task
   - Acceptance: Display includes title, description, status, priority, createdAt, and updatedAt timestamps

4. **Update a task**
   - As a user, I want to modify task properties (title, description, status, priority)
   - Acceptance: Selected fields are updated, updatedAt timestamp is refreshed, validation is applied

5. **Delete a task**
   - As a user, I want to remove a task from my list
   - Acceptance: Task is removed and deletion is confirmed, remaining tasks retain their IDs

6. **Filter tasks by status**
   - As a user, I want to view only tasks with a specific status (todo, in-progress, done)
   - Acceptance: List displays only matching tasks with task count

7. **Filter tasks by priority**
   - As a user, I want to view only high/medium/low priority tasks
   - Acceptance: List displays only matching tasks with proper filtering

8. **Sort tasks**
   - As a user, I want to sort tasks by priority (high→low) or creation date (newest→oldest)
   - Acceptance: Results display in requested order, sorting works with and without filters

## Data Model

**Task Entity**
- `id` (number): Unique identifier, auto-incremented
- `title` (string): Task name, required, max 100 chars
- `description` (string): Detailed task information, optional, max 500 chars
- `status` (enum: "todo" | "in-progress" | "done"): Task state, default "todo"
- `priority` (enum: "low" | "medium" | "high"): Task importance, default "medium"
- `createdAt` (Date): Creation timestamp, automatically set
- `updatedAt` (Date): Last modification timestamp, updated on changes

**TaskStore (in-memory)**
- `tasks` (array): Collection of Task objects
- `nextId` (number): Counter for generating unique IDs

## File Structure

```
src/
├── index.js           # CLI entry point, argument parsing, main loop
├── commands.js        # Command handlers (create, list, update, delete, view)
├── filters.js         # Filtering and sorting logic
├── store.js           # In-memory task storage and management
├── validators.js      # Input validation rules
└── utils.js           # Formatting, display helpers
```

## Implementation Phases

**Phase 1: Core CRUD** (40%)
- Basic task creation with validation
- List and view commands with formatted output
- Update and delete operations with confirmation
- In-memory storage implementation
- Basic command-line interface

**Phase 2: Filtering & Sorting** (35%)
- Status and priority filter logic
- Sort by priority and creation date
- Combined filter + sort operations
- Display filtered result counts

**Phase 3: CLI Polish & Validation** (25%)
- Comprehensive input validation
- Error handling and user-friendly messages
- Help documentation and usage info
- Command aliasing (e.g., `ls` for list, `rm` for delete)

## Error Handling Conventions

**Error Classes**
- `ValidationError`: Invalid input parameters (title, priority, status)
- `NotFoundError`: Task ID does not exist
- `InvalidOperationError`: Attempted operation violates business rules

**Error Responses**
- All errors include a descriptive message and error code
- CLI displays user-friendly error messages with suggestions
- Failed operations do not modify state
- Return non-zero exit codes on errors

**Logging**
- Log all CRUD operations (create, update, delete) with timestamp
- Log validation failures for debugging
- Output format: `[HH:MM:SS] [LEVEL] message` where LEVEL is INFO, WARN, or ERROR

## Input Validation Rules

**Task Title**
- Required, non-empty string
- Maximum 100 characters
- Trimmed of leading/trailing whitespace
- Error if missing or exceeds limit

**Task Description**
- Optional field
- Maximum 500 characters
- Trimmed of whitespace
- Empty string is valid

**Status**
- Must be one of: "todo", "in-progress", "done"
- Case-insensitive input converted to lowercase
- Default value: "todo" when creating tasks
- Error if invalid value provided

**Priority**
- Must be one of: "low", "medium", "high"
- Case-insensitive input converted to lowercase
- Default value: "medium" when creating tasks
- Error if invalid value provided

**Task ID**
- Must be a positive integer
- Must exist in task store
- Return `NotFoundError` if ID not found on update/delete/view

**Command Arguments**
- Validate argument count for each command
- Display usage help on invalid argument count
- Accept both short and long flag formats (e.g., `-p` and `--priority`)

**Data Sanitization**
- Reject null/undefined values for required fields
- Normalize whitespace in text fields
- Validate timestamp format on update operations
