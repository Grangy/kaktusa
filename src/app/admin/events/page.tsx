import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEvents } from "@/lib/data";
import { EventsListClient } from "./EventsListClient";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const events = await getEvents();

  return (
    <div>
      <EventsListClient events={events} />
    </div>
  );
}
