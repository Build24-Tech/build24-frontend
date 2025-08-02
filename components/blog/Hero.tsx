import { createLangPath } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import { ArrowRight, Clock, Code, Target, Users, Zap } from 'lucide-react';

const Hero = ({ currentLanguage }: { currentLanguage: UserLanguage }) => {
  const stats = [
    { icon: Clock, value: '24', label: 'Hours', suffix: '' },
    { icon: Code, value: '100+', label: 'Projects', suffix: '' },
    { icon: Zap, value: '∞', label: 'Possibilities', suffix: '' },
    { icon: Users, value: '1000+', label: 'Builders', suffix: '' }
  ];

  return (
    <div className="relative w-full min-h-[600px] bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-black/10 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-black/10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-black/10 rounded-full animate-pulse delay-500"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-black/10 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
            <Target className="w-4 h-4 mr-2" />
            Build24 Challenge
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight">
            Build
            <span className="block text-4xl md:text-6xl lg:text-7xl font-medium mt-2 opacity-80">
              in 24 Hours
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-4xl mx-auto text-xl md:text-2xl mb-12 leading-relaxed font-medium">
            One product idea. Built in 24 hours. Documented in public.
            <span className="block text-lg md:text-xl mt-2 opacity-80 font-normal">
              Join the ultimate coding challenge where intensity meets innovation.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="#blog-posts"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Learn More
            </a>
            <a
              href={createLangPath('/projects', currentLanguage)}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border-2 border-black/20"
            >
              Explore Projects <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black/10 rounded-full mb-4 group-hover:bg-black/20 transition-colors duration-300">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm font-medium opacity-80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-black/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-black/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

