import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShopkeeperProvider, useShopkeeper } from "../context/ShopkeeperContext";

const ShopkeeperGate = () => {
  const { onboardingStep, isApproved } = useShopkeeper();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/shopkeeper/onboarding")) return;

    if (!isApproved) {
      const dest =
        {
          type_selection: "/shopkeeper/onboarding",
          create_shop: "/shopkeeper/onboarding/create-shop",
          documents: "/shopkeeper/onboarding/documents",
          approval: "/shopkeeper/onboarding/approval",
        }[onboardingStep] || "/shopkeeper/onboarding";
      navigate(dest, { replace: true });
      return;
    }

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
