import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const RotatingHeroTitle = ({
  titleLine = ["Your local", "marketplace,"],
  rotating = ["Delivered", "Nearby", "Fresh", "In minutes"],
  dark = false,
  centered = false,
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
        className={`${centered ? "text-center lg:whitespace-nowrap" : ""} mt-[max(0.45rem,1vh)] font-display text-[clamp(2.7rem,13vw,3.45rem)] font-extrabold leading-[1.06] tracking-tight sm:text-[clamp(2.85rem,6.8vw,3.5rem)] lg:mt-2 lg:text-[3.6rem] lg:font-bold lg:leading-[1.08] ${
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
              className={`hero-rotating-word col-start-1 row-start-1 w-max ${centered ? "justify-self-center" : "justify-self-start"} text-[1.16em] sm:text-[1.2em] lg:text-[1.24em] lg:${centered ? "justify-self-center" : "justify-self-start"} ${
                dark ? "text-white" : "text-(--color-primary)"
              }`}
            >
              {currentWord}
            </motion.button>
          </AnimatePresence>
        </span>
      </h1>
    </>
  );
};

export default RotatingHeroTitle;
