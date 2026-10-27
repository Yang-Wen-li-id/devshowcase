import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Github, 
  Star, 
  ArrowRight, 
  Tag as TagIcon,
  Cpu,
  Layers,
  Globe,
  Terminal,
  Gamepad2,
  Server
} from 'lucide-react';

const categoryStyles = {
  'Web App': {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    icon: Globe,
    accent: 'hover:border-cyan-500/50',
  },
  'Network Topology': {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: Server,
    accent: 'hover:border-emerald-500/50',
  },
  'Game Dev': {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: Gamepad2,
    accent: 'hover:border-purple-500/50',
  },
  'System Admin': {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: Terminal,
    accent: 'hover:border-amber-500/50',
  },
};

export default function ProjectCard({ project }) {
  const catStyle = categoryStyles[project.category] || categoryStyles['Web App'];
  const CategoryIcon = catStyle.icon;

  return (
    <div className={`glass-panel rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${catStyle.accent} hover:shadow-lg hover:shadow-cyan-500/5 group relative overflow-hidden`}>
      
      {/* Ambient background glow on hover */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${catStyle.badge}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {project.category}
          </span>

          <div className="flex items-center gap-1.5">
            {project.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-300" />
                Featured
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60">
              {project.license || 'MIT'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
          <Link to={`/project/${project.slug}`}>
            {project.title}
          </Link>
        </h3>

        {/* Slug identifier */}
        <p className="text-xs font-mono text-slate-400 mb-4 truncate">
          /{project.slug}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags && project.tags.length > 0 ? (
            project.tags.map((tag) => (
              <span
                key={tag.id || tag.name}
                className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/70 flex items-center gap-1"
              >
                <TagIcon className="w-2.5 h-2.5 text-cyan-400" />
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Tidak ada tag</span>
          )}
        </div>
      </div>

      {/* Card Actions & Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/project/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
        >
          <span>Detail & Dokumen</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>

        <div className="flex items-center gap-2">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Repository GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Live Demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
