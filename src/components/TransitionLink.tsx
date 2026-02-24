"use client";

import Link from "next/link";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

/** Обёртка над Link — нативная навигация Next.js без задержек */
export default function TransitionLink({ href, prefetch = true, ...props }: Props) {
  return <Link href={href} prefetch={prefetch} {...props} />;
}
