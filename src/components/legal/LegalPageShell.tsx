import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMainSafe } from "@/lib/data";

export async function LegalPageShell({ children }: { children: React.ReactNode }) {
  const main = await getMainSafe();
  return (
    <>
      <Header logoHero={main?.hero?.logoHero} logoScrolled={main?.hero?.logoScrolled} />
      <div className="min-h-screen px-6 md:px-12 pt-28 pb-16">{children}</div>
      <Footer logo={main?.hero?.logoScrolled} />
    </>
  );
}
