/* oxlint-disable react/only-export-components */
import { useNavigate } from "react-router-dom";
import OnboardingShell from "../../../components/onboarding/OnboardingShell";

export const SHOP_ONBOARDING_STEPS = [
  { key: "type_selection", path: "/shopkeeper/onboarding", label: "Shop type" },
  { key: "create_shop", path: "/shopkeeper/onboarding/create-shop", label: "Shop details" },
  { key: "documents", path: "/shopkeeper/onboarding/documents", label: "Documents" },
  { key: "approval", path: "/shopkeeper/onboarding/approval", label: "Review" },
];

export default function ShopOnboardingLayout({ stepKey, children, onBack }) {
  const navigate = useNavigate();
  const currentIndex = Math.max(
    0,
    SHOP_ONBOARDING_STEPS.findIndex((step) => step.key === stepKey)
  );
  const previous = SHOP_ONBOARDING_STEPS[currentIndex - 1];

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (previous) navigate(previous.path);
    else navigate("/");
  };

  return (
    <OnboardingShell
      steps={SHOP_ONBOARDING_STEPS}
      currentIndex={currentIndex}
      onBack={handleBack}
      hideSteps={stepKey === "approval"}
    >
      {children}
    </OnboardingShell>
  );
}
