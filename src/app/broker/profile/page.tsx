'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CloudinaryUploader from '@/components/ui/CloudinaryUploader';
import { Save } from 'lucide-react';

export default function BrokerProfilePage() {
  const { data: session } = useSession();
  const brokerId = session?.user?.id;
  const [form, setForm] = useState({
    name: '', mobile: '', whatsapp: '', address: '',
    bankName: '', accountNo: '', upiId: '',
    profilePhotoUrl: '', profilePhotoPublicId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!brokerId) return;
    fetch(`/api/brokers/${brokerId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || '',
          mobile: data.mobile || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          bankName: data.bankName || '',
          accountNo: data.accountNo || '',
          upiId: data.upiId || '',
          profilePhotoUrl: data.profilePhotoUrl || '',
          profilePhotoPublicId: data.profilePhotoPublicId || '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brokerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/brokers/${brokerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setToast('Profile saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile Photo</h2>
          <CloudinaryUploader
            folder="creative-group/brokers"
            label="Profile Photo"
            accept="image/*"
            currentUrl={form.profilePhotoUrl}
            onUpload={({ url, publicId }) => setForm({ ...form, profilePhotoUrl: url, profilePhotoPublicId: publicId })}
          />
        </div>

        {/* Personal Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['name', 'Full Name', 'Your full name', 'text'], ['mobile', 'Mobile No', '+91 XXXXX XXXXX', 'tel'], ['whatsapp', 'WhatsApp No', '+91 XXXXX XXXXX', 'tel']].map(([key, label, placeholder, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Your full address"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bank Details</h2>
          <p className="text-gray-400 text-sm mb-4">Required for processing withdrawal payments.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['bankName', 'Bank Name', 'State Bank of India'], ['accountNo', 'Account Number', 'XXXXXXXXXXXXXXXXXX'], ['upiId', 'UPI ID (optional)', 'yourname@upi']].map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit" disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all"
        >
          <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
