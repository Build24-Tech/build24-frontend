import Image from 'next/image';
import React from 'react';

interface TestimonialCardProps {
  avatar: string;
  name: string;
  handle: string;
  text: string;
  timestamp: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ avatar, name, handle, text, timestamp }) => {
  return (
    <div className="bg-[#E0FF4F] text-black rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center mb-4">
          <Image src={avatar} alt={name} width={48} height={48} className="rounded-full" />
          <div className="ml-4">
            <p className="font-bold">{name}</p>
            <p className="text-sm text-gray-600">{handle}</p>
          </div>
        </div>
        <p className="text-base">{text}</p>
      </div>
      <p className="text-xs text-gray-500 mt-4">{timestamp}</p>
    </div>
  );
};

export default TestimonialCard;
