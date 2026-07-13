import Link from 'next/link';
import { MapPin, Tag, TrendingUp } from 'lucide-react';
import { PROJECT_TYPE_LABELS, PROJECT_CATEGORY_LABELS } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  running: 'bg-green-500/20 text-green-400 border-green-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface ProjectCardProps {
  id: number;
  name: string;
  slug: string;
  category: string;
  type: string;
  location?: string | null;
  priceRange?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
}

export default function ProjectCard({
  name, slug, category, type, location, priceRange, coverImageUrl,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${category}/${slug}`}
      className="group block bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-700">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[category] || categoryColors.running}`}>
            {PROJECT_CATEGORY_LABELS[category] || category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">
          {name}
        </h3>
        <div className="flex flex-col gap-1.5">
          {location && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              {location}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Tag className="h-3.5 w-3.5 text-amber-500" />
            {PROJECT_TYPE_LABELS[type] || type}
          </div>
          {priceRange && (
            <div className="flex items-center gap-1.5 text-amber-400 text-sm font-medium mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {priceRange}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
