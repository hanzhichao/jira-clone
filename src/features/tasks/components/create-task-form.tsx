'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { DatePicker } from '@/components/date-picker';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useCreateTask } from '@/features/tasks/api/use-create-task';
import { createTaskSchema } from '@/features/tasks/schema';
import { TaskStatus, TaskType, TaskPriority } from '@/features/tasks/types';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface CreateTaskFormProps {
  initialStatus?: TaskStatus | null;
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl?: string }[];
  memberOptions: { id: string; name: string }[];
  taskOptions?: { id: string; name: string }[];
}

export const CreateTaskForm = ({ initialStatus, onCancel, memberOptions, projectOptions, taskOptions = [] }: CreateTaskFormProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { mutate: createTask, isPending } = useCreateTask();

  const createTaskForm = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      type: 'TASK',
      priority: undefined,
      dueDate: undefined,
      assigneeId: undefined,
      description: '',
      projectId: undefined,
      parentId: undefined,
      status: initialStatus ?? undefined,
      workspaceId,
    },
  });

  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    createTask(
      {
        json: values,
      },
      {
        onSuccess: ({ data }) => {
          toast.success(t('common.taskCreated'));
          createTaskForm.reset();
          router.push(`/workspaces/${data.workspaceId}/tasks/${data.$id}`);
        },
        onError: () => {
          toast.error(t('common.failedToCreateTask'));
        },
      },
    );
  };

  return (
    <Card className="size-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">{t('task.createTask')}</CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...createTaskForm}>
          <form onSubmit={createTaskForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.taskName')}</FormLabel>

                    <FormControl>
                      <Input {...field} type="text" placeholder={t('task.taskName')} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.dueDate')}</FormLabel>

                    <FormControl>
                      <DatePicker {...field} disabled={isPending} placeholder={t('task.dueDate')} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.assignee')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>{field.value ? <SelectValue placeholder={t('task.assignee')} /> : t('task.assignee')}</SelectTrigger>
                      </FormControl>

                      <FormMessage />

                      <SelectContent>
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                              <MemberAvatar className="size-6" name={member.name} />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.status')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>{field.value ? <SelectValue placeholder={t('task.status')} /> : t('task.status')}</SelectTrigger>
                      </FormControl>

                      <FormMessage />

                      <SelectContent>
                        <SelectItem value={TaskStatus.BACKLOG}>{t('task.backlog')}</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>{t('task.inProgress')}</SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>{t('task.inReview')}</SelectItem>
                        <SelectItem value={TaskStatus.TODO}>{t('task.todo')}</SelectItem>
                        <SelectItem value={TaskStatus.DONE}>{t('task.done')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

<FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('project.projectName')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? <SelectValue placeholder={t('project.projectName')} /> : t('project.projectName')}
                        </SelectTrigger>
                      </FormControl>

                      

                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar className="size-6" name={project.name} image={project.imageUrl} />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.type')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('task.type')} />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value={TaskType.TASK}>{t('task.taskType')}</SelectItem>
                        <SelectItem value={TaskType.BUG}>{t('task.bugType')}</SelectItem>
                        <SelectItem value={TaskType.TEST}>{t('task.testType')}</SelectItem>
                        <SelectItem value={TaskType.STORY}>{t('task.storyType')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.priority')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? <SelectValue placeholder={t('task.priority')} /> : t('task.selectPriority')}
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>{t('task.low')}</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>{t('task.medium')}</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>{t('task.high')}</SelectItem>
                        <SelectItem value={TaskPriority.URGENT}>{t('task.urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.parentTask')}</FormLabel>

                    <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? <SelectValue placeholder={t('task.selectParentTask')} /> : t('task.selectParentTask')}
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {taskOptions.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.description')}</FormLabel>

                    <FormControl>
                      <Textarea {...field} placeholder={t('task.enterDescription')} className="min-h-[100px]" />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DottedSeparator className="py-7" />

            <FormMessage />

            <div className="flex items-center justify-between">
              <Button
                disabled={isPending}
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                className={cn(!onCancel && 'invisible')}
              >
                {t('common.cancel')}
              </Button>

              <Button disabled={isPending} type="submit" size="lg">
                {t('task.createTask')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
