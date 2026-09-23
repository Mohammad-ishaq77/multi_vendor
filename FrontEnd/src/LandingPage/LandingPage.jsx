import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Hero from "./Hero";
import Categories from "./Categories";
import FeaturedShops from "./FeaturedShops";
import PopularProducts from "./PopularProducts";
import HowItWorks from "./HowItWorks";

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
      <Hero compactHome />
      <Categories />
      <FeaturedShops />
      <PopularProducts />
      <HowItWorks />
    </MainLayout>
  );
};

export default LandingPage;
