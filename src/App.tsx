import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPaperPlane, FaStop } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Hook
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition();

  // Handling Speech-to-Text in real-time
  useEffect(() => {
    if (transcript.trim() !== "") {
      setInputText(transcript); // Show speech in input field

      // Simulate typing effect and timeout to submit after inactivity
      setIsTyping(true);
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendToBackend(transcript);
      }, 2000); // Wait 2 seconds after the user stops speaking before sending
    }
  }, [transcript]);

  // Handle backend communication
  const sendToBackend = async (text: string) => {
    console.log("Sending text to backend:", text);
    // const response = await axios.post("http://localhost:5000/api/transcribe", { text });
    // console.log(response.data);
    setInputText("");
  };

  // Handle manual typing
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    setIsTyping(true);
    clearTimeout(timeoutRef.current!); // Reset the timeout whenever user types
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendToBackend(event.target.value); // Send after timeout
    }, 2000); // Wait 2 seconds after user stops typing
  };

  // Start Speech Recognition
  const startRecording = () => {
    SpeechRecognition.startListening({ continuous: true });
    setRecording(true);
  };

  // Stop Speech Recognition
  const stopRecording = () => {
    SpeechRecognition.stopListening();
    SpeechRecognition.abortListening();
    resetTranscript(); // Clear the transcript
    setRecording(false);
    setInputText(""); // Clear the input field
  };
  

  // Only allow speech if the browser supports it
  if (!browserSupportsSpeechRecognition) {
    return <div>Browser does not support speech recognition</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Speech-to-Text Assistant
        </h1>

        {/* Text Input Area */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={inputText}
            onChange={handleChange}
            placeholder="Type your message or speak..."
            className="w-full p-3 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Send Button for Manual Input */}
          {inputText.trim() !== "" && !isTyping && !listening && !recording && (
            <button
              onClick={() => sendToBackend(inputText)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
            >
              <FaPaperPlane />
            </button>
          )}
        </div>

        {/* Speech-to-Text Control Buttons */}
        <div className="flex justify-center mt-4 space-x-4">
          {!recording ? (
            <button
              onClick={startRecording}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
            >
              <FaMicrophone className="mr-2" /> Start
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center"
            >
              <FaStop className="mr-2" /> Stop
            </button>
          )}

          {/* Explicit Stop Button */}
          {recording && (
            <button
              onClick={stopRecording}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center justify-center"
            >
              <FaStop className="mr-2" /> Stop Speech-to-Text
            </button>
          )}
        </div>

        {/* Typing Indicator */}
        {isTyping && <div className="text-gray-500 mt-4">Typing...</div>}
      </div>
      {JSON.stringify(inputText)}
    </div>
  );
};

export default App;
