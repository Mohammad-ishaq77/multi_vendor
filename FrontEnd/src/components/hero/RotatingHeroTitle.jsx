import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const RotatingHeroTitle = ({
  titleLine = ["Your local", "marketplace,"],
  rotating = ["Delivered", "Nearby", "Fresh", "In minutes"],
  dark = false,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const currentWord = `${rotating[wordIndex].replace(/\.$/, "")}.`;

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setWordIndex((current) => (current + 1) % rotating.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [paused, rotating.length]);

  const cycleWord = () => {
    setWordIndex((current) => (current + 1) % rotating.length);
  };

  return (
    <>
      <h1
        className={`mt-[max(0.7rem,1.6vh)] font-display text-[clamp(2.7rem,13vw,3.45rem)] font-extrabold leading-[1.06] tracking-tight sm:text-[clamp(2.85rem,6.8vw,3.5rem)] lg:mt-3 lg:text-[3.6rem] lg:font-bold lg:leading-[1.08] ${
          dark ? "text-white" : "text-[var(--color-text)]"
        }`}
      >
        {(Array.isArray(titleLine) ? titleLine : [titleLine]).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        <span className="relative mt-[max(0.2rem,0.55vh)] inline-grid justify-items-start lg:mt-2">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 text-[1.16em] font-extrabold tracking-tight sm:text-[1.2em] lg:text-[1.24em]"
          >
            {`${[...rotating].sort((a, b) => b.length - a.length)[0].replace(/\.$/, "")}.`}
          </span>
          <AnimatePresence mode="wait">
            <motion.button
              key={currentWord}
              type="button"
              onClick={cycleWord}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ opacity: 0.86 }}
              whileTap={{ opacity: 0.75 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              aria-label={`${currentWord} Click to see the next title`}
              className={`hero-rotating-word col-start-1 row-start-1 w-max justify-self-start text-[1.16em] sm:text-[1.2em] lg:text-[1.24em] lg:justify-self-start ${
                dark ? "text-[var(--color-green-soft)]" : "text-[var(--color-primary)]"
              }`}
            >
              {currentWord}
            </motion.button>
          </AnimatePresence>
        </span>
      </h1>
      <div className={`mt-[max(0.35rem,0.8vh)] flex items-center justify-start gap-1.5 lg:mt-2 ${dark ? "text-white" : "text-[var(--color-primary)]"}`}>
        {rotating.map((word, index) => (
          <button
            key={word}
            type="button"
            aria-label={`Show ${word}`}
            aria-current={index === wordIndex ? "true" : undefined}
            onClick={() => setWordIndex(index)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`h-1.5 rounded-full transition-all ${
              index === wordIndex ? "w-6 bg-current" : "w-1.5 bg-current/30 hover:bg-current/60"
            }`}
          />
        ))}
      </div>
    </>
  );
};

export default RotatingHeroTitle;
