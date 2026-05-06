'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useI18n } from '@/i18n';
import { useCreateWorkspaceModal } from '@/features/workspaces/hooks/use-create-workspace-modal';

import { CreateWorkspaceForm } from './create-workspace-form';

export const CreateWorkspaceModal = () => {
  const { t } = useI18n();
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal title={t('workspace.createWorkspace')} description={t('workspace.createWorkspaceHint')} open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};
