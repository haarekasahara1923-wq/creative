import Link from 'next/link';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import ProjectCard from '@/components/public/ProjectCard';
import { Phone, ArrowRight, Building, CheckCircle, Award, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Projects', value: '15+', icon: Building },
  { label: 'Happy Families', value: '500+', icon: CheckCircle },
  { label: 'Years Experience', value: '10+', icon: Award },
  { label: 'Acres Developed', value: '50+', icon: TrendingUp },
];

export default async function HomePage() {
  let runningProjects: any[] = [];
  try {
    runningProjects = await db
      .select()
      .from(projects)
      .where(and(eq(projects.category, 'running'), eq(projects.isActive, true)))
      .limit(6);
  } catch {}

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" />
            Now Available in Gwalior
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Dream Home
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              In Gwalior
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Residential Plots &bull; Flats (1/2/3 BHK) &bull; Duplex &bull; Row Houses
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Best & Affordable Prices', 'Premium Development', 'First Time in Gwalior'].map((tag) => (
              <span key={tag} className="bg-white/5 border border-white/10 text-gray-300 px-4 py-1.5 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects/running"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/25"
            >
              Explore Projects
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              <Phone className="h-5 w-5" />
              Get In Touch
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-gray-600 rounded-full flex items-center justify-center">
            <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-3">
                  <Icon className="h-6 w-6 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Running Projects */}
      {runningProjects.length > 0 && (
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Currently Active</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Running Projects</h2>
              <p className="text-gray-400 mt-4 max-w-xl mx-auto">Premium developments currently underway — secure your unit before they're sold out</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runningProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/projects/running"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                View All Running Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Why Creative Group</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">First Time in Gwalior — Premium Real Estate</h2>
              <div className="space-y-4">
                {[
                  { title: 'Best Prices Guaranteed', desc: 'Competitive pricing without compromising on quality or amenities.' },
                  { title: 'Premium Construction', desc: 'Modern design, top-grade materials, and master craftsmanship.' },
                  { title: 'Legal & Clear Titles', desc: 'All projects with fully verified legal documents and RERA compliance.' },
                  { title: 'Prime Locations', desc: 'Strategically located plots and flats across Gwalior with excellent connectivity.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{title}</div>
                      <div className="text-gray-400 text-sm mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 mt-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Learn More About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-3xl p-8 border border-amber-500/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏛️</div>
                  <div className="text-white font-bold text-2xl mb-2">Creative Group</div>
                  <div className="text-amber-400 font-medium mb-4">Gwalior, MP</div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-amber-400">15+</div>
                      <div className="text-gray-400 text-xs">Projects</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-amber-400">500+</div>
                      <div className="text-gray-400 text-xs">Customers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-slate-800 mb-8 text-lg">
            Contact us today and let our experts guide you to the perfect home.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-all hover:scale-105"
          >
            Enquire Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
