'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { useUpdateTask } from '@/features/tasks/api/use-update-task';
import { createTaskSchema } from '@/features/tasks/schema';
import { type Task, TaskStatus, TaskType, TaskPriority } from '@/features/tasks/types';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl?: string }[];
  memberOptions: { id: string; name: string }[];
  initialValues: Task;
}

const editTaskSchema = createTaskSchema.pick({
  name: true,
  status: true,
  type: true,
  priority: true,
  projectId: true,
  dueDate: true,
  assigneeId: true,
  description: true,
  parentId: true,
}).partial();

export const EditTaskForm = ({ onCancel, memberOptions, projectOptions, initialValues }: EditTaskFormProps) => {
  const { t } = useI18n();
  const { mutate: updateTask, isPending } = useUpdateTask();

  console.log('[DEBUG] EditTaskForm initialValues:', initialValues);

  const editTaskForm = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: initialValues.name,
      status: initialValues.status,
      type: initialValues.type || 'TASK',
      priority: initialValues.priority || undefined,
      projectId: initialValues.projectId,
      dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
      assigneeId: initialValues.assigneeId || undefined,
      description: initialValues.description || '',
      parentId: initialValues.parentId || undefined,
    },
  });

  console.log('[DEBUG] form defaultValues:', editTaskForm.getValues());

  const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
    const filteredValues = {
      ...(values.name !== undefined && { name: values.name }),
      ...(values.status !== undefined && { status: values.status }),
      ...(values.type !== undefined && { type: values.type }),
      ...(values.priority !== undefined && { priority: values.priority }),
      ...(values.projectId !== undefined && { projectId: values.projectId }),
      ...(values.dueDate !== undefined && { dueDate: values.dueDate }),
      ...(values.assigneeId !== undefined && { assigneeId: values.assigneeId }),
      ...(values.description !== undefined && { description: values.description }),
      ...(values.parentId !== undefined && { parentId: values.parentId }),
    };
    
    updateTask(
      {
        json: filteredValues,
        param: { taskId: initialValues.$id },
      },
      {
        onSuccess: () => {
          toast.success(t('common.taskUpdated'));
          onCancel?.();
        },
        onError: () => {
          toast.error(t('common.failedToUpdateTask'));
        },
      },
    );
  };

  return (
    <Card className="size-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">{t('task.editTaskTitle')}</CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...editTaskForm}>
          <form onSubmit={(e) => {
  console.log('[DEBUG] form submit called');
  editTaskForm.handleSubmit(
    (data) => {
      console.log('[DEBUG] form submit success', data);
      onSubmit(data);
    },
    (err) => {
      console.log('[DEBUG] form submit error', err);
    }
  )(e);
}}>
            <div className="flex flex-col gap-y-4">
              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.taskName')}</FormLabel>

                    <FormControl>
                      <Input {...field} type="text" placeholder={t('task.enterTaskName')} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.dueDate')}</FormLabel>

                    <FormControl>
                      <DatePicker {...field} disabled={isPending} placeholder={t('task.selectDueDate')} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.assignee')}</FormLabel>

                    <FormControl>
                      <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>{field.value ? <SelectValue placeholder={t('task.assignee')} /> : t('task.selectAssignee')}</SelectTrigger>
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
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.status')}</FormLabel>

                    <FormControl>
                      <Select disabled={isPending} defaultValue={field.value || TaskStatus.TODO} value={field.value || TaskStatus.TODO} onValueChange={field.onChange}>
                        <SelectTrigger>{field.value ? <SelectValue placeholder={t('task.status')} /> : t('task.selectStatus')}</SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskStatus.BACKLOG}>{t('task.backlog')}</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>{t('task.inProgress')}</SelectItem>
                          <SelectItem value={TaskStatus.IN_REVIEW}>{t('task.inReview')}</SelectItem>
                          <SelectItem value={TaskStatus.TODO}>{t('task.todo')}</SelectItem>
                          <SelectItem value={TaskStatus.DONE}>{t('task.done')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.project')}</FormLabel>

                    <FormControl>
                      <Select disabled={isPending} defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>{field.value ? <SelectValue placeholder={t('task.project')} /> : t('task.selectProject')}</SelectTrigger>
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
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.type')}</FormLabel>

                    <FormControl>
                      <Select disabled={isPending} defaultValue={field.value || TaskType.TASK} value={field.value || TaskType.TASK} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('task.type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskType.TASK}>{t('task.taskType')}</SelectItem>
                          <SelectItem value={TaskType.BUG}>{t('task.bugType')}</SelectItem>
                          <SelectItem value={TaskType.TEST}>{t('task.testType')}</SelectItem>
                          <SelectItem value={TaskType.STORY}>{t('task.storyType')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={editTaskForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.priority')}</FormLabel>

                    <FormControl>
                      <Select disabled={isPending} defaultValue={field.value || 'none'} value={field.value || 'none'} onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)}>
                        <SelectTrigger>
                          {field.value ? <SelectValue placeholder={t('task.priority')} /> : t('task.selectPriority')}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('task.selectPriority')}</SelectItem>
                          <SelectItem value={TaskPriority.LOW}>{t('task.low')}</SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>{t('task.medium')}</SelectItem>
                          <SelectItem value={TaskPriority.HIGH}>{t('task.high')}</SelectItem>
                          <SelectItem value={TaskPriority.URGENT}>{t('task.urgent')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
                disabled={isPending}
                control={editTaskForm.control}
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
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
