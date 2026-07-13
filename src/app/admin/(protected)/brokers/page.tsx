'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBroker, setViewBroker] = useState<any>(null);
  const [brokerDetail, setBrokerDetail] = useState<any>(null);
  const [tab, setTab] = useState<'profile' | 'commissions' | 'withdrawals'>('profile');
  const [toast, setToast] = useState('');
  const [showWithdrawals, setShowWithdrawals] = useState(false);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);

  const fetchBrokers = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/brokers');
    const data = await r.json();
    setBrokers(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  }, []);

  const fetchAllWithdrawals = useCallback(async () => {
    const r = await fetch('/api/withdrawals');
    const data = await r.json();
    setAllWithdrawals(Array.isArray(data) ? data.reverse() : []);
  }, []);

  useEffect(() => { fetchBrokers(); fetchAllWithdrawals(); }, [fetchBrokers, fetchAllWithdrawals]);

  const viewBrokerDetail = async (broker: any) => {
    setViewBroker(broker);
    const r = await fetch(`/api/brokers/${broker.id}`);
    const data = await r.json();
    setBrokerDetail(data);
    setTab('profile');
  };

  const toggleStatus = async (broker: any) => {
    const newStatus = broker.status === 'active' ? 'blocked' : 'active';
    await fetch(`/api/brokers/${broker.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setToast(`Broker ${newStatus}`);
    fetchBrokers();
    setTimeout(() => setToast(''), 3000);
  };

  const updateWithdrawal = async (id: number, status: string) => {
    await fetch(`/api/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setToast(`Withdrawal ${status}`);
    fetchAllWithdrawals();
    if (brokerDetail) {
      const r = await fetch(`/api/brokers/${brokerDetail.id}`);
      setBrokerDetail(await r.json());
    }
    setTimeout(() => setToast(''), 3000);
  };

  const totalEarned = (commissions: any[]) =>
    commissions?.reduce((s: number, c: any) => s + Number(c.totalAmount || 0), 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Brokers</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWithdrawals(!showWithdrawals)}
            className="flex items-center gap-2 bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm"
          >
            <DollarSign className="h-4 w-4" /> Withdrawal Requests
          </button>
          <button onClick={fetchBrokers} className="flex items-center gap-2 bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      {/* Withdrawal Requests Panel */}
      {showWithdrawals && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl mb-6 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-white font-semibold">All Withdrawal Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Broker', 'Amount', 'Status', 'Requested', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase p-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {allWithdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No withdrawal requests</td></tr>
                ) : allWithdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="p-4 text-white text-sm">{w.brokerName || w.brokerEmail}</td>
                    <td className="p-4 text-amber-400 font-semibold">{formatCurrency(Number(w.amount))}</td>
                    <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[w.status]}`}>{w.status}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateWithdrawal(w.id, 'approved')} className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30">Approve</button>
                          <button onClick={() => updateWithdrawal(w.id, 'rejected')} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30">Reject</button>
                        </div>
                      )}
                      {w.status === 'approved' && (
                        <button onClick={() => updateWithdrawal(w.id, 'paid')} className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/30">Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brokers Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Broker', 'Email', 'Mobile', 'Affiliate Code', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : brokers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No brokers registered yet.</td></tr>
              ) : brokers.map((b) => (
                <tr key={b.id} className="hover:bg-slate-700/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {b.profilePhotoUrl ? (
                        <img src={b.profilePhotoUrl} alt={b.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                          {(b.name || b.email)[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-white text-sm">{b.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{b.email}</td>
                  <td className="p-4 text-gray-400 text-sm">{b.mobile || '-'}</td>
                  <td className="p-4">
                    <code className="bg-slate-700 text-amber-400 px-2 py-1 rounded text-xs">{b.affiliateCode}</code>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => viewBrokerDetail(b)} className="p-1.5 text-gray-400 hover:text-amber-400"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => toggleStatus(b)} className={`p-1.5 ${b.status === 'active' ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-green-400'}`}>
                        {b.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broker Detail Modal */}
      <Modal open={!!viewBroker} onClose={() => { setViewBroker(null); setBrokerDetail(null); }} title="Broker Details" size="lg">
        {brokerDetail && (
          <div>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {(['profile', 'commissions', 'withdrawals'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    tab === t ? 'bg-white shadow text-slate-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >{t}</button>
              ))}
            </div>

            {tab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {brokerDetail.profilePhotoUrl ? (
                    <img src={brokerDetail.profilePhotoUrl} className="h-16 w-16 rounded-full object-cover" alt="Profile" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
                      {(brokerDetail.name || brokerDetail.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-slate-900 font-semibold text-lg">{brokerDetail.name || 'Not set'}</div>
                    <div className="text-gray-500">{brokerDetail.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['Mobile', brokerDetail.mobile], ['WhatsApp', brokerDetail.whatsapp], ['Address', brokerDetail.address], ['Bank', brokerDetail.bankName], ['Account No', brokerDetail.accountNo], ['UPI ID', brokerDetail.upiId]].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
                      <div className="text-gray-800 mt-0.5">{(value as string) || '-'}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Affiliate Code</div>
                  <code className="text-amber-600 font-bold text-lg">{brokerDetail.affiliateCode}</code>
                </div>
              </div>
            )}

            {tab === 'commissions' && (
              <div>
                <div className="mb-4 text-right">
                  <span className="text-gray-500 text-sm">Total Earned: </span>
                  <span className="text-green-600 font-bold">{formatCurrency(totalEarned(brokerDetail.commissions))}</span>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b">
                    {['Project', 'Commission Rate', 'Amount', 'Status'].map((h) => <th key={h} className="text-left text-xs text-gray-400 uppercase p-3">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y">
                    {(brokerDetail.commissions || []).length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-400">No commissions yet</td></tr>
                    ) : brokerDetail.commissions.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 text-gray-800">{c.projectName}</td>
                        <td className="p-3 text-gray-500">{c.commissionRate || '-'}%</td>
                        <td className="p-3 text-green-600 font-semibold">{formatCurrency(Number(c.totalAmount))}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'withdrawals' && (
              <div>
                <table className="w-full">
                  <thead><tr className="border-b">
                    {['Amount', 'Status', 'Requested', 'Actions'].map((h) => <th key={h} className="text-left text-xs text-gray-400 uppercase p-3">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y">
                    {(brokerDetail.withdrawals || []).length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-400">No withdrawal requests</td></tr>
                    ) : brokerDetail.withdrawals.map((w: any) => (
                      <tr key={w.id}>
                        <td className="p-3 font-semibold text-amber-600">{formatCurrency(Number(w.amount))}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[w.status]}`}>{w.status}</span></td>
                        <td className="p-3 text-gray-500 text-sm">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-3">
                          {w.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => updateWithdrawal(w.id, 'approved')} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Approve</button>
                              <button onClick={() => updateWithdrawal(w.id, 'rejected')} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Reject</button>
                            </div>
                          )}
                          {w.status === 'approved' && (
                            <button onClick={() => updateWithdrawal(w.id, 'paid')} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
