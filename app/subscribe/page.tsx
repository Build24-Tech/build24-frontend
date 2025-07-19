import Header from '@/components/Header';
import Newsletter from '@/components/Newsletter';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back to Home */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-16">
          <Mail className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Subscribe to <span className="text-yellow-400">Build24</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get exclusive updates on the Build24 journey. Follow along as 24 unique projects 
            come to life in 24 hours, with behind-the-scenes insights and lessons learned.
          </p>
        </div>

        {/* Newsletter Component */}
        <div className="max-w-2xl mx-auto">
          <Newsletter />
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">What You'll Get</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-400">
                Get notified as soon as each project is completed with links to demos and source code.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Behind the Scenes</h3>
              <p className="text-gray-400">
                Exclusive insights into the development process, challenges faced, and lessons learned.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Early Access</h3>
              <p className="text-gray-400">
                Be the first to try out new projects and get access to exclusive content and resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}