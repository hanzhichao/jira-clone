'use client';

import { Folder, ListChecks, UserIcon, Tag } from 'lucide-react';

import { DatePicker } from '@/components/date-picker';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useTaskFilters } from '@/features/tasks/hooks/use-task-filters';
import { TaskStatus, TaskType } from '@/features/tasks/types';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const { t } = useI18n();
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  const [{ status, type, assigneeId, projectId, dueDate }, setFilters] = useTaskFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === 'all' ? null : (value as TaskStatus) });
  };

  const onTypeChange = (value: string) => {
    setFilters({ type: value === 'all' ? null : (value as TaskType) });
  };

  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === 'all' ? null : (value as string) });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === 'all' ? null : (value as string) });
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Select defaultValue={status ?? undefined} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <ListChecks className="mr-2 size-4" />
            <SelectValue placeholder={t('filter.all')} />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{t('filter.all')}</SelectItem>
          <SelectSeparator />

          <SelectItem value={TaskStatus.BACKLOG}>{t('task.backlog')}</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>{t('task.inProgress')}</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>{t('task.inReview')}</SelectItem>
          <SelectItem value={TaskStatus.TODO}>{t('task.todo')}</SelectItem>
          <SelectItem value={TaskStatus.DONE}>{t('task.done')}</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={type ?? undefined} onValueChange={onTypeChange}>
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <Tag className="mr-2 size-4" />
            <SelectValue placeholder={t('task.type')} />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{t('filter.all')}</SelectItem>
          <SelectSeparator />

          <SelectItem value={TaskType.TASK}>{t('task.taskType')}</SelectItem>
          <SelectItem value={TaskType.BUG}>{t('task.bugType')}</SelectItem>
          <SelectItem value={TaskType.TEST}>{t('task.testType')}</SelectItem>
          <SelectItem value={TaskType.STORY}>{t('task.storyType')}</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={assigneeId ?? undefined} onValueChange={onAssigneeChange}>
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <UserIcon className="mr-2 size-4" />
            <SelectValue placeholder={t('filter.all')} />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{t('filter.all')}</SelectItem>
          <SelectSeparator />

          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!hideProjectFilter && (
        <Select defaultValue={projectId ?? undefined} onValueChange={onProjectChange}>
          <SelectTrigger className="h-8 w-full lg:w-auto">
            <div className="flex items-center pr-2">
              <Folder className="mr-2 size-4" />
              <SelectValue placeholder={t('filter.all')} />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectSeparator />

            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <DatePicker
        placeholder={t('task.dueDate')}
        className="h-8 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({
            dueDate: date ? date.toISOString() : null,
          });
        }}
        showReset
      />
    </div>
  );
};
