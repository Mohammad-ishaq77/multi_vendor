import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Hero from "./Hero";
import Features from "./Features";
import Categories from "./Categories";
import FeaturedShops from "./FeaturedShops";
import PopularProducts from "./PopularProducts";
import HowItWorks from "./HowItWorks";
import CTABanner from "./CTABanner";
import Newsletter from "./Newsletter";

const LandingPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [hash]);

  return (
    <MainLayout>
      <Hero />
      <Features />
      <Categories />
      <FeaturedShops />
      <PopularProducts />
      <HowItWorks />
      <CTABanner />
      <Newsletter />
    </MainLayout>
  );
};

export default LandingPage;
