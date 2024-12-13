import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition();

  // Normalize email input to remove spaces during transcription
  const normalizeEmail = (text: string) => text.replace(/\s+/g, "");

  // Update the form field with the transcript
  useEffect(() => {
    if (currentField && transcript.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        [currentField]:
          currentField === "email" ? normalizeEmail(transcript) : transcript,
      }));
    }
  }, [transcript, currentField]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startRecording = (field: string) => {
    resetTranscript(); // Clear the previous transcript
    setCurrentField(field); // Set the current field to update
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopRecording = () => {
    SpeechRecognition.stopListening();
    setFormData((prev) => ({
      ...prev,
      [currentField!]: "", // Clear the text for the current field
    }));
    setCurrentField(null); // Reset the current field
    resetTranscript();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted: ", formData);
    stopRecording();
    // Add backend logic here (e.g., send formData to server)
  };

  const handleFieldFocus = (field: string) => {
    if (!listening || currentField !== field) {
      startRecording(field);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("form")) {
      stopRecording();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setShowPopup(true);
    }
  }, [browserSupportsSpeechRecognition]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">
              Microphone Access Required
            </h2>
            <p className="mb-4">
              Your browser does not support speech recognition, or microphone
              access is disabled. Please enable it to use this feature.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form
        className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Speech-to-Text Form
        </h1>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Name:</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus("name")}
              placeholder="Enter your name"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {listening && currentField === "name" && (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 rounded-md text-white bg-red-500 hover:opacity-90"
              >
                <FaStop />
              </button>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email:</label>
          <div className="flex items-center space-x-2">
            <input
              type="email"
              name="email"
              value={formData.email.toLowerCase()}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus("email")}
              placeholder="Enter your email"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {listening && currentField === "email" && (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 rounded-md text-white bg-red-500 hover:opacity-90"
              >
                <FaStop />
              </button>
            )}
          </div>
        </div>

        {/* Message Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Message:
          </label>
          <div className="flex items-center space-x-2">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus("message")}
              placeholder="Enter your message"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
            {listening && currentField === "message" && (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 rounded-md text-white bg-red-500 hover:opacity-90"
              >
                <FaStop />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default App;
