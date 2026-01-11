const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const got = require('got');
const { CookieJar } = require('tough-cookie');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'suheybk@gmail.com';
    const plainPassword = '98989796A';

    // Ensure deterministic test user
    const hashed = await bcrypt.hash(plainPassword, 12);
    await prisma.user.upsert({
      where: { email },
      update: { password: hashed },
      create: {
        email,
        username: 'nextauthtest',
        password: hashed,
        displayName: 'NextAuth Test',
        language: 'EN',
      },
    });

    console.log('Test user ready:', email);

    const fetch = require('node-fetch');
    const jar = new CookieJar();
    const base = 'http://127.0.0.1:3000';

    // helper to attach cookies from jar to headers
    const headersWithCookies = (url, extra = {}) => {
      const cookieHeader = jar.getCookieStringSync(url);
      return cookieHeader ? { ...extra, cookie: cookieHeader } : extra;
    };

    // 1) Get CSRF token
    const csrfRes = await fetch(base + '/api/auth/csrf', { headers: headersWithCookies(base) });
    (csrfRes.headers.raw()['set-cookie'] || []).forEach((c) => jar.setCookieSync(c, base));
    const csrfBody = await csrfRes.json();
    const csrfToken = csrfBody?.csrfToken;
    console.log('CSRF token:', typeof csrfToken === 'string' ? '[ok]' : csrfBody);

    // 2) Post to credentials callback (request JSON response)
    const form = new URLSearchParams();
    form.append('csrfToken', csrfToken);
    form.append('email', email);
    form.append('password', plainPassword);
    form.append('json', 'true');

    const callbackRes = await fetch(base + '/api/auth/callback/credentials?json=true', {
      method: 'POST',
      body: form.toString(),
      headers: headersWithCookies(base, { 'content-type': 'application/x-www-form-urlencoded' }),
      redirect: 'manual',
    });

    (callbackRes.headers.raw()['set-cookie'] || []).forEach((c) => jar.setCookieSync(c, base));

    let callbackBody;
    try {
      callbackBody = await callbackRes.json();
    } catch (e) {
      callbackBody = { status: callbackRes.status };
    }
    console.log('Signin response status:', callbackRes.status);
    console.log('Signin response body:', callbackBody);

    // 3) Fetch session using the cookie jar
    const sessionRes = await fetch(base + '/api/auth/session', { headers: headersWithCookies(base) });
    const sessionBody = await sessionRes.json();
    console.log('Session response status:', sessionRes.status);
    console.log('Session body:', sessionBody);

    if (sessionRes.body?.user) {
      console.log('✅ Session contains user:', sessionRes.body.user.email || sessionRes.body.user.id);
      process.exit(0);
    } else {
      console.error('❌ Session did not contain user; check signin response and cookies.');
      process.exit(1);
    }
  } catch (e) {
    console.error('Test failure:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();