import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe, Mail, MessageCircle, Share2 } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import { footerColumns } from "../config/navigation";
import { APP_CONFIG } from "../config/appConfig";
import { useToast } from "../components/common/Toast";

const socials = [
  { label: "Share NearMart", href: "#", icon: Share2 },
  { label: "Community", href: "#", icon: MessageCircle },
  { label: "Website", href: "#", icon: Globe },
  { label: "Email", href: `mailto:${APP_CONFIG.supportEmail}`, icon: Mail },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    showToast("You are subscribed to NearMart updates.");
    setEmail("");
  };

  return (
    <footer className="on-green relative overflow-hidden bg-[var(--color-primary-dark)]">
      <div className="container-app relative pt-8 pb-6 lg:pt-10">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <BrandLogo inverted subtitle="Local Marketplace" className="mb-5" />
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/70">
              A multi-vendor marketplace connecting you with trusted neighborhood shops, fast delivery and a modern shopping experience.
            </p>
            <div className="flex gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-[var(--color-primary)] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold tracking-wide text-white">{column.title}</h4>
              <div className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    className="group inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <form onSubmit={handleSubscribe} className="flex w-full overflow-hidden rounded-lg bg-white sm:w-auto">
            <label htmlFor="footer-subscribe-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-subscribe-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="min-h-9 flex-1 px-3 text-sm text-[var(--color-text)] outline-none sm:w-48"
            />
            <button type="submit" className="min-h-9 bg-[var(--color-primary)] px-4 text-xs font-semibold text-white hover:bg-[var(--color-green)]">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
