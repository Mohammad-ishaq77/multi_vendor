import { BrowserRouter } from "react-router-dom";
import AppProviders from "./providers/AppProviders";
import ScrollToTop from "../components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";
import ChatBotModal from "../components/common/ChatBotModal";
import { LogoutProvider } from "../context/LogoutContext";

function App() {
  return (
    <AppProviders>
      <div className="min-h-screen">
        <BrowserRouter>
          <LogoutProvider>
            <ScrollToTop />
            <AppRoutes />
            <ChatBotModal />
          </LogoutProvider>
        </BrowserRouter>
      </div>
    </AppProviders>
  );
}

export default App;
