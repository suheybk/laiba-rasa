import { createNavigation } from 'next-intl/navigation';

export const locales = ['tr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const { Link, redirect, usePathname, useRouter } = createNavigation({
    locales,
});
