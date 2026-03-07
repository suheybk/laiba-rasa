
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.length < 2) {
            return NextResponse.json({ error: "Geçersiz isim" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { displayName: name }
        });

        return NextResponse.json({
            success: true,
            user: { name: updatedUser.displayName }
        });

    } catch (error) {
        console.error("User update error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
