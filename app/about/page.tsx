import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Newsletter from '@/components/Newsletter';
import Link from 'next/link';
import { Code, Clock, Target, Zap, Coffee, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  const principles = [
    {
      icon: <Clock className="w-8 h-8 text-yellow-400" />,
      title: "Time Boxing",
      description: "Each project gets exactly 60 minutes. No exceptions, no extensions. This forces quick decision-making and prevents perfectionism."
    },
    {
      icon: <Target className="w-8 h-8 text-yellow-400" />,
      title: "Focus on MVP",
      description: "Build the minimum viable product that demonstrates the core concept. Polish comes later, functionality comes first."
    },
    {
      icon: <Code className="w-8 h-8 text-yellow-400" />,
      title: "Clean Code",
      description: "Even under time pressure, maintain code quality. Good practices should be muscle memory, not compromises."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-400" />,
      title: "Learn by Doing",
      description: "Every project introduces something new - a technology, pattern, or concept. The challenge is also a learning journey."
    }
  ];

  const stats = [
    { label: "Hours Committed", value: "24", suffix: "" },
    { label: "Projects Planned", value: "24", suffix: "" },
    { label: "Technologies", value: "12", suffix: "+" },
    { label: "Coffee Cups", value: "∞", suffix: "" }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            About <span className="text-yellow-400">Build24</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Build24 is an ambitious coding challenge: create 24 unique, functional projects in 24 hours. 
            It's about pushing creative boundaries, learning rapidly, and proving that great ideas can come to life quickly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* The Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">The Story Behind Build24</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                As developers, we often get caught up in perfectionism. We spend weeks planning, 
                over-engineering solutions, and second-guessing our decisions. Build24 is the antidote to that.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                The idea is simple: what if we removed all the barriers and just built? What if we 
                embraced constraints instead of fighting them? What amazing things could we create 
                when time is limited and creativity is unleashed?
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Each hour brings a new challenge, a fresh start, and an opportunity to explore 
                technologies, patterns, and ideas that might otherwise remain in the "someday" pile.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">The Rules</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Each project gets exactly 60 minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>No preparation beyond the initial idea</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Must be functional by the end of the hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Document the process and learnings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Share everything - successes and failures</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Principles */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Principles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {principle.icon}
                    <CardTitle className="text-white">{principle.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base leading-relaxed">
                    {principle.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-900/50 rounded-lg p-8 mb-20">
          <h2 className="text-2xl font-bold mb-6 text-center">Technologies in the Arsenal</h2>
          <p className="text-gray-400 text-center mb-8">
            A diverse toolkit to tackle any type of project that comes to mind
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Frontend</h3>
              <ul className="space-y-2 text-gray-300">
                <li>React & Next.js</li>
                <li>Vue.js & Nuxt</li>
                <li>Svelte & SvelteKit</li>
                <li>Vanilla JavaScript</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Backend</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Node.js & Express</li>
                <li>Python & FastAPI</li>
                <li>Serverless Functions</li>
                <li>WebSockets</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Tools & Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li>AI APIs (OpenAI, etc.)</li>
                <li>Real-time Databases</li>
                <li>External APIs</li>
                <li>Mobile Frameworks</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Journey</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Follow along as the challenge unfolds. Every success, every failure, every lesson learned 
            will be documented and shared.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-8 py-6 h-auto">
              <Link href="/blog">Read the Blog</Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6 h-auto">
              <Link href="/projects">View Projects</Link>
            </Button>
          </div>
        </div>
      </div>

      <Newsletter />
    </div>
  );
}