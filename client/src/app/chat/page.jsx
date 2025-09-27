// FullScreenLayout.js
import React from 'react';
import Navbar from '@/components/navbar'; // Ensure correct path
import ChatSection from './ChatSection'; // Ensure correct path
import { ChatProvider } from './ChatContext'; // Import the new provider

export default function FullScreenLayout() {
  return (
    // Wrap the entire application in the ChatProvider
    <ChatProvider>
      <div className="relative min-h-screen bg-gray-100 flex p-6 space-x-6">
        
        {/* Sidebar - Fixed position */}
        <div className="w-20">
           <Navbar />
        </div>

        {/* Main Content Area (Conversation List + Chat Window) */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl min-h-[calc(100vh-3rem)]">
          <ChatSection />
        </div>
      </div>
    </ChatProvider>
  );
}