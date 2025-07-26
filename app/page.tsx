import Header from '@/components/Header';
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
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section */}
      <section id="hero" className="relative bg-black text-white py-20 md:py-32 hero-glow">
        <div className="absolute inset-0 bg-grid-gray-800/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)] hero-glow-inner"></div>
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
                    width={120}
                    height={120}
                    className="w-32 h-32"
                  />
                </Link>
                <p className="text-gray-400 mb-4 max-w-md">
                  It’s about intensity. One product idea. Built in 24 hours. Documented in public.
                </p>
                <div className="flex gap-4">
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Navigate</h3>
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
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      GitHub Repos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Join Discord
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Get in Touch
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
                <p className="text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} Build24. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
