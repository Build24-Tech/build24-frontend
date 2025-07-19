import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Clock, Code, Lightbulb, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Newsletter from '@/components/Newsletter';
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  const featuredProjects = [
    {
      id: 1,
      title: "AI-Powered Task Manager",
      description: "Built a smart task management app with AI categorization in just 1 hour",
      tech: ["Next.js", "OpenAI", "Tailwind"],
      duration: "1 hour",
      status: "completed" as const
    },
    {
      id: 2,
      title: "Real-time Chat App",
      description: "Full-featured chat application with WebSocket connections and user presence",
      tech: ["React", "Socket.io", "Node.js"],
      duration: "1 hour",
      status: "completed" as const
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Beautiful weather app with location-based forecasts and interactive maps",
      tech: ["Vue.js", "Weather API", "Mapbox"],
      duration: "1 hour",
      status: "in-progress" as const
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">24 Projects in 24 Hours</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Build<span className="text-yellow-400">24</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              A coding marathon to build 24 unique projects in 24 hours. 
              Follow the journey, learn from the process, and get inspired to build.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-8 py-6 h-auto">
                <Link href="/blog">
                  Read the Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6 h-auto">
                View Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">24</div>
              <div className="text-gray-400">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">24</div>
              <div className="text-gray-400">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">12</div>
              <div className="text-gray-400">Technologies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">∞</div>
              <div className="text-gray-400">Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Each project built in exactly one hour. No preparation, just pure coding and creativity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">The Challenge</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Building 24 projects in 24 hours isn't just about coding fast—it's about 
                  learning to think creatively under pressure, making quick decisions, and 
                  embracing the beautiful chaos of rapid prototyping.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Each hour brings a new challenge, a new technology to explore, and a new 
                  opportunity to push the boundaries of what's possible in 60 minutes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <Clock className="w-8 h-8 text-yellow-400 mb-2" />
                    <CardTitle className="text-white text-lg">Fast Building</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">Quick iterations and rapid prototyping</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <Lightbulb className="w-8 h-8 text-yellow-400 mb-2" />
                    <CardTitle className="text-white text-lg">Creative Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">Pushing creative boundaries every hour</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <Code className="w-8 h-8 text-yellow-400 mb-2" />
                    <CardTitle className="text-white text-lg">Clean Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">Quality code even under time pressure</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                    <CardTitle className="text-white text-lg">Innovation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">Exploring new technologies and patterns</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Link href="/" className="text-2xl font-bold text-yellow-400">
                Build24
              </Link>
              <p className="text-gray-400 mt-1">24 projects in 24 hours</p>
            </div>
            <div className="flex gap-6">
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}