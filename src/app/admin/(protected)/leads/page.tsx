'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface Lead {
  id: number; name: string; contactNo: string; residence?: string;
  status: string; createdAt: string; projectName?: string;
  brokerName?: string; brokerEmail?: string; projectId?: number; brokerId?: number;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  converted: 'bg-green-500/20 text-green-400',
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertModal, setConvertModal] = useState<Lead | null>(null);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/leads');
    const data = await r.json();
    setLeads(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (lead: Lead, status: string) => {
    if (status === 'converted' && lead.brokerId) {
      setConvertModal(lead);
      return;
    }
    await doUpdate(lead.id, status, null);
  };

  const doUpdate = async (id: number, status: string, amount: string | null) => {
    setUpdating(true);
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, commissionAmount: amount }),
      });
      setToast('Lead updated!');
      setConvertModal(null);
      fetchLeads();
    } catch { setToast('Failed to update'); } finally { setUpdating(false); }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Contact', 'Residence', 'Project', 'Broker', 'Status', 'Date'];
    const rows = leads.map((l) => [l.id, l.name, l.contactNo, l.residence || '', l.projectName || '', l.brokerName || '', l.status, new Date(l.createdAt).toLocaleDateString('en-IN')]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Leads / Enquiries</h1>
        <div className="flex gap-3">
          <button onClick={fetchLeads} className="flex items-center gap-2 bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-amber-500 text-slate-900 font-medium px-4 py-2 rounded-xl text-sm hover:bg-amber-400 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['#', 'Name', 'Contact', 'Residence', 'Project', 'Broker', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No leads yet</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-gray-400 text-sm">{lead.id}</td>
                  <td className="p-4 text-white text-sm font-medium">{lead.name}</td>
                  <td className="p-4 text-gray-400 text-sm">{lead.contactNo}</td>
                  <td className="p-4 text-gray-400 text-sm">{lead.residence || '-'}</td>
                  <td className="p-4 text-gray-400 text-sm">{lead.projectName || 'General'}</td>
                  <td className="p-4 text-sm">
                    {lead.brokerName ? (
                      <span className="text-amber-400">{lead.brokerName}</span>
                    ) : <span className="text-gray-600">Direct</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(lead.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert Modal */}
      <Modal open={!!convertModal} onClose={() => setConvertModal(null)} title="Mark as Converted" size="sm">
        {convertModal && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">This lead is attributed to broker <strong>{convertModal.brokerName}</strong>. Enter commission amount to create a commission record.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission Amount (₹)</label>
              <input
                type="number" min="0"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter amount in ₹"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConvertModal(null)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => doUpdate(convertModal.id, 'converted', commissionAmount || '0')}
                disabled={updating}
                className="flex-1 bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-xl text-sm hover:bg-amber-400 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Confirm & Create Commission'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
