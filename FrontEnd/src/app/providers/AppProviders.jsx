import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "../../features/customer/context/CartContext";

const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
