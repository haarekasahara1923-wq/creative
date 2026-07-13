import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projects, projectMedia } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Tag, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { PROJECT_TYPE_LABELS, PROJECT_CATEGORY_LABELS } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.slug, params.slug)).limit(1);
    if (!project) return { title: 'Project — Creative Group' };
    return { title: `${project.name} — Creative Group`, description: project.description?.slice(0, 150) };
  } catch {
    return { title: 'Project — Creative Group' };
  }
}

export default async function ProjectDetailPage({ params }: { params: { category: string; slug: string } }) {
  let project: any = null;
  let media: any[] = [];

  try {
    const [p] = await db.select().from(projects).where(and(eq(projects.slug, params.slug), eq(projects.category, params.category as any))).limit(1);
    if (p) {
      project = p;
      media = await db.select().from(projectMedia).where(eq(projectMedia.projectId, p.id)).orderBy(projectMedia.displayOrder);
    }
  } catch {}

  if (!project) notFound();

  const images = media.filter((m) => m.mediaType === 'image');
  const videos = media.filter((m) => m.mediaType === 'video');
  const amenitiesList = project.amenities || [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="bg-slate-900 border-b border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-amber-400">Home</Link>
            <span>/</span>
            <Link href={`/projects/${params.category}`} className="hover:text-amber-400">
              {PROJECT_CATEGORY_LABELS[params.category]} Projects
            </Link>
            <span>/</span>
            <span className="text-amber-400">{project.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-800 mb-8">
              {project.coverImageUrl ? (
                <img src={project.coverImageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl">🏛️</span>
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-medium">
                  {PROJECT_CATEGORY_LABELS[project.category]}
                </span>
                <span className="bg-slate-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                  {PROJECT_TYPE_LABELS[project.type]}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
              {project.location && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {project.location}
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">About This Project</h2>
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {/* Specifications */}
            {project.specifications && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Specifications</h2>
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{project.specifications}</p>
              </div>
            )}

            {/* BHK Options */}
            {project.bhkOptions && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Available Options</h2>
                <p className="text-gray-400">{project.bhkOptions}</p>
              </div>
            )}

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img: any) => (
                    <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-slate-800">
                      <img src={img.url} alt="Project gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((v: any) => (
                    <video key={v.id} src={v.url} controls className="w-full rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {project.mapEmbedUrl ? (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
                <div className="rounded-2xl overflow-hidden h-64">
                  <iframe src={project.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
                <div className="rounded-2xl overflow-hidden h-64">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=78.1,26.1,78.3,26.3&layer=mapnik`}
                    width="100%" height="100%" style={{ border: 0 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Project Details</h3>
                <div className="space-y-3">
                  {project.priceRange && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      <div>
                        <div className="text-xs text-gray-500">Price Range</div>
                        <div className="text-amber-400 font-semibold">{project.priceRange}</div>
                      </div>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-gray-300 text-sm">{project.location}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="text-gray-300 text-sm">{PROJECT_TYPE_LABELS[project.type]}</div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/contact?project=${encodeURIComponent(project.name)}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Enquire Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Why Creative Group */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
                <h4 className="text-white font-medium mb-3">Why Creative Group?</h4>
                <ul className="space-y-2">
                  {['Best & Affordable Prices', 'Clear Legal Titles', 'Premium Quality', 'Expert Support'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
