import { Badge } from '../common/Badge';
import { ExternalLink, Edit2, Trash2, Globe, Lock } from 'lucide-react';
import { Github } from '../common/Icons';

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const statusVariants = {
    Planned: 'neutral',
    'In Progress': 'warning',
    Completed: 'success',
  };

  return (
    <div className="devtrack-card p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Title and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-[#263524] tracking-tight truncate group-hover:text-[#B65F3B] transition-colors">
              {project.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariants[project.status] || 'neutral'}>
                {project.status}
              </Badge>
              {project.isPublic ? (
                <span className="flex items-center gap-1 text-[11px] text-[#6E7167] font-mono" title="Visible on public profile">
                  <Globe className="w-3 h-3 text-[#263524]" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-[#6E7167] font-mono" title="Private project">
                  <Lock className="w-3 h-3 text-[#B65F3B]" /> Private
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-md text-[#6E7167] hover:text-[#263524] hover:bg-[#EAE2D3] transition-colors"
              title="Edit project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-md text-[#6E7167] hover:text-[#C24137] hover:bg-[#FDF2F0] transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#6E7167] line-clamp-3 mb-4 min-h-[3rem] leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Technologies Tags */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EAE2D3] text-[#292C25] border border-[#E3D5BD]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress & External Links */}
      <div className="pt-3 border-t border-[#E3D5BD] space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
            <span className="text-[#6E7167]">Progress</span>
            <span className="text-[#292C25] font-semibold">{project.completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                project.completionPercentage === 100
                  ? 'bg-[#263524]'
                  : project.completionPercentage > 50
                  ? 'bg-[#B65F3B]'
                  : 'bg-[#C27C2C]'
              }`}
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* External links */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#6E7167] hover:text-[#263524] transition-colors"
                title="View GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Repository</span>
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#B65F3B] hover:text-[#A3502E] font-medium transition-colors"
                title="View Live Application"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Live Demo</span>
              </a>
            )}
          </div>
          <span className="text-[10px] text-[#6E7167] font-mono">
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
