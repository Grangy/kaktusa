import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMeta } from "@/lib/data";
import { MetaEditForm } from "./MetaEditForm";

export default async function AdminMetaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const meta = await getMeta();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">Метатеги</h1>
      <MetaEditForm initial={meta} />
    </div>
  );
}
