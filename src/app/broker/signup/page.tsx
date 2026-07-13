'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function BrokerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Auto sign in
      const result = await signIn('credentials', { email: form.email, password: form.password, role: 'broker', redirect: false });
      if (result?.error) {
        router.push('/login');
      } else {
        router.push('/broker');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-amber-500 p-2 rounded-xl">
              <Building2 className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <span className="text-white font-bold text-xl">Creative</span>
              <span className="text-amber-500 font-bold text-xl"> Group</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Become a Broker Partner</h1>
          <p className="text-gray-400 mt-1">Create your broker account and start earning</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-amber-400 font-semibold mb-2">💰 Broker Benefits</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Earn commission on every converted lead</li>
              <li>• Unique affiliate link to share with clients</li>
              <li>• Real-time earnings tracking dashboard</li>
              <li>• Easy withdrawal requests</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password" required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Repeat password"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Broker Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
