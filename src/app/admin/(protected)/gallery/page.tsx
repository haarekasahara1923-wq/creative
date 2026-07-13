'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Upload } from 'lucide-react';
import CloudinaryUploader from '@/components/ui/CloudinaryUploader';

interface GalleryItem { id: number; url: string; publicId: string; mediaType: string; albumTag?: string; }

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumTag, setAlbumTag] = useState('');
  const [toast, setToast] = useState('');

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/gallery');
    const data = await r.json();
    setItems(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const saveMedia = async (mediaType: 'image' | 'video', uploadData: { url: string; publicId: string }) => {
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: uploadData.url, publicId: uploadData.publicId, mediaType, albumTag: albumTag || null }),
    });
    setToast('Media uploaded!');
    fetchGallery();
    setTimeout(() => setToast(''), 3000);
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!confirm('Delete this media?')) return;
    await fetch('/api/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, publicId: item.publicId }),
    });
    setToast('Deleted!');
    fetchGallery();
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Gallery Management</h1>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      {/* Upload Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Media</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Album Tag (optional)</label>
          <input value={albumTag} onChange={(e) => setAlbumTag(e.target.value)}
            className="w-full max-w-xs bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            placeholder="e.g. exterior, interior, amenities" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CloudinaryUploader
            folder="creative-group/gallery"
            label="Upload Image"
            accept="image/*"
            mediaType="image"
            onUpload={(data) => saveMedia('image', data)}
          />
          <CloudinaryUploader
            folder="creative-group/gallery"
            label="Upload Video"
            accept="video/*"
            mediaType="video"
            onUpload={(data) => saveMedia('video', data)}
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">All Media ({items.length})</h2>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No media uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden bg-slate-700 aspect-square">
                {item.mediaType === 'image' ? (
                  <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => deleteItem(item)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {item.albumTag && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">{item.albumTag}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
