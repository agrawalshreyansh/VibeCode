"use client"

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const HealthAssessmentForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: '',
    relationshipStatus: '',
    yearInSchool: '',
    medicalProblem: '',
    psychiatricMedication: '',
    intoxicants: '',
    physicalHealth: '',
    avgSleep: '',
    sleepTime: '',
    eatingPattern: '',
    socialConnection: '',
    stressPeople: '',
    discrimination: '',
    counsellingGoals: '',
    distressCommunication: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Required fields validation
    if (!formData.name || !formData.age || !formData.gender) {
      newErrors.required = 'Please fill in all required fields';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      try {
        // Store auth data in localStorage
        localStorage.setItem('userAuth', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));

        // Store form data (excluding sensitive info)
        const formDataToStore = { ...formData };
        delete formDataToStore.password;
        delete formDataToStore.confirmPassword;
        localStorage.setItem('healthAssessment', JSON.stringify(formDataToStore));

        // Navigate to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error saving data:', error);
        setErrors(prev => ({ 
          ...prev, 
          submit: 'There was an error saving your data. Please try again.' 
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* Main Heading */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Please Enter Your Details
          </h1>

          {/* Email Address */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Email Address</h2>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
            {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Password</h2>
            <input 
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
            {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Confirm Password</h2>
            <input 
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
            {errors.confirmPassword && <p className="text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Name */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Your Name</h2>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Age */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Your Age</h2>
            <input 
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Gender */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Gender</h2>
            <div className="flex justify-center space-x-10">
              {['Male', 'Female', 'Other'].map((g) => (
                <label key={g} className="flex items-center space-x-2 cursor-pointer text-lg">
                  <input 
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={() => handleInputChange("gender", g)}
                    className="w-5 h-5"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relationship Status */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Relationship Status</h2>
            <input 
              type="text"
              value={formData.relationshipStatus}
              onChange={(e) => handleInputChange("relationshipStatus", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Year in School */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Year in School</h2>
            <input 
              type="text"
              value={formData.yearInSchool}
              onChange={(e) => handleInputChange("yearInSchool", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Medical Problem */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Facing any medical problem?</h2>
            <textarea
              rows={3}
              value={formData.medicalProblem}
              onChange={(e) => handleInputChange("medicalProblem", e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
          </div>

          {/* Psychiatric Medication */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Currently taking psychiatric medication?</h2>
            <div className="flex justify-center space-x-10">
              {['Yes', 'No'].map((opt) => (
                <label key={opt} className="flex items-center space-x-2 cursor-pointer text-lg">
                  <input 
                    type="radio"
                    name="psychiatricMedication"
                    value={opt}
                    checked={formData.psychiatricMedication === opt}
                    onChange={() => handleInputChange("psychiatricMedication", opt)}
                    className="w-5 h-5"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intoxicants */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Do you consume intoxicants?</h2>
            <input 
              type="text"
              value={formData.intoxicants}
              onChange={(e) => handleInputChange("intoxicants", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Physical Health */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Rate your Physical Health (1-10)</h2>
            <input 
              type="number"
              max={10}
              value={formData.physicalHealth}
              onChange={(e) => handleInputChange("physicalHealth", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Average Sleep */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Average Hours of Sleep</h2>
            <input 
              type="number"
              value={formData.avgSleep}
              onChange={(e) => handleInputChange("avgSleep", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Sleep Time */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">When do you usually sleep?</h2>
            <input 
              type="text"
              value={formData.sleepTime}
              onChange={(e) => handleInputChange("sleepTime", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
              placeholder="e.g. 11:00 PM"
            />
          </div>

          {/* Eating Patterns */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Eating Patterns</h2>
            <div className="space-y-3">
              {[
                "Regular, Healthy Meals",
                "Irregular but adequate",
                "Often skip meals",
                "Concerning patterns"
              ].map((pattern) => (
                <label key={pattern} className="flex items-center space-x-2 text-lg">
                  <input 
                    type="radio"
                    name="eatingPattern"
                    value={pattern}
                    checked={formData.eatingPattern === pattern}
                    onChange={() => handleInputChange("eatingPattern", pattern)}
                    className="w-5 h-5"
                  />
                  <span>{pattern}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Social Connection */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Satisfaction with Social Connection</h2>
            <input 
              type="text"
              value={formData.socialConnection}
              onChange={(e) => handleInputChange("socialConnection", e.target.value)}
              className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg text-center"
            />
          </div>

          {/* Stressful People */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">People who add stress/negativity?</h2>
            <textarea
              rows={3}
              value={formData.stressPeople}
              onChange={(e) => handleInputChange("stressPeople", e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
          </div>

          {/* Discrimination */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Do you experience discrimination or bias?</h2>
            <textarea
              rows={3}
              value={formData.discrimination}
              onChange={(e) => handleInputChange("discrimination", e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
          </div>

          {/* Counselling Goals */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Main Goals for Counselling</h2>
            <textarea
              rows={3}
              value={formData.counsellingGoals}
              onChange={(e) => handleInputChange("counsellingGoals", e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 text-lg"
            />
          </div>


          {/* Continue Button */}
          <div className="pt-6">
            <button 
              onClick={handleContinue}
              className="w-full bg-amber-800 text-white py-5 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-amber-900 transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
            {(errors.required || errors.submit) && (
              <p className="text-red-500 mt-2 text-center">
                {errors.required || errors.submit}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HealthAssessmentForm;
