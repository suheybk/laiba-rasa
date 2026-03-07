import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['tr', 'en', 'ar'],

    // Used when no locale matches
    defaultLocale: 'tr',

    // If we should prepend the locale to the path for the default locale
    // true: /tr/about
    // false: /about (for default) -> /tr/about (rewrite)
    // Let's use always prefix for consistency or default prefix? 
    // User asked for "language support", usually /tr, /en is best.
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    // Add custom logic here if needed, or just return intlMiddleware
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en|ar)/:path*']
};
