import { useQuery } from '@tanstack/react-query';

import type { TaskStatus, TaskType } from '@/features/tasks/types';
import { client } from '@/lib/hono';

interface useGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  type?: TaskType | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({ workspaceId, projectId, status, type, search, assigneeId, dueDate }: useGetTasksProps) => {
  const query = useQuery({
    queryKey: ['tasks', workspaceId, projectId, status, type, search, assigneeId, dueDate],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          type: type ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tasks.');

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
