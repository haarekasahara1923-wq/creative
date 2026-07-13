import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settings = { callNumber: '+91-XXXXXXXXXX', whatsappNumber: '+91XXXXXXXXXX' };
  try {
    const [s] = await db.select().from(siteSettings).limit(1);
    if (s) settings = { callNumber: s.callNumber || settings.callNumber, whatsappNumber: s.whatsappNumber || settings.whatsappNumber };
  } catch {}

  return (
    <>
      <Header callNumber={settings.callNumber} />
      <main className="pt-16 md:pt-20 min-h-screen bg-slate-950">{children}</main>
      <Footer callNumber={settings.callNumber} whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
