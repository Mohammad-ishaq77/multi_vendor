import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import { footerColumns } from "../config/navigation";
import { APP_CONFIG } from "../config/appConfig";

const Footer = () => {
  return (
    <footer className="border-t border-(--color-green-soft) bg-white">
      <div className="container-app py-8 lg:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.1fr_repeat(4,1fr)] lg:gap-7">
          <div className="hidden justify-center sm:flex">
            <BrandLogo showText={false} size={112} className="mb-4" />
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-sm font-bold text-(--color-text)">{column.title}</h4>
              <div className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    className="group inline-flex w-fit items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-primary)"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-(--color-green-soft) pt-4 sm:mt-10 sm:flex-row sm:items-center">
          <p className="text-xs text-(--color-text-muted)">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <Link to="/contact" className="text-xs font-semibold text-(--color-primary) hover:text-(--color-primary-dark)">
            Help &amp; support
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
