import { NextResponse } from "next/server";
import { getChatSettings, isChatWithinWorkingHours } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getChatSettings();
    const withinHours = isChatWithinWorkingHours(settings.workStartMsk, settings.workEndMsk);
    const available = settings.enabled && withinHours;
    return NextResponse.json({
      enabled: settings.enabled,
      workStartMsk: settings.workStartMsk ?? "09:00",
      workEndMsk: settings.workEndMsk ?? "21:00",
      available,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { enabled: false, workStartMsk: "09:00", workEndMsk: "21:00", available: false },
      { status: 200 }
    );
  }
}
