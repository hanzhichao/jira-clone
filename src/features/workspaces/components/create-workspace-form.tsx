'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { DottedSeparator } from '@/components/dotted-separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import { useCreateWorkspace } from '@/features/workspaces/api/use-create-workspace';
import { createWorkspaceSchema } from '@/features/workspaces/schema';
import { cn } from '@/lib/utils';

interface CreateWorkspaceFormProps {
  onCancel?: () => void;
}

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const createWorkspaceForm = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      image: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };

    createWorkspace(
      {
        form: finalValues,
      },
      {
        onSuccess: ({ data }) => {
          createWorkspaceForm.reset();

          router.push(`/workspaces/${data.$id}`);
        },
      },
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes;
    const file = e.target.files?.[0];

    if (file) {
      const validImageTypes = ['image/png', 'image/jpg', 'image/jpeg'];

      if (!validImageTypes.includes(file.type)) return toast.error(t('common.invalidImageFile'));
      if (file.size > MAX_FILE_SIZE) return toast.error(t('common.imageSizeExceeds'));

      createWorkspaceForm.setValue('image', file);
    }
  };

  return (
    <Card className="size-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">{t('workspace.createWorkspace')}</CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...createWorkspaceForm}>
          <form onSubmit={createWorkspaceForm.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                disabled={isPending}
                control={createWorkspaceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('workspace.workspaceName')}</FormLabel>

                    <FormControl>
                      <Input {...field} type="text" placeholder={t('workspace.workspaceName')} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isPending}
                control={createWorkspaceForm.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="relative size-[72px] overflow-hidden rounded-md">
                          <Image
                            src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                            alt="Workspace Logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex flex-col">
                        <p className="text-sm">{t('common.workspaceIcon')}</p>
                        <p className="text-xs text-muted-foreground">{t('common.imageHint')}</p>

                        <input
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                          accept=".jpg, .png, .jpeg"
                          ref={inputRef}
                          disabled={isPending}
                        />

                        {field.value ? (
                          <Button
                            type="button"
                            disabled={isPending}
                            variant="destructive"
                            size="xs"
                            className="mt-2 w-fit"
                            onClick={() => {
                              field.onChange(null);

                              if (inputRef.current) inputRef.current.value = '';
                            }}
                          >
                            {t('common.removeImage')}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={isPending}
                            variant="tertiary"
                            size="xs"
                            className="mt-2 w-fit"
                            onClick={() => inputRef.current?.click()}
                          >
                            {t('common.uploadImage')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            <DottedSeparator className="py-7" />

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
                {t('workspace.createWorkspace')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
