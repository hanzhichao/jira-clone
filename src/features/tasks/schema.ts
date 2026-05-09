import { z } from 'zod';

import { TaskStatus, TaskPriority } from './types';

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, 'Task name is required.'),
  status: z.nativeEnum(TaskStatus, {
    required_error: 'Task status is required.',
  }),
  type: z.enum(['TASK', 'BUG', 'TEST', 'STORY']).default('TASK'),
  priority: z.nativeEnum(TaskPriority).optional(),
  workspaceId: z.string().trim().min(1, 'Workspace id is required.'),
  projectId: z.string().trim().min(1, 'Project id is required.'),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});
