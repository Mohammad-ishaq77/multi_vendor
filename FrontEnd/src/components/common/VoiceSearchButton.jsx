import { Globe, Mic, MicOff } from "lucide-react";
import { useState } from "react";

const VoiceSearchButton = ({
  isSpeechSupported,
  isListening,
  startVoiceSearch,
  selectedLang,
  setSelectedLang,
  SPEECH_LANGUAGES,
  showToast,
  className = "",
  hero = false,
  mobile = false,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <div className={`flex items-center gap-1 relative ${className}`}>
      <button
        type="button"
        onClick={startVoiceSearch}
        title={
          isSpeechSupported
            ? isListening
              ? "Listening... Click to stop"
              : `Voice Search (${SPEECH_LANGUAGES.find((l) => l.code === selectedLang)?.label})`
            : "Voice search not supported in this browser"
        }
        aria-label="Voice search"
        className={`relative flex items-center justify-center rounded-full p-1.5 transition-all ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-md"
            : isSpeechSupported
              ? "text-(--color-primary) hover:bg-(--color-green-bg) hover:text-(--color-primary-dark)"
              : "text-gray-300 cursor-not-allowed"
        }`}
      >
        {isSpeechSupported ? (
          <Mic className={`h-4 w-4 ${isListening ? "scale-110" : ""}`} />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </button>

      {isSpeechSupported && (
        <button
          type="button"
          onClick={() => setShowLangMenu((prev) => !prev)}
          title="Select Voice Language"
          aria-label="Select voice language"
          className="rounded-full p-1 text-(--color-text-muted) hover:bg-(--color-green-bg) hover:text-(--color-primary)"
        >
          <Globe className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Language selector dropdown */}
      {showLangMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-(--color-green-soft) bg-white p-1.5 shadow-xl text-xs">
          <div className="px-2 py-1 font-bold text-[10px] text-(--color-text-muted) uppercase tracking-wider">
            Speech Language
          </div>
          {SPEECH_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setSelectedLang(lang.code);
                setShowLangMenu(false);
                showToast(`Speech language set to ${lang.label}`);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-(--color-green-bg) ${
                selectedLang === lang.code ? "font-bold text-(--color-primary)" : "text-(--color-text)"
              }`}
            >
              <span>{lang.label}</span>
              {selectedLang === lang.code && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const VoiceSearchToast = ({ speechToast, isListening }) => {
  if (!speechToast) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex justify-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-(--color-green-soft) bg-emerald-950/90 px-3.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${isListening ? "bg-red-400 animate-ping" : "bg-emerald-400"}`} />
        {speechToast}
      </span>
    </div>
  );
};

export default VoiceSearchButton;
