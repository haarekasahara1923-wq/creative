import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Creative Group',
};

export default async function TermsPage() {
  let content = '';
  try {
    const [s] = await db.select().from(siteSettings).limit(1);
    content = s?.termsContent || '';
  } catch {}

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Terms & Conditions</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {content || 'Terms & Conditions content is being updated. Please check back soon.'}
          </div>
        </div>
      </div>
    </div>
  );
}
