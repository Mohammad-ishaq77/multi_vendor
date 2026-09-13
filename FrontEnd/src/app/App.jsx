import { BrowserRouter } from "react-router-dom";
import AppProviders from "./providers/AppProviders";
import ScrollToTop from "../components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AppProviders>
      <div className="min-h-screen">
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </div>
    </AppProviders>
  );
}

export default App;
