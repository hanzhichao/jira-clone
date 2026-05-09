'use client';

import { Loader2, LogOut, Languages } from 'lucide-react';

import { DottedSeparator } from '@/components/dotted-separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/i18n';
import { useCurrent } from '@/features/auth/api/use-current';
import { useLogout } from '@/features/auth/api/use-logout';

import { LanguageSwitcher } from '@/components/language-switcher';

export const UserButton = () => {
  const { t, locale, setLocale } = useI18n();
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout, isPending } = useLogout();

  if (isLoading) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const { name, email } = user;

  const avatarFallback = name ? name.charAt(0).toUpperCase() : (email.charAt(0).toUpperCase() ?? '?');

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger disabled={isPending} className="relative rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar className="size-10 border border-neutral-300 transition hover:opacity-75">
          <AvatarFallback className="flex items-center justify-center bg-neutral-200 font-medium text-neutral-500">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] border border-neutral-300">
            <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-xl font-medium text-neutral-500">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-neutral-900">{name}</p>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </div>

        <DottedSeparator className="mb-1" />

        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2">
          <Languages className="size-4" />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">Language</span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setLocale('en')}
                className={`text-xs px-2 py-1 rounded ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                English
              </button>
              <button
                onClick={() => setLocale('zh')}
                className={`text-xs px-2 py-1 rounded ${locale === 'zh' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                中文
              </button>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isPending}
          onClick={() => logout()}
          className="flex h-10 cursor-pointer items-center justify-center font-medium text-amber-700"
        >
          <LogOut className="mr-2 size-4" />
          {t('auth.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
