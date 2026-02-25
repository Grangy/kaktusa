import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainEditForm } from "./MainEditForm";
import { getMain } from "@/lib/data";

export default async function AdminMainPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const main = await getMain();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">
        Главная страница
      </h1>
      <MainEditForm initial={main} />
    </div>
  );
}
