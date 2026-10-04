import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const RotatingHeroTitle = ({
  titleLine = ["Your local", "marketplace,"],
  rotating = ["Delivered", "Nearby", "Fresh", "In minutes"],
  dark = false,
  centered = false,
  currentIndex: externalIndex,
  onIndexChange,
  intervalMs = 4000,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const isControlled = typeof externalIndex === "number";
  const wordIndex = isControlled ? externalIndex : internalIndex;
  const currentWord = `${(rotating[wordIndex] || rotating[0]).replace(/\.$/, "")}.`;

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      const next = (wordIndex + 1) % rotating.length;
      if (isControlled && onIndexChange) {
        onIndexChange(next);
      } else {
        setInternalIndex(next);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [paused, wordIndex, rotating.length, isControlled, onIndexChange, intervalMs]);

  const cycleWord = () => {
    const next = (wordIndex + 1) % rotating.length;
    if (isControlled && onIndexChange) {
      onIndexChange(next);
    } else {
      setInternalIndex(next);
    }
  };

  return (
    <>
      <h1
        className={`${centered ? "text-center lg:whitespace-nowrap" : ""} mt-[max(0.45rem,1vh)] font-display text-[clamp(1.85rem,7vw,2.35rem)] font-bold leading-[1.12] tracking-tight sm:text-[clamp(2.1rem,4.5vw,2.6rem)] lg:mt-2 lg:text-[2.75rem] lg:font-bold lg:leading-[1.1] ${
          dark ? "text-white" : "text-(--color-text)"
        }`}
      >
        {(Array.isArray(titleLine) ? titleLine : [titleLine]).map((line) => (
          <span key={line} className={centered ? "inline" : "block"}>
            {centered && line !== titleLine[0] ? " " : ""}
            {line}
          </span>
        ))}
        <span className={`relative mt-0 inline-grid ${centered ? "justify-items-center" : "justify-items-start"}`}>
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 text-[1.16em] font-extrabold tracking-tight sm:text-[1.2em] lg:text-[1.24em]"
          >
            {`${[...rotating].sort((a, b) => b.length - a.length)[0].replace(/\.$/, "")}.`}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={`col-start-1 row-start-1 flex flex-col ${centered ? "items-center justify-self-center" : "items-start justify-self-start"}`}
            >
              <button
                type="button"
                onClick={cycleWord}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                whileHover={{ opacity: 0.86 }}
                whileTap={{ opacity: 0.75 }}
                aria-label={`${currentWord} Click to see the next title`}
                className={`hero-rotating-word w-max text-[1.16em] sm:text-[1.2em] lg:text-[1.24em] ${
                  dark ? "text-white" : "text-white"
                }`}
              >
                {currentWord}
              </button>

              {/* Stylish Dynamic Vector Wavy/Curly Underline Accent */}
              <motion.svg
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full h-2.5 mt-0.5 text-white"
                viewBox="0 0 100 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 C 20 12, 40 0, 60 6 C 80 12, 90 2, 100 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            </motion.div>
          </AnimatePresence>
        </span>
      </h1>
    </>
  );
};

export default RotatingHeroTitle;
