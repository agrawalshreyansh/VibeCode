'use client';
import Navbar from '@/components/navbar';
import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, User, BarChart3, Users, Calendar, Award, ChevronRight } from 'lucide-react';

const MoodMateDashboard = () => {
  const [activeTab, setActiveTab] = useState('1 Week');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { day: 'Mon', value: 95, peak: true },
    { day: 'Tue', value: 50, valley: true },
    { day: 'Wed', value: 90, peak: true },
    { day: 'Thu', value: 45, valley: true },
    { day: 'Fri', value: 98 },
    { day: 'Sat', value: 75 },
    { day: 'Sun', value: 55 }
  ];

  const streakDays = [
    [true, true, true, true, false, false],
    [true, true, true, true, true, false],
    [true, true, true, true, true, true],
    [true, true, false, false, false, false]
  ];

  const WaveAnimation = () => (
    <span className="inline-block animate-[wave_2s_ease-in-out_infinite] origin-[70%_70%]">
      👋
    </span>
  );

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#4ade80" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    );
  };

  const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage * 2.51} 251`;
            const strokeDashoffset = -cumulativePercentage * 2.51;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx="64"
                cy="64"
                r="40"
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ animationDelay: `${index * 200}ms` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">8.2x</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Sidebar */}
        <Navbar />
      <div>
        {/* Bottom */}
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-300">
            <div className="w-6 h-6 bg-white/80 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-20 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-amber-900">Hello, XYZ!</h1>
            <WaveAnimation />
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search MoodMate..."
                className="pl-12 pr-6 py-3 w-80 bg-white rounded-full border-0 shadow-lg focus:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* Main Chart */}
          <div className="col-span-7 bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-5xl font-bold text-amber-900 mb-2">97.245%</div>
                <div className="text-gray-500">Overall Wellness Score</div>
              </div>
            </div>

            {/* Chart SVG */}
            <div className="relative h-64 mb-6">
              <svg className="w-full h-full" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#92400e" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d={`M 50,${200 - chartData[0].value * 1.5} 
                      L 150,${200 - chartData[1].value * 1.5}
                      L 250,${200 - chartData[2].value * 1.5}
                      L 350,${200 - chartData[3].value * 1.5}
                      L 450,${200 - chartData[4].value * 1.5}
                      L 550,${200 - chartData[5].value * 1.5}
                      L 600,${200 - chartData[6].value * 1.5}`}
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="drop-shadow-sm"
                />
                {chartData.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={50 + index * 100}
                      cy={200 - point.value * 1.5}
                      r="8"
                      fill="#92400e"
                      className="drop-shadow-sm hover:r-10 transition-all duration-300"
                    />
                    {point.peak && (
                      <text
                        x={50 + index * 100}
                        y={200 - point.value * 1.5 - 15}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-amber-800"
                      >
                        {point.value}%
                      </text>
                    )}
                    {point.valley && (
                      <text
                        x={50 + index * 100}
                        y={200 - point.value * 1.5 - 15}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-amber-800"
                      >
                        {point.value}%
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Time Tabs */}
            <div className="flex gap-2 bg-gray-100 p-2 rounded-full">
              {['1 Day', '1 Week', '1 Month', '1 Year', 'All Time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-amber-800 text-white shadow-lg'
                      : 'text-gray-600 hover:text-amber-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Emotional Score */}
          <div className="col-span-2 bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-700 font-medium">Emotional Score</div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex justify-center">
              <CircularProgress percentage={85} size={100} color="#92400e" />
            </div>
          </div>

          {/* Stress Level */}
          <div className="col-span-3 bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold text-amber-900 mb-1">8.2x</div>
                <div className="text-gray-500 text-sm">Stress Level</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex justify-center">
              <DonutChart 
                data={[
                  { value: 45, color: '#6b7280', label: 'Core' },
                  { value: 30, color: '#84cc16', label: 'Sleep' },
                  { value: 25, color: '#fb923c', label: 'Mental' }
                ]}
              />
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Core</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-600">Mental</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-3 gap-8">
          {/* Sleep Level */}
          <div className="bg-gradient-to-br from-lime-400 to-green-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/90 font-medium">Sleep Level</div>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-end gap-1 mb-4">
                {[0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3].map((height, index) => (
                  <div
                    key={index}
                    className="bg-white/30 rounded-full animate-pulse"
                    style={{ 
                      height: `${height * 60}px`, 
                      width: '12px',
                      animationDelay: `${index * 0.2}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">8.2h</div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/90 font-medium">Streak</div>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-6 gap-2">
                {streakDays.map((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-6 h-6 rounded-full ${
                        day ? 'bg-white/80' : 'bg-white/20'
                      } transition-all duration-300`}
                      style={{ animationDelay: `${(weekIndex * 6 + dayIndex) * 100}ms` }}
                    ></div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">16d</div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Daily Quiz */}
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-white/10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="text-2xl font-bold mb-2">Take the</div>
                <div className="text-2xl font-bold">Daily Quiz</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="w-16 h-20 bg-white/20 rounded-xl flex items-center justify-center">
                  <div className="text-2xl">🧘‍♂️</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodMateDashboard;