"use client";

import React, { useState } from "react";
import { Mic, MicOff } from 'lucide-react';

export default function SpeechToTextRecorder({ onTranscriptComplete, onTranscriptChange }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = React.useRef(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      // Update parent component with current transcript
      onTranscriptChange?.(text, true);
    };

    recognition.onend = () => {
      if (transcript.trim()) {
        onTranscriptChange?.(transcript.trim(), false);
      }
      setRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    // Don't clear transcript here
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        recording 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'border border-gray-300 hover:border-gray-400'
      }`}
      title={recording ? "Stop recording" : "Start recording"}
    >
      {recording ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
}
