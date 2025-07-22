import Image from 'next/image';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    tech: string[];
    duration: string;
    status: 'completed' | 'in-progress' | 'planned';
  };
}

const ProjectCardYellow: React.FC<ProjectCardProps> = ({ project }) => {
  // Avatar placeholder - you can replace with actual project images later
  const avatarPath = `/images/project-avatar-${project.id}.png`;
  
  // Status emoji mapping
  const statusEmoji = {
    'completed': '✅',
    'in-progress': '🔄',
    'planned': '📅'
  };
  
  return (
    <div className="bg-[#E0FF4F] text-black rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center overflow-hidden">
            {/* Fallback icon if no image */}
            <span className="text-xl">{project.title.charAt(0)}</span>
          </div>
          <div className="ml-4">
            <p className="font-bold">{project.title}</p>
            <p className="text-sm text-gray-600">{project.duration}</p>
          </div>
        </div>
        <p className="text-base">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tech.map((tech, index) => (
            <Badge 
              key={index} 
              className="bg-black/10 hover:bg-black/20 text-black border-none"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          {statusEmoji[project.status]} {project.status.replace('-', ' ')}
        </p>
      </div>
    </div>
  );
};

export default ProjectCardYellow;
