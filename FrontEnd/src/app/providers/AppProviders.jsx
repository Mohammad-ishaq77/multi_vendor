import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../features/customer/context/CartContext";
import { ToastProvider } from "../../components/common/Toast";

const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
