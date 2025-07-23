import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="w-full h-[400px] bg-yellow-300 text-black flex items-center justify-center">
      <div className="w-full text-center px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2">Welcome to Build24</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Build, Ship, and Learn</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl mb-12">
          Join us for a 24-hour hackathon to build amazing projects, learn from the best, and connect with a vibrant community of developers. Let's build the future, together.
        </p>
        <a
          href="#"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
        >
          Get Started <ArrowRight className="ml-2" />
        </a>
      </div>
    </div>
  );
};

export default Hero;

