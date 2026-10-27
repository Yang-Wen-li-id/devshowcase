import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Github, 
  Star, 
  ArrowRight, 
  Layers, 
  Globe, 
  Server, 
  Terminal, 
  Gamepad2,
  Tag as TagIcon
} from 'lucide-react';

const categoryBadges = {
  'Web App': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Globe,
  },
  'Network Topology': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Server,
  },
  'Game Dev': {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Gamepad2,
  },
  'System Admin': {
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Terminal,
  },
};

export default function ProjectCard({ project }) {
  const catStyle = categoryBadges[project.category] || categoryBadges['Web App'];
  const CategoryIcon = catStyle.icon;

  return (
    <div className="clean-card rounded-2xl p-6 flex flex-col justify-between group hover:border-blue-300 transition-all duration-300">
      
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle.badge}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {project.category}
          </span>

          <div className="flex items-center gap-1.5">
            {project.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Featured
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
              {project.license || 'MIT'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
          <Link to={`/project/${project.slug}`}>
            {project.title}
          </Link>
        </h3>

        {/* Slug Identifier */}
        <p className="text-xs font-mono text-slate-400 mb-4">
          /{project.slug}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags && project.tags.length > 0 ? (
            project.tags.map((tag) => (
              <span
                key={tag.id || tag.name}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 group-hover:border-blue-200 transition-colors"
              >
                <TagIcon className="w-2.5 h-2.5 text-blue-500" />
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No tags</span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/project/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group/link"
        >
          <span>Case Study & Specs</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>

        <div className="flex items-center gap-2">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Live Demo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Demo</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
