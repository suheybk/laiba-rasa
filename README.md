This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Neon (Serverless Postgres) ile kurulum 🔧

Bu projede Neon (Serverless Postgres) kullanmak için adımlar:

1. Neon hesabı açın ve yeni bir PostgreSQL veritabanı oluşturun.
2. Neon kontrol panelinden bağlantı dizesini alın (Connection string). Örnek:
   
   ```text
   postgresql://<username>:<password>@<host>/<database>?sslmode=require
   ```

3. Proje kök dizinine `.env.local` dosyası oluşturun ve `DATABASE_URL` olarak Neon bağlantı dizesini ekleyin (veya mevcut `.env` dosyanızda `DATABASE_URL` ayarlayın). Örnek:

   ```env
   DATABASE_URL="postgresql://neondb_owner:SECRET@ep-xxx-pooler.c-1.region.aws.neon.tech/neondb?sslmode=require"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=some-secret
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

4. Bağımlılıkları kurun (zaten kuruluysa atlayın):

   ```bash
   npm install
   ```

5. Prisma client oluşturun ve şemayı veritabanına uygulayın:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   > Not: `prisma db push` Neon ile hızlıca şema oluşturmak için uygundur. Canlı bir prod veritabanına migration uygulamak isterseniz `prisma migrate` kullanın.

6. Uygulamayı başlatın:

   ```bash
   npm run dev
   ```

7. (Mobil test) Eğer cihazdan test etmek isterseniz, `expo-client` klasörünü oluşturduk:

   ```bash
   cd expo-client
   npm install
   npx expo start
   ```

   Ardından Expo Go ile cihazınızdan tarayın ve dört testi çalıştırın (Connectivity, Login success/fail, Session check).

7. Veritabanı bağlantısını test etmek için örnek scriptler `scripts/` altında mevcuttur:

   - `node -r dotenv/config scripts/check_db.js` — örnek kullanıcıları ve sayılarını getirir
   - `node -r dotenv/config scripts/create_user.js` — rastgele test kullanıcı oluşturur

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
