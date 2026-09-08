import { createContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

import { CartProvider } from "./pages/Customer/context/CartContext";

export const ThemeContext = createContext();

function App() {
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
    () => ({
      theme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <CartProvider>
        <div
          data-theme={theme}
          className="min-h-screen"
        >
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </div>
      </CartProvider>
    </ThemeContext.Provider>
  );
}

export default App;