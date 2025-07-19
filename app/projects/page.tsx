import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { Filter } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "AI-Powered Task Manager",
      description: "Smart task management app with AI categorization and priority scoring using OpenAI's GPT model.",
      tech: ["Next.js", "OpenAI", "Tailwind", "TypeScript"],
      duration: "1 hour",
      status: "completed" as const
    },
    {
      id: 2,
      title: "Real-time Chat Application",
      description: "Full-featured chat app with WebSocket connections, user presence, message history, and file sharing.",
      tech: ["React", "Socket.io", "Node.js", "Express"],
      duration: "1 hour",
      status: "completed" as const
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Beautiful weather app with location-based forecasts, interactive maps, and detailed weather data.",
      tech: ["Vue.js", "Weather API", "Mapbox", "Vuex"],
      duration: "1 hour",
      status: "completed" as const
    },
    {
      id: 4,
      title: "Expense Tracker",
      description: "Personal finance app with expense categorization, budget tracking, and financial insights.",
      tech: ["React Native", "SQLite", "Chart.js"],
      duration: "1 hour",
      status: "in-progress" as const
    },
    {
      id: 5,
      title: "Code Snippet Manager",
      description: "Developer tool for organizing and sharing code snippets with syntax highlighting and search.",
      tech: ["Svelte", "Prism.js", "IndexedDB"],
      duration: "1 hour",
      status: "planned" as const
    },
    {
      id: 6,
      title: "Meditation Timer",
      description: "Mindfulness app with guided meditations, custom timers, and progress tracking.",
      tech: ["Flutter", "Dart", "Audio"],
      duration: "1 hour",
      status: "planned" as const
    }
  ];

  const technologies = Array.from(new Set(projects.flatMap(p => p.tech))).sort();
  const statuses = ['all', 'completed', 'in-progress', 'planned'];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            All <span className="text-yellow-400">Projects</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every project built during the Build24 challenge. From AI-powered apps to simple utilities, 
            each one completed in exactly 60 minutes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Status:</span>
            <div className="flex gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Technologies Used */}
        <div className="bg-gray-900/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Technologies Used</h2>
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}