import { AlertTriangle } from 'lucide-react';

import { useI18n } from '@/i18n';

interface PageErrorProps {
  message?: string;
}

export const PageError = ({ message }: PageErrorProps) => {
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <AlertTriangle className="mb-2 size-6 text-muted-foreground" />

      <p className="text-sm font-medium text-muted-foreground">{message || t('common.somethingWentWrong')}</p>
    </div>
  );
};
