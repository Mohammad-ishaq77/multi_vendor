import { Link } from "react-router-dom";
import { APP_CONFIG } from "../../config/appConfig";
import { cn } from "../../utils/helpers";

const BrandLogo = ({
  to = "/",
  size = 40,
  showText = true,
  inverted = false,
  subtitle = "Local Marketplace",
  className = "",
}) => {
  return (
    <Link to={to} className={cn("flex items-center gap-3 group min-w-0", className)}>
      <span className="relative flex-shrink-0">
        <img
          src={APP_CONFIG.logo}
          alt={`${APP_CONFIG.name} logo`}
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </span>
      {showText && (
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "text-lg font-bold tracking-tight leading-none",
              inverted ? "text-white" : "text-[var(--color-text)]"
            )}
          >
            {APP_CONFIG.name}
          </span>
          {subtitle && (
            <span
              className={cn(
                "mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
                inverted ? "text-white/70" : "text-[var(--color-text-muted)]"
              )}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
