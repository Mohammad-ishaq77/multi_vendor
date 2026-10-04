import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, LayoutGrid, Mic, MicOff, Package, Search, Store, X } from "lucide-react";
import { getVendorMarketplacePath, searchCatalog } from "../../utils/marketplace";

const SPEECH_LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "हिंदी (Hindi)" },
  { code: "ur-PK", label: "اردو (Urdu)" },
  { code: "en-US", label: "English (US)" },
];

const MarketplaceSearch = ({
  variant = "nav",
  placeholder = "Search products, shops and categories",
  autoFocus = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const recognitionRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [speechToast, setSpeechToast] = useState(null);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSpeechSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    if (location.pathname === "/marketplace") {
      setQuery(new URLSearchParams(location.search).get("q") || "");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
        setShowLangMenu(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

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
        setQuery(transcript);
        setOpen(true);

        if (event.results[0].isFinal) {
          setIsListening(false);
          if (transcript.trim()) {
            goToSearch(transcript);
          }
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

  const results = useMemo(() => {
    const term = query.trim();
    if (term.length < 1) return { products: [], vendors: [], categories: [] };
    const matched = searchCatalog(term);
    return {
      products: matched.products.slice(0, 5),
      vendors: matched.vendors.slice(0, 3),
      categories: matched.categories.slice(0, 3),
    };
  }, [query]);

  const hasResults = results.products.length + results.vendors.length + results.categories.length > 0;
  const showPanel = open && query.trim().length > 0;

  const goToSearch = (term = query) => {
    const next = term.trim();
    setOpen(false);
    navigate(next ? `/marketplace?q=${encodeURIComponent(next)}` : "/marketplace");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToSearch();
  };

  const hero = variant === "hero";
  const mobile = variant === "mobile";

  return (
    <div ref={wrapRef} className={`relative ${hero || mobile ? "w-full" : "min-w-0 flex-1"}`}>
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--color-text-muted) ${
            hero ? "left-3 h-3.5 w-3.5 lg:left-4 lg:h-4 lg:w-4" : mobile ? "left-4 h-4 w-4" : "left-3.5 h-4 w-4"
          }`}
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={isListening ? "Listening..." : placeholder}
          aria-label="Search marketplace"
          className={
            hero
              ? `h-9 w-full rounded-xl border ${isListening ? "border-red-500 ring-2 ring-red-400/30" : "border-white/70"} bg-white pl-9 pr-[7.6rem] text-xs text-(--color-text) outline-none placeholder:text-(--color-text-muted) focus:border-white lg:h-12 lg:rounded-2xl lg:pl-11 lg:pr-[9.2rem] lg:text-sm`
              : mobile
                ? `h-11 w-full rounded-xl border ${isListening ? "border-red-500 ring-2 ring-red-400/30" : "border-(--color-green-soft)"} bg-(--color-surface) pl-11 pr-[8rem] text-sm outline-none`
                : `h-10 w-full rounded-full border ${isListening ? "border-red-500 ring-2 ring-red-400/30" : "border-(--color-green-soft)"} bg-(--color-surface) pl-10 pr-[8.4rem] text-sm text-(--color-text) outline-none focus:border-(--color-green) focus:bg-white focus:ring-4 focus:ring-(--color-green-light)/15`
          }
        />

        {/* Action icons & Voice controls inside input */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
            hero ? "right-[3.85rem] lg:right-[4.6rem]" : mobile ? "right-[4.6rem]" : "right-[5.15rem]"
          }`}
        >
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              aria-label="Clear search"
              className="rounded-full p-1 text-(--color-text-muted) hover:bg-(--color-green-bg) hover:text-(--color-text)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="relative">
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
          </div>

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
        </div>

        {/* Language selector dropdown */}
        {showLangMenu && (
          <div className="absolute right-12 top-full z-50 mt-1 w-44 rounded-xl border border-(--color-green-soft) bg-white p-1.5 shadow-xl text-xs">
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

        <button
          type="submit"
          className={
            hero
              ? "btn-on-green absolute right-1 top-1/2 !min-h-7 -translate-y-1/2 !rounded-lg !px-2.5 !text-[11px] lg:right-1.5 lg:!min-h-9 lg:!rounded-xl lg:!px-3.5 lg:!text-sm"
              : "absolute right-1 top-1/2 inline-flex h-7 -translate-y-1/2 items-center rounded-lg bg-(--color-primary) px-3 text-xs font-semibold text-white hover:bg-(--color-primary-dark)"
          }
        >
          Search
        </button>
      </form>

      {/* Voice Status Toast */}
      {speechToast && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-(--color-green-soft) bg-emerald-950/90 px-3.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
            <span className={`h-2 w-2 rounded-full ${isListening ? "bg-red-400 animate-ping" : "bg-emerald-400"}`} />
            {speechToast}
          </span>
        </div>
      )}

      {showPanel && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-2xl border border-(--color-green-soft) bg-white shadow-[0_18px_40px_-20px_rgba(6,78,59,0.35)] ${
            hero ? "left-0 right-0" : "inset-x-0"
          }`}
        >
          {hasResults ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.categories.length > 0 && (
                <SuggestionGroup title="Categories">
                  {results.categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/marketplace/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-(--color-green-bg)"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--color-green-bg) text-(--color-primary)">
                        <LayoutGrid className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-semibold text-(--color-text)">{category.name}</span>
                        <span className="block text-[11px] text-(--color-text-muted)">{category.description}</span>
                      </span>
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {results.vendors.length > 0 && (
                <SuggestionGroup title="Shops">
                  {results.vendors.map((shop) => (
                    <Link
                      key={shop.id}
                      to={getVendorMarketplacePath(shop)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-(--color-green-bg)"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--color-green-bg) text-(--color-primary)">
                        <Store className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-semibold text-(--color-text)">{shop.name}</span>
                        <span className="block text-[11px] text-(--color-text-muted)">
                          {shop.category} · {shop.location}
                        </span>
                      </span>
                    </Link>
                  ))}
                </SuggestionGroup>
              )}
              {results.products.length > 0 && (
                <SuggestionGroup title="Products">
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => goToSearch(product.name)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-(--color-green-bg)"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--color-green-bg) text-(--color-primary)">
                        <Package className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-(--color-text)">{product.name}</span>
                        <span className="block text-[11px] text-(--color-text-muted)">
                          {product.shop} · ₹{product.price}
                        </span>
                      </span>
                    </button>
                  ))}
                </SuggestionGroup>
              )}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-(--color-text-muted)">
              No matches for “{query.trim()}”
            </p>
          )}
          <button
            type="button"
            onClick={() => goToSearch()}
            className="flex w-full items-center justify-center gap-2 border-t border-(--color-green-soft) bg-(--color-surface) px-3 py-2.5 text-xs font-semibold text-(--color-primary-dark) hover:bg-(--color-green-bg)"
          >
            <Search className="h-3.5 w-3.5" />
            Search all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );
};

const SuggestionGroup = ({ title, children }) => (
  <div className="px-1 py-1">
    <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-text-muted)">
      {title}
    </p>
    {children}
  </div>
);

export default MarketplaceSearch;
