'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    callNumber: '', whatsappNumber: '',
    aboutContent: '', privacyContent: '', termsContent: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      setForm({
        callNumber: data.callNumber || '',
        whatsappNumber: data.whatsappNumber || '',
        aboutContent: data.aboutContent || '',
        privacyContent: data.privacyContent || '',
        termsContent: data.termsContent || '',
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Site Settings</h1>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      <div className="space-y-6">
        {/* Contact Numbers */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Call Now Number (Header)</label>
              <input
                type="text"
                value={form.callNumber}
                onChange={(e) => setForm({ ...form, callNumber: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="+91-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">WhatsApp Number (for enquiry redirect)</label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {[
          { key: 'aboutContent', label: 'About Us Content' },
          { key: 'privacyContent', label: 'Privacy Policy Content' },
          { key: 'termsContent', label: 'Terms & Conditions Content' },
        ].map(({ key, label }) => (
          <div key={key} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">{label}</label>
            <textarea
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={8}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono text-sm"
              placeholder={`Enter ${label.toLowerCase()} here (supports plain text / markdown)...`}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
