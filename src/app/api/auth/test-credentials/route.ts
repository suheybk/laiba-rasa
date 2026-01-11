import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    console.error('Test credentials error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
