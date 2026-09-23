import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const AuthCloseButton = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <button
      type="button"
      aria-label="Close"
      onClick={handleClose}
      className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-(--color-green-soft) bg-white text-(--color-text) shadow-[var(--shadow-card)] hover:bg-(--color-green-bg) ${className}`}
    >
      <X className="h-5 w-5" />
    </button>
  );
};

export default AuthCloseButton;
