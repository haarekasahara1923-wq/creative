'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/admin/ProjectForm';

interface Project {
  id: number; name: string; slug: string; category: string; type: string;
  location?: string; priceRange?: string; coverImageUrl?: string;
  isActive: boolean; commissionRate?: string; createdAt: string;
}

const categoryColors: Record<string, string> = {
  running: 'bg-green-500/20 text-green-400',
  upcoming: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [toast, setToast] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/projects?activeOnly=false');
    const data = await r.json();
    setProjects(Array.isArray(data) ? data.reverse() : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setToast('Project deleted');
    fetchProjects();
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditProject(null);
    setToast('Project saved successfully!');
    fetchProjects();
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <div className="flex gap-3">
          <button onClick={fetchProjects} className="flex items-center gap-2 bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => { setEditProject(null); setFormOpen(true); }}
            className="flex items-center gap-2 bg-amber-500 text-slate-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-amber-400 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
        </div>
      </div>
      {toast && <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-xl text-sm">{toast}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Project', 'Category', 'Type', 'Price', 'Commission', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No projects yet. Click "Add Project" to create one.</td></tr>
              ) : projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.coverImageUrl ? (
                        <img src={p.coverImageUrl} alt={p.name} className="h-10 w-14 object-cover rounded-lg" />
                      ) : (
                        <div className="h-10 w-14 bg-slate-700 rounded-lg flex items-center justify-center text-gray-600 text-xs">No img</div>
                      )}
                      <div>
                        <div className="text-white text-sm font-medium">{p.name}</div>
                        <div className="text-gray-500 text-xs">{p.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[p.category]}`}>{p.category}</span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{p.type.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-amber-400 text-sm">{p.priceRange || '-'}</td>
                  <td className="p-4 text-gray-400 text-sm">{p.commissionRate ? `${p.commissionRate}%` : '-'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditProject(p); setFormOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditProject(null); }} title={editProject ? 'Edit Project' : 'Add New Project'} size="xl">
        <ProjectForm project={editProject} onSuccess={handleFormSuccess} onCancel={() => { setFormOpen(false); setEditProject(null); }} />
      </Modal>
    </div>
  );
}
