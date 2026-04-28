import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPaymentSettings } from "@/lib/data";
import { PaymentsEditForm } from "./PaymentsEditForm";

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const initial = await getPaymentSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-8">Оплата (YooKassa)</h1>
      <PaymentsEditForm initial={initial} />
    </div>
  );
}

