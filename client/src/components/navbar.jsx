"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
// Using standard lucide icons that are closest matches to the image
import { LayoutDashboard, Users, User, ArrowLeft, Settings, LogOut } from 'lucide-react'; 

// Define navigation items with their icons and routes.
const navItems = [
  { id: 'stats', icon: LayoutDashboard, route: '/dashboard' }, 
  { id: 'users', icon: Users, route: '/chat', notificationCount: 8 }, 
  { id: 'profile', icon: User, route: '/profile' }, 
];

// Helper component for the Custom Logo at the top (The four droplet shape)
const CustomLogo = () => (
  <div className="w-10 h-10 flex items-center justify-center cursor-pointer">
    {/* This attempts to mimic the four-petal/droplet shape in the image */}
    <div className="w-8 h-8 relative transform rotate-45">
      <div className="absolute w-4 h-4 rounded-full bg-white opacity-90 -top-1 -left-1 transform rotate-45"></div>
      <div className="absolute w-4 h-4 rounded-full bg-white opacity-90 -top-1 -right-1 transform -rotate-45"></div>
      <div className="absolute w-4 h-4 rounded-full bg-white opacity-90 -bottom-1 -left-1 transform -rotate-45"></div>
      <div className="absolute w-4 h-4 rounded-full bg-white opacity-90 -bottom-1 -right-1 transform rotate-45"></div>
    </div>
  </div>
);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); 

  console.log('Current pathname:', pathname)
  
  // Custom dark brown/black color from the image
  const sidebarBg = 'bg-stone-900'; 
  // Custom accent color for active item and notification
  const accentColor = 'bg-white'; 
  // Color for unhighlighted icons/text
  const unhighlightedColor = 'text-stone-500';

  // Function to render a navigation item
  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;

    let itemClasses = 'w-16 h-16 flex items-center justify-center cursor-pointer relative transition-all duration-200';
    let iconClasses = `w-6 h-6 ${unhighlightedColor} transition-all duration-200`;
    let wrapperClasses = ''; 

    if (isActive) {
      wrapperClasses = `w-12 h-12 rounded-full bg-amber-800 flex items-center justify-center`;
      iconClasses = 'w-6 h-6 text-white';
    } else {
      wrapperClasses = `w-12 h-12 flex items-center justify-center`;
    }

    return (
      <div
        className={itemClasses}
        onClick={() => {
          router.push(item.route);
        }}
      >
        <div className={wrapperClasses}>
          <Icon className={iconClasses} />
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Redirect to login/auth page
    router.push('/auth');
  };

  return (
    // 1. Added rounded-3xl to the main div for rounded corners
    // 2. Added justify-between to space the elements (logo, navigation, bottom button)
    // 3. Changed py-6 to px-2 and pb-4 to give it space inside the rounded edges
    <div className={`fixed left-0 top-0 h-full w-24 ${sidebarBg} flex flex-col items-center justify-between px-2 py-4 rounded-full shadow-2xl z-10 ml-2 m-1 md-2`}>
      
      {/* Top Logo - The four droplet shape */}
      <div onClick={() => router.push('/')} className="mb-4">
        <CustomLogo />
      </div>

      {/* Navigation Items (The core list) 
          Using mx-auto and a div wrapper to center the list horizontally and let 
          'justify-between' handle vertical spacing around it.
      */}
      <div className="flex flex-col gap-4">
        {navItems.map((item) => (
          <NavItem key={item.id} item={item} isActive={item.route === pathname} />
        ))}
      </div>

      {/* Bottom Back/Return Button 
          Removed mt-auto as justify-between handles spacing
      */}

      {/* Logout and Settings Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}