import { differenceInDays, format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface TaskDateProps {
  value: string;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const { locale } = useI18n();
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let textColor = 'text-muted-foreground';

  if (diffInDays <= 3) {
    textColor = 'text-red-500';
  } else if (diffInDays <= 7) {
    textColor = 'text-orange-500';
  } else if (diffInDays <= 14) {
    textColor = 'text-yellow-500';
  }

  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const dateFormat = locale === 'zh' ? 'yyyy年M月d日' : 'PPP';

  return (
    <div className={textColor}>
      <span className={cn('truncate', className)}>{format(new Date(value), dateFormat, { locale: dateLocale })}</span>
    </div>
  );
};
