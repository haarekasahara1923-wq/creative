'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Commission {
  projectName?: string;
  commissionRate?: string;
  totalAmount?: string;
  status: string;
}

export default function BrokerEarningsPage() {
  const { data: session } = useSession();
  const brokerId = session?.user?.id;
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!brokerId) return;
    fetch(`/api/brokers/${brokerId}`)
      .then((r) => r.json())
      .then((data) => { setCommissions(data.commissions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [brokerId]);

  const totalEarned = commissions.reduce((s, c) => s + Number(c.totalAmount || 0), 0);
  const totalPaid = commissions.filter((c) => c.status === 'paid').reduce((s, c) => s + Number(c.totalAmount || 0), 0);
  const totalPending = totalEarned - totalPaid;

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pdf/earnings?brokerId=${brokerId}`);
      const data = await res.json();

      // Client-side PDF generation using print
      const printContent = `
        <html><head><title>Earnings Report - Creative Group</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1a1a2e; } h2 { color: #f0a500; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #1a1a2e; color: white; }
          .total { font-weight: bold; background: #fef3c7; }
          .footer { margin-top: 20px; color: #888; font-size: 12px; }
        </style></head>
        <body>
          <h1>Creative Group — Broker Earnings Report</h1>
          <h2>Broker: ${data.broker?.name || data.broker?.email}</h2>
          <p>Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          <table>
            <thead><tr><th>Project</th><th>Commission Rate</th><th>Amount Earned</th><th>Status</th></tr></thead>
            <tbody>
              ${data.earnings.map((e: any) => `<tr><td>${e.projectName || 'N/A'}</td><td>${e.commissionRate || '-'}%</td><td>₹${Number(e.totalAmount || 0).toLocaleString('en-IN')}</td><td>${e.status}</td></tr>`).join('')}
              <tr class="total"><td colspan="2"><strong>Total Earned</strong></td><td colspan="2"><strong>₹${data.totalEarned.toLocaleString('en-IN')}</strong></td></tr>
            </tbody>
          </table>
          <div class="footer">This report was generated on ${new Date().toISOString()} by Creative Group Broker Portal.</div>
        </body></html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(printContent);
        win.document.close();
        win.print();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Earnings</h1>
        <button
          onClick={downloadPDF}
          disabled={downloading || commissions.length === 0}
          className="flex items-center gap-2 bg-amber-500 text-slate-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-amber-400 disabled:opacity-50 transition-all"
        >
          <Download className="h-4 w-4" />{downloading ? 'Generating...' : 'Download Report (PDF)'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[{ label: 'Total Earned', value: totalEarned, color: 'text-green-400' },
          { label: 'Paid Out', value: totalPaid, color: 'text-blue-400' },
          { label: 'Pending', value: totalPending, color: 'text-amber-400' }]
          .map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{formatCurrency(value)}</div>
          </div>
        ))}
      </div>

      {/* Earnings Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Commission Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Project', 'Commission Rate', 'Amount Earned', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : commissions.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No commissions earned yet. Share your affiliate link to start earning!</td></tr>
              ) : commissions.map((c, i) => (
                <tr key={i} className="hover:bg-slate-700/30">
                  <td className="p-4 text-white text-sm">{c.projectName || 'N/A'}</td>
                  <td className="p-4 text-gray-400 text-sm">{c.commissionRate || '-'}%</td>
                  <td className="p-4 text-green-400 font-semibold">{formatCurrency(Number(c.totalAmount || 0))}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {commissions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-600 bg-slate-700/50">
                  <td colSpan={2} className="p-4 text-white font-semibold">Total Earned</td>
                  <td className="p-4 text-green-400 font-bold text-lg">{formatCurrency(totalEarned)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
