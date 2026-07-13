'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface GalleryItem {
  id: number;
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  albumTag?: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => filter === 'all' || i.mediaType === filter);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Gallery</h1>
          <p className="text-gray-400 mt-2">Explore our projects, developments, and community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8">
          {([['all', 'All'], ['image', 'Images'], ['video', 'Videos']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === val ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-gray-400">No {filter === 'all' ? '' : filter} media uploaded yet.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden bg-slate-800 hover:ring-2 hover:ring-amber-500 transition-all"
                onClick={() => setLightbox(item)}
              >
                {item.mediaType === 'image' ? (
                  <img src={item.url} alt="Gallery" className="w-full object-cover" loading="lazy" />
                ) : (
                  <video src={item.url} className="w-full" muted />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-amber-400" onClick={() => setLightbox(null)}>
            <X className="h-8 w-8" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh]">
            {lightbox.mediaType === 'image' ? (
              <img src={lightbox.url} alt="Gallery" className="max-h-[90vh] max-w-full rounded-xl" />
            ) : (
              <video src={lightbox.url} controls autoPlay className="max-h-[90vh] max-w-full rounded-xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
