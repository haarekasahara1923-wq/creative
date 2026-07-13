import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import ProjectCard from '@/components/public/ProjectCard';
import type { Metadata } from 'next';

const categoryMeta: Record<string, { title: string; description: string }> = {
  running: { title: 'Running Projects', description: 'Currently active real estate projects by Creative Group, Gwalior.' },
  upcoming: { title: 'Upcoming Projects', description: 'Exciting upcoming projects launching soon by Creative Group, Gwalior.' },
  completed: { title: 'Completed Projects', description: 'Successfully completed premium projects by Creative Group, Gwalior.' },
};

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const meta = categoryMeta[params.category];
  if (!meta) return { title: 'Projects — Creative Group' };
  return { title: `${meta.title} — Creative Group`, description: meta.description };
}

export default async function ProjectsPage({ params }: { params: { category: string } }) {
  const { category } = params;
  if (!['running', 'upcoming', 'completed'].includes(category)) notFound();

  let projectsList: any[] = [];
  try {
    projectsList = await db
      .select()
      .from(projects)
      .where(and(eq(projects.category, category as any), eq(projects.isActive, true)))
      .orderBy(projects.createdAt);
  } catch {}

  const meta = categoryMeta[category];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <a href="/" className="hover:text-amber-400 transition-colors">Home</a>
            <span>/</span>
            <span className="text-amber-400">{meta.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{meta.title}</h1>
          <p className="text-gray-400 mt-2">{meta.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projectsList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Projects Yet</h2>
            <p className="text-gray-400">Check back soon for {category} projects from Creative Group.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsList.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
