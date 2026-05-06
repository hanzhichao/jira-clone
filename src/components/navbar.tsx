'use client';

import { usePathname } from 'next/navigation';

import { useI18n } from '@/i18n';
import { UserButton } from '@/features/auth/components/user-button';

import { MobileSidebar } from './mobile-sidebar';

export const Navbar = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const pathnameParts = pathname.split('/');
  const pathnameKey = pathnameParts[3];

  const getPageInfo = () => {
    switch (pathnameKey) {
      case 'tasks':
        return { title: t('navigation.myTasks'), description: t('home.description') };
      case 'projects':
        return { title: t('project.projects'), description: t('home.description') };
      default:
        return { title: t('navigation.home'), description: t('home.description') };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <nav className="flex items-center justify-between px-6 pt-4">
      <div className="hidden flex-col lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <p className="text-muted-foreground">{description}</p>
      </div>

      <MobileSidebar />

      <div className="flex items-center gap-x-2.5">
        <UserButton />

      </div>
    </nav>
  );
};
