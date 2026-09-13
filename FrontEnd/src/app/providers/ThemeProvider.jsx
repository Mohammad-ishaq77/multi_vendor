import { createContext, useContext, useState, useEffect, useMemo } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.style.backgroundColor =
      theme === "dark" ? "#020817" : "#ffffff";
    document.body.style.color =
      theme === "dark" ? "#e2e8f0" : "#0f172a";
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
  }, [theme]);

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
