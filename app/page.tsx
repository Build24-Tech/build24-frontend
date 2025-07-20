import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Clock, Code, Lightbulb, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Newsletter from '@/components/Newsletter';
import ProjectCard from '@/components/ProjectCard';
import Image from 'next/image';

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
              <div className="flex items-center justify-center">
                <Image 
                  src="/build24_logo_light.svg" 
                  alt="Build24" 
                  width={120} 
                  height={120}
                  className="w-24 h-24 sm:w-30 sm:h-30"
                />
              </div>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              A coding marathon to build 24 unique projects in 24 hours. 
              Follow the journey, learn from the process, and get inspired to build.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-8 py-6 h-auto">
                <Link href="/" className="block">
                  <Image 
                    src="/build24_logo_light.svg" 
                    alt="Build24" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
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
      <footer className="bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center mb-4">
                  <Image 
                    src="/build24_logo_light.svg" 
                    alt="Build24" 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                  <span className="ml-3 text-xl font-bold text-white">Build24</span>
                </Link>
                <p className="text-gray-400 mb-4 max-w-md">
                  A coding marathon to build 24 unique projects in 24 hours. 
                  Follow the journey, learn from the process, and get inspired to build.
                </p>
                <div className="flex gap-4">
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                      Login
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      API Reference
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Support
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Community
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Copyright Bar */}
          <div className="border-t border-gray-800 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <Image 
                  src="/domain.light.svg" 
                  alt="Genius App" 
                  width={24} 
                  height={24}
                  className="w-6 h-6"
                />
                <p className="text-gray-400">
                  © {new Date().getFullYear()} Genius App. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}