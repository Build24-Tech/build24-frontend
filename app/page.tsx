import Newsletter from '@/components/Newsletter';
import ProjectCardYellow from '@/components/ProjectCardYellow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Code, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

export default function Home() {
  const featuredProjects = [
    {
      id: 1,
      title: "AI-Powered Task Manager",
      description: "Built a smart task management app with AI categorization.",
      tech: ["Next.js", "OpenAI", "Tailwind CSS"],
      duration: "24 hours",
      status: "completed" as const
    },
    {
      id: 2,
      title: "Real-time Chat App",
      description: "Full-featured chat application with WebSocket connections.",
      tech: ["React", "Socket.io", "Node.js"],
      duration: "24 hours",
      status: "completed" as const
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Beautiful weather app with location-based forecasts.",
      tech: ["Vue.js", "Weather API", "Mapbox"],
      duration: "18 hours",
      status: "in-progress" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Section */}
      <section id="hero" className="relative bg-background text-foreground py-20 md:py-32 hero-glow">
        <div className="absolute inset-0 bg-grid-foreground/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)] hero-glow-inner"></div>
        <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-3xl opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-bold tracking-widest text-yellow-400 uppercase mb-4">
              FROM IDEA TO PRODUCT. IN JUST 24 HOURS.
            </p>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Build fast. Ship faster.
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed">
              One product idea. Built in 24 hours. Documented in public.
            </p>

            <div className="mt-12">
              <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
                Follow real-time product builds — from zero to launch — in just 24 hours.
                <br />Tools, code, insights, and chaos — everything shared in public.
              </p>
              <Link href="/login" className="bg-yellow-400 text-black font-bold py-4 px-10 rounded-full text-xl hover:bg-yellow-300 transition-colors duration-300 inline-block">
                Join Build24 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-yellow-500 to-yellow-400">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
              Start Building Today - No Cost, No Risk
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-1 line-through">$79/month</div>
                <div className="text-lg text-gray-800">Regular Price</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-1">$0</div>
                <div className="text-lg text-gray-800">Free Today</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-1">$0</div>
                <div className="text-lg text-gray-800">No Hidden Fees</div>
              </div>
            </div>
            <p className="mt-6 text-black/80">
              Join thousands of developers building amazing products with our platform
            </p>
            <button className="mt-8 bg-black text-yellow-400 font-bold py-3 px-8 rounded-full hover:bg-gray-900 transition-colors duration-300">
              Get Started Now - It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-2">HERE TO SERVE</h4>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Empowering our people</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From AI tools to Chrome extensions and mobile apps — Build24 documents the real, raw journey of building products in 24 hours. No gatekeeping. No filler. Just daily lessons, shipped code, and honest insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
            {featuredProjects.map((project) => (
              <ProjectCardYellow key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-10 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${num === 2 ? 'bg-[#E0FF4F] text-black' : 'bg-gray-800 text-white'}`}
              >
                {String(num).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">The 24-Hour Build Challenge</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Transform your idea into a working prototype in just 24 hours. This challenge
                  is about focused execution, making smart decisions under time pressure, and
                  bringing your vision to life in a single day.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  From concept to deployment, every minute counts. Learn how to prioritize features,
                  make quick iterations, and create something amazing in a single, intense
                  development sprint.
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
    </div>
  );
}
