Expo client for testing Next backend

Quick start:

1. Ensure your computer and mobile device are on the same LAN.
2. Update `expo-client/app.json` -> `expo.extra.backendUrl` to point to your machine LAN IP e.g. `http://192.168.1.214:3000`.
3. Start Next backend (bind to 0.0.0.0):
   - `npx next dev --hostname 0.0.0.0`
   - Ensure the server reports `Ready` and that `http://<lan-ip>:3000/api/auth/csrf` is reachable from another machine on the LAN.
4. Start Expo client:
   - cd `expo-client`
   - `npm install` (or `pnpm install`)
   - `npx expo start` -> open in Expo Go on your phone
5. Use the four buttons to run tests:
   - 1) Connectivity: GET /api/auth/csrf
   - 2) Login (success): POST /api/auth/test-credentials with good creds
   - 3) Login (failure): POST with wrong creds
   - 4) Session check: GET /api/auth/session

Notes:
- `test-credentials` is a small test route included in the backend (no cookies/session) and is intended for quick mobile testing.
- If the phone cannot reach the backend, consider using `ngrok` or exposing the port via a tunnel.
