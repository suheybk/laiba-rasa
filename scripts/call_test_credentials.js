const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/auth/test-credentials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nextauth-test@example.com', password: 'Password1' }),
    });
    console.log('status', res.status);
    console.log(await res.json());
  } catch (e) {
    console.error('Request error:', e.message || e);
    process.exit(1);
  }
})();