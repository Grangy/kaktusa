import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/data";
import type { Metadata } from "next";
import EventPageClient from "./EventPageClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Мероприятие | ?КАКТУСА" };
  return {
    title: `${event.title} | ?КАКТУСА`,
    description: event.metaDescription || undefined,
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return <EventPageClient event={event} />;
}
