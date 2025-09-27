'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if localStorage exists and has credentials with email
    if (typeof window !== 'undefined' && localStorage) {
      const credentials = localStorage.getItem('credentials');
      if (credentials) {
        try {
          const parsedCredentials = JSON.parse(credentials);
          if (parsedCredentials && parsedCredentials.email) {
            // Redirect to chat if credentials exist with email
            router.push('/chat');
          }
        } catch (error) {
          console.error('Error parsing credentials from localStorage:', error);
        }
      }
    }
  }, [router]);

  const handleAuthRedirect = () => {
    router.push('/auth');
  };
  return (
    <div className="bg-white">
      <div className=" p-4">
        <div className='flex items-center justify-between'>
          <div className='flex'>
            <Image src="/logo.jpeg" alt="MoodMate Logo" width={30} height={20} className='h-auto w-auto' />
            <h1 className="text-2xl font-bold">MoodMate</h1>
          </div>
          <button 
            className="rounded-3xl border-2 border-[#4F3422] font-extrabold px-6 py-2 mr-2 cursor-pointer"
            onClick={handleAuthRedirect}
          >
            Log In
          </button>
        </div>
        <div className='flex items-center  py-12'>
          <h1 className='text-7xl font-extrabold px-8'>Your Perfect AI Companion for All Your Moods</h1>
          <Image src="/bg1.jpeg" alt="MoodMate Logo" width={800} height={300} />
        </div>
        <div className='flex items-center justify-center mt-8'>
          <button 
            className='bg-[#4F3422] text-white px-8 py-4 rounded-4xl font-extrabold text-2xl cursor-pointer'
            onClick={handleAuthRedirect}
          >
            Try Now
          </button>
        </div>
        <h2 className='text-2xl font-bold text-center mt-16 mb-8'>Features we excel in..</h2>
        <div className='flex items-center justify-around'>
          <Image src="/m1.jpeg" alt="MoodMate Logo" width={300} height={200} />
          <Image src="/m2.jpeg" alt="MoodMate Logo" width={300} height={200} />
          <Image src="/m3.jpeg" alt="MoodMate Logo" width={300} height={200} />
        </div>
        <div className='flex flex-col items-center justify-center mt-16 mb-8 gap-4'>
          <h1 className='text-5xl font-bold'>Finding things Good?</h1>
          <h1 className='text-5xl font-bold'>Is it worth giving a try!</h1>
        </div>

      </div>
      <div className='flex items-center justify-center my-8 mb-24'>
        <button 
          className='bg-[#4F3422] text-white px-12 py-4 rounded-4xl font-extrabold text-3xl cursor-pointer'
          onClick={handleAuthRedirect}
        >
          Try Now
        </button>
      </div>
    </div>
  );
}