import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Categories from "./Categories";
import FeaturedShops from "./FeaturedShops";
import PopularProducts from "./PopularProducts";
import HowItWorks from "./HowItWorks";
import Newsletter from "./Newsletter";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="relative bg-white min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <FeaturedShops />
      <PopularProducts />
      <HowItWorks />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default LandingPage;