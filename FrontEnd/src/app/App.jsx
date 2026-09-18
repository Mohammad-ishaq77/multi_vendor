import { BrowserRouter } from "react-router-dom";
import AppProviders from "./providers/AppProviders";
import ScrollToTop from "../components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";
import { LogoutProvider } from "../context/LogoutContext";

function App() {
  return (
    <AppProviders>
      <div className="min-h-screen">
        <BrowserRouter>
          <LogoutProvider>
            <ScrollToTop />
            <AppRoutes />
          </LogoutProvider>
        </BrowserRouter>
      </div>
    </AppProviders>
  );
}

export default App;
