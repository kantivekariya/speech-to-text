import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [currentField, setCurrentField] = useState<string | null>("name");
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

  // Automatically move to the next field after 2 seconds if current field has text
  useEffect(() => {
    if (currentField && transcript.trim() !== "") {
      const timeout = setTimeout(() => {
        moveToNextField();
      }, 2000);
      return () => clearTimeout(timeout);
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
    setCurrentField(null); // Reset the current field
    resetTranscript();
  };

  const moveToNextField = () => {
    const fields = ["name", "email", "message"];
    const currentIndex = fields.indexOf(currentField!);
    if (currentIndex >= 0 && currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      setTimeout(() => {
        document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name=${nextField}]`)?.focus();
      }, 100);
      startRecording(nextField);
    } else {
      stopRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted: ", formData);
    stopRecording();
    // Add backend logic here (e.g., send formData to server)
  };

  const handleStartAgain = () => {
    stopRecording();
    setFormData({ name: "", email: "", message: "" });
    startRecording("name");
    setTimeout(() => {
      document.querySelector<HTMLInputElement>("[name=name]")?.focus();
    }, 100);
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

  // Start recording automatically when the form loads
  useEffect(() => {
    if (currentField) {
      startRecording(currentField);
    }
    setTimeout(() => {
      document.querySelector<HTMLInputElement>("[name=name]")?.focus();
    }, 100);
  }, []);

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
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onFocus={() => startRecording("name")}
            placeholder="Enter your name"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email.toLowerCase()}
            onChange={handleInputChange}
            onFocus={() => startRecording("email")}
            placeholder="Enter your email"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Message:
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onFocus={() => startRecording("message")}
            placeholder="Enter your message"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleStartAgain}
            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
          >
            Start Again
          </button>
        </div>
      </form>
    </div>
  );
};

export default App;
