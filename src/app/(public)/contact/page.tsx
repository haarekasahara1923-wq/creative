'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  category: string;
}

export default function ContactPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState({ callNumber: '', whatsappNumber: '' });
  const [form, setForm] = useState({ name: '', contactNo: '', residence: '', projectId: '', customerEmail: '' });
  const [affiliateCode, setAffiliateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [prefilledProject, setPrefilledProject] = useState('');

  useEffect(() => {
    // Read affiliate code from cookie
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    if (cookies.affiliate_ref) setAffiliateCode(cookies.affiliate_ref);

    // Read pre-filled project from URL
    const params = new URLSearchParams(window.location.search);
    const proj = params.get('project');
    if (proj) setPrefilledProject(proj);

    // Fetch projects and settings
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]).then(([p, s]) => {
      setProjects(p);
      setSettings({ callNumber: s.callNumber || '', whatsappNumber: s.whatsappNumber || '' });
      // Auto-select pre-filled project
      if (proj && p.length) {
        const found = p.find((pr: Project) => pr.name === proj);
        if (found) setForm((f) => ({ ...f, projectId: String(found.id) }));
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, affiliateCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // WhatsApp redirect
      const selectedProject = projects.find((p) => String(p.id) === form.projectId);
      const msg = encodeURIComponent(
        `Hi Creative Group! I'm ${form.name} from ${form.residence || 'N/A'}. I'm interested in ${selectedProject?.name || 'your projects'}. My contact: ${form.contactNo}`
      );
      const waNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
      if (waNumber) window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
          <p className="text-gray-400 mt-2">Get in touch with our team — we're here to help you find your dream home.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                  <p className="text-gray-400">Your enquiry has been received. Our team will contact you shortly.</p>
                  <p className="text-gray-400 mt-2 text-sm">You have been redirected to WhatsApp to connect with us instantly.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 bg-amber-500 text-slate-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-semibold text-white mb-2">Send an Enquiry</h2>
                  {affiliateCode && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 text-sm">
                      🔗 You arrived via a broker referral link.
                    </div>
                  )}
                  {prefilledProject && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-400 text-sm">
                      Enquiring about: <strong>{prefilledProject}</strong>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                      <input
                        type="text" required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact No *</label>
                      <input
                        type="tel" required
                        value={form.contactNo}
                        onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email (optional)</label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Residence / City</label>
                    <input
                      type="text"
                      value={form.residence}
                      onChange={(e) => setForm({ ...form, residence: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="Your city or address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Interested In</label>
                    <select
                      value={form.projectId}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    >
                      <option value="">Select a project (optional)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    {loading ? 'Sending...' : 'Submit Enquiry & Chat on WhatsApp'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {settings.callNumber && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Call Us</div>
                  <a href={`tel:${settings.callNumber}`} className="text-white font-semibold hover:text-amber-400 transition-colors">
                    {settings.callNumber}
                  </a>
                </div>
              </div>
            )}
            {settings.whatsappNumber && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">WhatsApp</div>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white font-semibold hover:text-green-400 transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            )}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Office</div>
                <div className="text-white font-semibold">Creative Group, Gwalior, MP</div>
              </div>
            </div>

            {/* OpenStreetMap */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 h-64">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=78.1,26.1,78.3,26.3&layer=mapnik&marker=26.218231,78.182404"
                width="100%" height="100%" style={{ border: 0 }}
                title="Creative Group Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
