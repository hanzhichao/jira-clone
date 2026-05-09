export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskType {
  TASK = 'TASK',
  BUG = 'BUG',
  TEST = 'TEST',
  STORY = 'STORY',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export type Task = {
  $id: string;
  id: string;
  name: string;
  status: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
  assigneeId?: string;
  assignee?: { $id: string; name: string; email?: string };
  projectId: string;
  project?: { $id: string; name: string; imageUrl?: string };
  workspaceId: string;
  position: number;
  dueDate?: string;
  description?: string;
  parentId?: string;
  links?: string;
  createdAt: string;
  updatedAt: string;
};
