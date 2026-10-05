import { useState, useRef, useEffect } from "react";

const SPEECH_LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "हिंदी (Hindi)" },
  { code: "ur-PK", label: "اردو (Urdu)" },
  { code: "en-US", label: "English (US)" },
];

export const useVoiceSearch = (onSearch) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [speechToast, setSpeechToast] = useState(null);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSpeechSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const showToast = (message, duration = 3000) => {
    setSpeechToast(message);
    setTimeout(() => {
      setSpeechToast((prev) => (prev === message ? null : prev));
    }, duration);
  };

  const startVoiceSearch = () => {
    if (!isSpeechSupported) {
      showToast("Voice search is not supported in your browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        const currentLangLabel = SPEECH_LANGUAGES.find((l) => l.code === selectedLang)?.label || selectedLang;
        showToast(`Listening... Speak in ${currentLangLabel}`);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        
        onSearch(transcript, event.results[0].isFinal);

        if (event.results[0].isFinal) {
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "no-speech") {
          showToast("No speech detected. Please try again.");
        } else if (event.error === "not-allowed") {
          showToast("Microphone access denied. Please allow access.");
        } else {
          showToast(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      showToast("Could not start voice recognition.");
    }
  };

  return {
    isListening,
    isSpeechSupported,
    selectedLang,
    setSelectedLang,
    speechToast,
    startVoiceSearch,
    showToast,
    SPEECH_LANGUAGES,
  };
};
