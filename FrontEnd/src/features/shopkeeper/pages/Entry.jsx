import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageLoader from "../../../components/common/PageLoader";
import { ShopkeeperProvider, useShopkeeper } from "../context/ShopkeeperContext";

const ShopkeeperGate = () => {
  const { loading, error, shopStatus, onboardingStep, isApproved } = useShopkeeper();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || (error && !shopStatus)) return;

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
  }, [loading, error, shopStatus, isApproved, onboardingStep, location.pathname, navigate]);

  return null;
};

const ShopkeeperRouteContent = ({ children }) => {
  const { loading, error, refresh, shopStatus, isApproved } = useShopkeeper();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (error && !shopStatus) {
    return (
      <div role="alert" className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-semibold text-gray-900">We couldn’t load your shop account.</p>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!isApproved && !location.pathname.startsWith("/shopkeeper/onboarding")) return null;

  return children;
};

const ShopkeeperEntry = ({ children }) => {
  return (
    <ShopkeeperProvider>
      <ShopkeeperGate />
      <ShopkeeperRouteContent>{children}</ShopkeeperRouteContent>
    </ShopkeeperProvider>
  );
};

export default ShopkeeperEntry;
