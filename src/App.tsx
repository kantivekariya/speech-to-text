import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<string>(""); // To display API response
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const GROQ_API_KEY =
    "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"; // Replace with your Groq API Key
  let speechTimeout: ReturnType<typeof setTimeout>;

  // Function to call the Groq API
  const callGroqAPI = async (userInput: string) => {
    if (!userInput) return;

    const requestPayload = {
      text: userInput,
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://python-api-hazel-nu.vercel.app/extract_company_region",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      setApiResponse("Failed to fetch response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the start/stop of voice input
  const handleVoiceButtonClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  // Start a timeout to call the API if no speech is detected for 2 seconds
  useEffect(() => {
    if (!listening && transcript) {
      clearTimeout(speechTimeout);

      speechTimeout = setTimeout(() => {
        callGroqAPI(transcript);
      }, 2000);
    }

    return () => clearTimeout(speechTimeout);
  }, [listening, transcript]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Speech-to-Text with Groq API Integration
      </h1>

      {/* Voice Button */}
      <button
        onClick={handleVoiceButtonClick}
        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
        aria-label="Voice Input"
      >
        {listening ? "🛑 Stop" : "🎤 Voice"}
      </button>

      {/* Loading Indicator */}
      {isLoading && <p className="mt-4 text-gray-600">Processing...</p>}

      {/* Display Transcript */}
      <div className="mt-4 p-3 bg-gray-200 rounded-lg shadow">
        <strong>Transcript:</strong>
        <p>{transcript || "Press the voice button and start speaking."}</p>
      </div>

      {/* Display Groq API Response */}
      {apiResponse && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg shadow">
          <strong>API Response:</strong>
          <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
