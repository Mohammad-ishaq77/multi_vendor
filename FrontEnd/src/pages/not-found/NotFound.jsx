import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import BrandLogo from "../../components/common/BrandLogo";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-surface) px-6">
      <div className="w-full max-w-lg rounded-[24px] border border-(--color-green-soft) bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <div className="mb-6 flex justify-center">
          <BrandLogo to="/" subtitle="Page not found" />
        </div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-green-bg) text-(--color-primary)">
          <Search className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-primary)">404</p>
        <h1 className="mt-2 text-3xl font-bold text-(--color-text)">This page is off the map</h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-muted)">
          The page you are looking for does not exist or has been moved. Head back to the marketplace to keep shopping local.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
