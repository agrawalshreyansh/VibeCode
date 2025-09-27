"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, Edit3 } from "lucide-react";
import Navbar from "@/components/navbar";
export default function UserProfile() {
  const [profileData, setProfileData] = useState({
    name: "",
    gender: "",
    age: "",
    avgSleep: "",
    psychiatricMedication: "",
    sleepTime: "",
    eatingPattern: "",
    socialConnection: "",
    stressPeople: "",
  });

  useEffect(() => {
    // Fetch data from localStorage
    const storedData = localStorage.getItem("credentials");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Pick only the fields we need
      setProfileData({
        name: parsedData.name || "",
        gender: parsedData.gender || "",
        age: parsedData.age ? parsedData.age + "y" : "",
        avgSleep: parsedData.avgSleep ? parsedData.avgSleep + "h" : "",
        psychiatricMedication: parsedData.psychiatricMedication || "No",
        sleepTime: parsedData.sleepTime || "",
        eatingPattern: parsedData.eatingPattern || "",
        socialConnection: parsedData.socialConnection || "",
        stressPeople: parsedData.stressPeople || "",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden p-10">
      <Navbar/>
      {/* Header */}
      <button className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow mb-10">
        <ChevronLeft className="w-7 h-7 text-gray-600" />
      </button>

      {/* Profile card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
        {/* Profile header */}
        <div className="flex items-center mb-10">
          <div className="w-32 h-32 rounded-full overflow-hidden mr-10 shadow-lg bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
            👤
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <h1 className="text-4xl font-bold text-gray-800 mr-5">
                {profileData.name}
              </h1>
              <span className="px-4 py-2 bg-gray-100 rounded-full text-lg text-gray-700 border border-gray-200">
                {profileData.gender}
              </span>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="flex justify-between mb-10 bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center flex-1">
            <div className="text-base text-gray-500 mb-1">Age</div>
            <div className="text-2xl font-semibold text-gray-800">{profileData.age}</div>
          </div>
          <div className="text-center flex-1 border-l border-r border-gray-200">
            <div className="text-base text-gray-500 mb-1">Avg Sleep</div>
            <div className="text-2xl font-semibold text-gray-800">{profileData.avgSleep}</div>
          </div>
          <div className="text-center flex-1 flex items-center justify-center">
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Edit3 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="space-y-6 text-xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Psychiatric Medication</span>
            <span className="text-gray-900 font-semibold">{profileData.psychiatricMedication}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Sleep Time</span>
            <span className="text-gray-900 font-semibold">{profileData.sleepTime}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Eating Pattern</span>
            <span className="text-gray-900 font-semibold">{profileData.eatingPattern}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Social Connection</span>
            <span className="text-gray-900 font-semibold">{profileData.socialConnection}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Stress from People</span>
            <span className="text-gray-900 font-semibold">{profileData.stressPeople}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
