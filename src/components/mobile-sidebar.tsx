'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { MenuIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useI18n } from '@/i18n';

import { Sidebar } from './sidebar';

export const MobileSidebar = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <SheetTrigger asChild>
        <Button title={t('sidebar.openMenu')} size="icon" variant="secondary" className="size-10 lg:hidden">
          <MenuIcon className="size-6 text-neutral-500" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <SheetHeader>
          <VisuallyHidden.Root>
            <SheetTitle>{t('sidebar.sidebarMenu')}</SheetTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <SheetDescription>{t('sidebar.navigateDescription')}</SheetDescription>
          </VisuallyHidden.Root>
        </SheetHeader>

        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
