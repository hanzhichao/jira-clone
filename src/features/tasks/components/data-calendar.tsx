import { addMonths, format, getDay, parse, startOfWeek, subMonths } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@/components/ui/button';
import type { Task } from '@/features/tasks/types';
import { useI18n } from '@/i18n';

import './data-calendar.css';
import { EventCard } from './event-card';

const locales = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

const dayLabels = {
  'zh-CN': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

interface DataCalendarProps {
  data: Task[];
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  locale: string;
  monthFormat: string;
}

const CustomToolbar = ({ date, onNavigate, locale, monthFormat }: CustomToolbarProps) => {
  return (
    <div className="mb-4 flex w-full items-center justify-center gap-x-2 lg:w-auto lg:justify-start">
      <Button title={locale === 'zh' ? '上个月' : 'Previous Month'} onClick={() => onNavigate('PREV')} variant="secondary" size="icon">
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex h-8 w-full items-center justify-center rounded-md border border-input px-3 py-2 lg:w-auto">
        <CalendarIcon className="mr-2 size-4" />
        <p className="text-sm">{format(date, monthFormat)}</p>
      </div>

      <Button title={locale === 'zh' ? '下个月' : 'Next Month'} onClick={() => onNavigate('NEXT')} variant="secondary" size="icon">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const { locale } = useI18n();
  const currentLocale = locale === 'zh' ? zhCN : enUS;
  const monthFormat = locale === 'zh' ? 'yyyy年M月' : 'MMMM yyyy';

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const culture = locale === 'zh' ? 'zh-CN' : 'en-US';
  const days = dayLabels[culture];

  const [value, setValue] = useState(data.length > 0 ? new Date(data[0].dueDate) : new Date());

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') setValue(subMonths(value, 1));
    else if (action === 'NEXT') setValue(addMonths(value, 1));
    else if (action === 'TODAY') setValue(new Date());
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={['month']}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      culture={culture}
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard id={event.id} title={event.title} assignee={event.assignee} project={event.project} status={event.status} />
        ),
        toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} locale={locale} monthFormat={monthFormat} />,
      }}
    />
  );
};
