import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BrokerSidebar from '@/components/broker/BrokerSidebar';

export default async function BrokerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'broker') redirect('/login?role=broker');

  return (
    <div className="flex min-h-screen bg-slate-950">
      <BrokerSidebar brokerId={session.user?.id || ''} brokerName={session.user?.name || session.user?.email || ''} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}
