"use client";

import type { Event } from "@/types/data";
import EventLanding from "@/components/events/EventLanding";
import PastEventLanding from "@/components/events/PastEventLanding";

export default function EventPageClient({ event }: { event: Event }) {
  if (event.type === "past") {
    return <PastEventLanding event={event} />;
  }
  return <EventLanding event={event} />;
}
