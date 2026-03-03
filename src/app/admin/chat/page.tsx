import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getChatSettings } from "@/lib/data";
import { ChatEditForm } from "./ChatEditForm";

export default async function AdminChatPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const initial = await getChatSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">Чат и Telegram</h1>
      <ChatEditForm initial={initial} />
    </div>
  );
}
