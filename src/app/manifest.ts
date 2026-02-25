import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "?КАКТУСА — Электронные ивенты в Крыму",
    short_name: "?КАКТУСА",
    description: "Проект электронных ивентов с особым смыслом и звучанием в уникальных локациях Крыма.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "ru",
  };
}
