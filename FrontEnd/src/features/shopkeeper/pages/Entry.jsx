import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShopkeeperProvider, useShopkeeper } from "../context/ShopkeeperContext";

const ShopkeeperGate = () => {
  const { onboardingStep, isApproved } = useShopkeeper();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // If on an onboarding page, allow it
    if (path.startsWith("/shopkeeper/onboarding")) return;

    // If not approved, redirect to onboarding
    if (!isApproved) {
      navigate("/shopkeeper/onboarding", { replace: true });
      return;
    }

    // If approved and on root shopkeeper path, go to dashboard
    if (path === "/shopkeeper") {
      navigate("/shopkeeper/dashboard", { replace: true });
    }
  }, [isApproved, onboardingStep, location.pathname, navigate]);

  return null;
};

const ShopkeeperEntry = ({ children }) => {
  return (
    <ShopkeeperProvider>
      <ShopkeeperGate />
      {children}
    </ShopkeeperProvider>
  );
};

export default ShopkeeperEntry;
