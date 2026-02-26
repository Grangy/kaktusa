import { notFound } from "next/navigation";
import { getEventBySlug, getEvents } from "@/lib/data";
import type { Metadata } from "next";
import EventPageClient from "./EventPageClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://kaktusa.ru";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Мероприятие" };
  const url = `${SITE_URL}/events/${slug}`;
  const rawTitle = event.metaTitle || event.title;
  const title = rawTitle.replace(/\s*\|\s*\?КАКТУСА\s*$/i, "").trim() || rawTitle;
  const description = event.metaDescription || undefined;
  const ogImage = event.heroImage?.startsWith("http") ? event.heroImage : `${SITE_URL}${event.heroImage.startsWith("/") ? "" : "/"}${event.heroImage}`;
  const fullTitle = `${title} | ?КАКТУСА`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url,
      siteName: "?КАКТУСА",
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const [event, allEvents] = await Promise.all([getEventBySlug(slug), getEvents()]);
  if (!event) notFound();
  const pastEvents = allEvents.filter((e) => e.type === "past" && e.slug !== slug);
  const eventUrl = `${SITE_URL}/events/${slug}`;
  const eventImage = event.heroImage?.startsWith("http") ? event.heroImage : `${SITE_URL}${event.heroImage.startsWith("/") ? "" : "/"}${event.heroImage}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.metaDescription || undefined,
    url: eventUrl,
    image: eventImage,
    startDate: event.date + (event.time ? (event.time.length === 5 ? `T${event.time}:00` : `T${event.time}`) : "T00:00:00"),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venueTitle || event.location,
      address: event.venueAddress || event.location,
      addressLocality: event.venueCity,
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventPageClient event={event} pastEvents={pastEvents} />
    </>
  );
}
