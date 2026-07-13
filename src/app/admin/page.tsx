import { db } from '@/lib/db';
import { projects, brokers, leads, withdrawalRequests } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { Building2, Users, MessageSquare, DollarSign } from 'lucide-react';

export default async function AdminDashboard() {
  let stats = { projects: 0, brokers: 0, leads: 0, pendingWithdrawals: 0 };
  let recentLeads: any[] = [];

  try {
    const [pCount] = await db.select({ count: count() }).from(projects);
    const [bCount] = await db.select({ count: count() }).from(brokers);
    const [lCount] = await db.select({ count: count() }).from(leads);
    const [wCount] = await db.select({ count: count() }).from(withdrawalRequests).where(eq(withdrawalRequests.status, 'pending'));

    stats = {
      projects: Number(pCount?.count || 0),
      brokers: Number(bCount?.count || 0),
      leads: Number(lCount?.count || 0),
      pendingWithdrawals: Number(wCount?.count || 0),
    };

    recentLeads = await db
      .select({
        id: leads.id, name: leads.name, contactNo: leads.contactNo,
        status: leads.status, createdAt: leads.createdAt,
        projectName: projects.name,
      })
      .from(leads)
      .leftJoin(projects, eq(leads.projectId, projects.id))
      .orderBy(sql`${leads.createdAt} desc`)
      .limit(10);
  } catch {}

  const statCards = [
    { label: 'Total Projects', value: stats.projects, icon: Building2, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Total Brokers', value: stats.brokers, icon: Users, color: 'bg-green-500/10 text-green-400' },
    { label: 'Total Leads', value: stats.leads, icon: MessageSquare, color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: DollarSign, color: 'bg-amber-500/10 text-amber-400' },
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    converted: 'bg-green-500/20 text-green-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Enquiries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Contact</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Project</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-750 transition-colors">
                  <td className="p-4 text-white text-sm">{lead.name}</td>
                  <td className="p-4 text-gray-400 text-sm">{lead.contactNo}</td>
                  <td className="p-4 text-gray-400 text-sm">{lead.projectName || 'General'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
