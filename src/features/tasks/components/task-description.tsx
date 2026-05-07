import { Pencil, XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateTask } from '@/features/tasks/api/use-update-task';
import type { Task } from '@/features/tasks/types';
import { useI18n } from '@/i18n';

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);

  const { mutate: editTask, isPending } = useUpdateTask();

  const handleSave = () => {
    editTask(
      {
        json: {
          description: value,
        },
        param: {
          taskId: task.$id,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('common.taskUpdated'));
          setIsEditing(false);
        },
        onError: () => {
          toast.error(t('common.failedToUpdateTask'));
        },
      },
    );
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{t('task.description')}</p>

        <Button
          onClick={() => {
            setValue(task.description);
            setIsEditing((prevIsEditing) => !prevIsEditing);
          }}
          size="sm"
          variant="secondary"
        >
          {isEditing ? <XIcon className="mr-2 size-4" /> : <Pencil className="mr-2 size-4" />}
          {isEditing ? t('common.cancel') : t('common.edit')}
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            autoFocus
            placeholder={t('task.addDescription')}
            value={value}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />

          <Button size="sm" className="ml-auto w-fit" onClick={handleSave} disabled={isPending}>
            {isPending ? t('task.saving') : t('common.saveChanges')}
          </Button>
        </div>
      ) : (
        <div>{task.description || <span className="italic text-muted-foreground">{t('task.noDescription')}</span>}</div>
      )}
    </div>
  );
};
