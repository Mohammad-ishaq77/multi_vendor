import Navbar from "../LandingPage/Navbar";
import Footer from "../LandingPage/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-(--color-text)">
      <Navbar />
      <div className="site-header-offset" aria-hidden="true" />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
