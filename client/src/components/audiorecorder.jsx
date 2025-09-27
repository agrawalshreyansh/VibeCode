"use client";

import React, { useState } from "react";

export default function SpeechToTextRecorder() {
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
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);

    fetch("http://localhost:8000/process-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: transcript }),
    });

  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>🎙 Speech to Text</h2>
      {!recording ? (
        <button onClick={startRecording}>Start Talking</button>
      ) : (
        <button onClick={stopRecording}>Stop</button>
      )}
      <div style={{ marginTop: "20px" }}>
        <p>📝 {transcript}</p>
      </div>
    </div>
  );
}
