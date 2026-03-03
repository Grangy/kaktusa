import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLeadPhones } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const phones = await getLeadPhones();
    return NextResponse.json(
      phones.map((p) => ({
        id: p.id,
        sessionId: p.sessionId,
        phone: p.phone,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load phones" }, { status: 500 });
  }
}
