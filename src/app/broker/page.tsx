import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { brokers, leads, commissions } from '@/lib/db/schema';
import { eq, count, sum } from 'drizzle-orm';
import { Copy, Share2, Users, DollarSign } from 'lucide-react';
import CopyButton from '@/components/broker/CopyButton';

export default async function BrokerDashboard() {
  const session = await auth();
  const brokerId = Number(session?.user?.id);

  let broker: any = null;
  let leadsCount = 0;
  let totalEarned = 0;

  try {
    const [b] = await db.select().from(brokers).where(eq(brokers.id, brokerId)).limit(1);
    broker = b;

    const [lc] = await db.select({ count: count() }).from(leads).where(eq(leads.brokerId, brokerId));
    leadsCount = Number(lc?.count || 0);

    const [te] = await db.select({ total: sum(commissions.amount) }).from(commissions).where(eq(commissions.brokerId, brokerId));
    totalEarned = Number(te?.total || 0);
  } catch {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const affiliateLink = broker ? `${appUrl}/?ref=${broker.affiliateCode}` : '';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Broker Dashboard</h1>

      {/* Affiliate Link */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-3 rounded-xl">
            <Share2 className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold text-lg mb-1">Your Affiliate Link</h2>
            <p className="text-gray-400 text-sm mb-4">Share this link with potential buyers. When they enquire through it, you earn commission on conversions.</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-amber-400 font-mono text-sm overflow-hidden">
                <span className="block truncate">{affiliateLink}</span>
              </div>
              {affiliateLink && <CopyButton text={affiliateLink} />}
            </div>
            {broker?.affiliateCode && (
              <p className="text-gray-500 text-xs mt-2">Your code: <code className="text-amber-400">{broker.affiliateCode}</code></p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{leadsCount}</div>
              <div className="text-gray-400 text-sm">Leads Attributed</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                ₹{totalEarned.toLocaleString('en-IN')}
              </div>
              <div className="text-gray-400 text-sm">Total Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile completion nudge */}
      {broker && !broker.name && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
          <p className="text-blue-300 text-sm">
            👤 Complete your profile to help the admin identify you and process withdrawals faster.
            <a href="/broker/profile" className="text-blue-400 underline ml-2">Update Profile →</a>
          </p>
        </div>
      )}
    </div>
  );
}
