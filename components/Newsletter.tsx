'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-20 bg-yellow-400/5">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 text-lg mb-8">
            Follow the Build24 journey in real-time and never miss an update.
          </p>
          
          <Link 
            href="https://forms.gle/gBBDNsvk5RTHE83z8" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-colors duration-300"
          >
            Follow Our Journey
          </Link>
        </div>
      </div>
    </section>
  );
}