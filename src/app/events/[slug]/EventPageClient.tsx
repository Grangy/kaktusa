"use client";

import type { Event } from "@/types/data";
import EventLanding from "@/components/events/EventLanding";
import PastEventLanding from "@/components/events/PastEventLanding";

type Props = { event: Event; pastEvents?: Event[] };

export default function EventPageClient({ event, pastEvents = [] }: Props) {
  const others = pastEvents.filter((e) => e.slug !== event.slug);
  if (event.type === "past") {
    return <PastEventLanding event={event} pastEvents={others} />;
  }
  return <EventLanding event={event} pastEvents={others} />;
}
