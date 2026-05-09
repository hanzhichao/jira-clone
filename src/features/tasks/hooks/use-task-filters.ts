import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { TaskStatus, TaskType } from '@/features/tasks/types';

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    type: parseAsStringEnum(Object.values(TaskType)),
    assigneeId: parseAsString,
    search: parseAsString,
    dueDate: parseAsString,
  });
};
