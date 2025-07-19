import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    planned: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white group-hover:text-yellow-400 transition-colors">
              {project.title}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {project.description}
            </CardDescription>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-yellow-400 transition-colors" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{project.duration}</span>
          <Badge className={`ml-auto ${statusColors[project.status]}`}>
            {project.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-gray-600 text-gray-300 text-xs"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}