import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — Creative Group',
  description: 'Learn about Creative Group — Gwalior\'s premier real estate developer offering premium residential plots, flats, duplex, and row houses.',
};

export default async function AboutPage() {
  let content = '';
  try {
    const [s] = await db.select().from(siteSettings).limit(1);
    content = s?.aboutContent || '';
  } catch {}

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">About Us</h1>
          <p className="text-gray-400 mt-2">Learn about Creative Group and our mission</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content ? (
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Creative Group</h2>
              <p className="text-gray-300 leading-relaxed">
                Creative Group is a premier real estate developer based in Gwalior, Madhya Pradesh. We specialize in
                Residential Plot Projects, Flats (1/2/3 BHK), Duplex, and Row Houses — delivering premium quality
                at the most affordable prices.
              </p>
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-amber-400 font-semibold text-center text-lg">
                  Best & Affordable Prices | Premium Development | First Time in Gwalior
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[{ title: 'Our Mission', icon: '🎯', desc: 'To provide every family in Gwalior access to premium, affordable housing through transparent, quality-first real estate development.' },
                { title: 'Our Vision', icon: '👁️', desc: 'To become Gwalior\'s most trusted real estate brand by delivering projects that exceed expectations in quality, design, and value.' },
                { title: 'Our Values', icon: '❤️', desc: 'Integrity, Quality, Transparency, Customer-First approach. Every project is built on the foundation of trust and excellence.' }]
                .map(({ title, icon, desc }) => (
                <div key={title} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
