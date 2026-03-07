import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { z } from "zod";

// Inline login schema to avoid circular imports
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma) as AuthOptions["adapter"],
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.displayName ?? user.username,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    callbacks: {
        async signIn({ user, account }) {
            // Google OAuth ile giriş yapan kullanıcılar için username oluştur
            if (account?.provider === "google" && user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    // Yeni kullanıcı - username oluştur
                    const baseUsername = user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
                    let username = baseUsername;
                    let counter = 1;

                    // Benzersiz username bul
                    while (await prisma.user.findUnique({ where: { username } })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }

                    // Kullanıcıyı oluştur
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            username,
                            displayName: user.name || username,
                            avatarUrl: user.image,
                        },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
};

export async function isUserPremium(userId: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (user?.role === "ADMIN") return true;

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ["ACTIVE", "TRIAL"] },
                endsAt: { gt: new Date() },
            },
        });
        return !!subscription;
    } catch {
        return false;
    }
}
