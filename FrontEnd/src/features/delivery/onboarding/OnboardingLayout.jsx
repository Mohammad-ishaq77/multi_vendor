/* oxlint-disable react/only-export-components */
import { useLocation, useNavigate } from "react-router-dom";
import OnboardingShell from "../../../components/onboarding/OnboardingShell";

export const DELIVERY_ONBOARDING_STEPS = [
  { path: "/delivery/onboarding/guidelines", label: "Guidelines" },
  { path: "/delivery/onboarding/contact", label: "Details" },
  { path: "/delivery/onboarding/identity", label: "Identity" },
  { path: "/delivery/onboarding/address", label: "Address" },
  { path: "/delivery/onboarding/documents", label: "Review" },
  { path: "/delivery/onboarding/verification", label: "Submitted" },
];

export default function OnboardingLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  const currentIdx = DELIVERY_ONBOARDING_STEPS.findIndex((step) => step.path === currentPath);
  const previous = DELIVERY_ONBOARDING_STEPS[currentIdx - 1];

  return (
    <OnboardingShell
      steps={DELIVERY_ONBOARDING_STEPS}
      currentIndex={Math.max(0, currentIdx)}
      onBack={() => {
        navigate(previous?.path || DELIVERY_ONBOARDING_STEPS[0].path);
      }}
      hideSteps={location.pathname.includes("verification")}
    >
      {children}
    </OnboardingShell>
  );
}
