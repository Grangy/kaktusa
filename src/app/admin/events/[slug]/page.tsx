import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getEventBySlug } from "@/lib/data";
import { EventEditForm } from "./EventEditForm";

export const dynamic = "force-dynamic";

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { slug } = await params;
  const event = slug === "new" ? null : await getEventBySlug(slug);
  if (slug !== "new" && !event) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">
        {event ? event.title : "Новое мероприятие"}
      </h1>
      <EventEditForm event={event ?? null} slug={slug} />
    </div>
  );
}
