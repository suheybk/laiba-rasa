import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['tr', 'en', 'ar'],
    defaultLocale: 'tr',
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    try {
        const response = intlMiddleware(request);

        // Next.js 16 may return responses with immutable headers.
        // Clone into a fresh NextResponse to avoid the "immutable" TypeError.
        const freshResponse = new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
        });

        // Copy headers safely
        response.headers.forEach((value, key) => {
            freshResponse.headers.set(key, value);
        });

        // Copy cookies safely
        response.cookies.getAll().forEach((cookie) => {
            freshResponse.cookies.set(cookie.name, cookie.value);
        });

        return freshResponse;
    } catch (error) {
        // Fallback: if anything goes wrong, just allow the request through
        return NextResponse.next();
    }
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en|ar)/:path*']
};
