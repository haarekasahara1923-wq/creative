'use client';

import { useState } from 'react';
import CloudinaryUploader from '@/components/ui/CloudinaryUploader';
import { slugify } from '@/lib/utils';

const CATEGORIES = ['running', 'upcoming', 'completed'];
const TYPES = ['plot', 'flat_1bhk', 'flat_2bhk', 'flat_3bhk', 'duplex', 'row_house'];
const TYPE_LABELS: Record<string, string> = {
  plot: 'Plot', flat_1bhk: '1 BHK Flat', flat_2bhk: '2 BHK Flat',
  flat_3bhk: '3 BHK Flat', duplex: 'Duplex', row_house: 'Row House',
};

interface ProjectFormProps {
  project?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState({
    name: project?.name || '',
    slug: project?.slug || '',
    category: project?.category || 'running',
    type: project?.type || 'plot',
    description: project?.description || '',
    priceRange: project?.priceRange || '',
    location: project?.location || '',
    amenities: (project?.amenities || []).join('\n'),
    commissionRate: project?.commissionRate || '',
    mapEmbedUrl: project?.mapEmbedUrl || '',
    bhkOptions: project?.bhkOptions || '',
    specifications: project?.specifications || '',
    isActive: project?.isActive ?? true,
    coverImageUrl: project?.coverImageUrl || '',
    coverImagePublicId: project?.coverImagePublicId || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: project ? form.slug : slugify(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        amenities: form.amenities.split('\n').map((a: string) => a.trim()).filter(Boolean),
      };
      const url = project ? `/api/projects/${project.id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
          <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Green Valley Residency" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
          <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="green-valley-residency" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
          <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500">
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Morar, Gwalior" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
          <input value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="₹15L - ₹45L" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission Rate (%)</label>
          <input type="number" min="0" max="100" step="0.01"
            value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="2.5" />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="isActive" checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 text-amber-500" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible on website)</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          placeholder="Describe the project..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">BHK Options</label>
          <input value={form.bhkOptions} onChange={(e) => setForm({ ...form, bhkOptions: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="1 BHK, 2 BHK, 3 BHK" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Map Embed URL</label>
          <input value={form.mapEmbedUrl} onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="https://www.google.com/maps/embed?..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities (one per line)</label>
        <textarea rows={4} value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono text-sm"
          placeholder="24/7 Security\nParking\nPower Backup\nChildren's Play Area" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Specifications</label>
        <textarea rows={3} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          placeholder="RCC frame structure, vitrified tiles, modular kitchen..." />
      </div>

      <CloudinaryUploader
        folder="creative-group/projects"
        label="Cover Image"
        currentUrl={form.coverImageUrl}
        onUpload={({ url, publicId }) => setForm({ ...form, coverImageUrl: url, coverImagePublicId: publicId })}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 bg-amber-500 text-slate-900 font-bold py-3 rounded-xl text-sm hover:bg-amber-400 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
}
