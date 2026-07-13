'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Send } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function BrokerWithdrawalsPage() {
  const { data: session } = useSession();
  const brokerId = session?.user?.id;
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!brokerId) return;
    setLoading(true);
    const [wRes, bRes] = await Promise.all([
      fetch('/api/withdrawals').then((r) => r.json()),
      fetch(`/api/brokers/${brokerId}`).then((r) => r.json()),
    ]);
    setWithdrawals(Array.isArray(wRes) ? wRes.reverse() : []);
    const earned = (bRes.commissions || []).reduce((s: number, c: any) => s + Number(c.totalAmount || 0), 0);
    setTotalEarned(earned);
    setLoading(false);
  }, [brokerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalWithdrawn = withdrawals.filter((w) => ['approved', 'paid'].includes(w.status)).reduce((s, w) => s + Number(w.amount), 0);
  const availableBalance = totalEarned - totalWithdrawn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    if (Number(form.amount) > availableBalance) { setError('Amount exceeds available balance'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast('Withdrawal request submitted!');
      setForm({ amount: '', note: '' });
      fetchData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Withdrawals</h1>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/20 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <div className="text-gray-400 text-sm">Available Balance</div>
            <div className="text-4xl font-bold text-green-400 mt-1">{formatCurrency(Math.max(0, availableBalance))}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Total Earned</div>
            <div className="text-white font-semibold">{formatCurrency(totalEarned)}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Total Withdrawn</div>
            <div className="text-white font-semibold">{formatCurrency(totalWithdrawn)}</div>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Request Payout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (₹) *</label>
              <input type="number" min="1" max={availableBalance}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={`Max: ₹${Math.max(0, availableBalance).toLocaleString('en-IN')}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Note (optional)</label>
              <input type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Payment preference, IFSC code etc."
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={submitting || availableBalance <= 0}
            className="flex items-center gap-2 bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />{submitting ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Amount', 'Status', 'Note', 'Requested', 'Processed'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No withdrawal requests yet.</td></tr>
              ) : withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-700/30">
                  <td className="p-4 text-amber-400 font-semibold">{formatCurrency(Number(w.amount))}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[w.status]}`}>{w.status}</span></td>
                  <td className="p-4 text-gray-400 text-sm">{w.note || '-'}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4 text-gray-400 text-sm">{w.processedAt ? new Date(w.processedAt).toLocaleDateString('en-IN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
