import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const columns = [
    {
      title: "Company",
      links: [
        { name: "About Us", to: "/about" },
        { name: "Careers", to: "#" },
        { name: "Blog", to: "#" },
        { name: "Contact Us", to: "/contact" },
      ],
    },
    {
      title: "Help",
      links: [
        { name: "FAQs", to: "#" },
        { name: "Shipping", to: "#" },
        { name: "Returns", to: "#" },
        { name: "Privacy Policy", to: "#" },
      ],
    },
    {
      title: "For Shoppers",
      links: [
        { name: "My Orders", to: "#" },
        { name: "Track Order", to: "#" },
        { name: "Wishlist", to: "#" },
        { name: "Offers", to: "#" },
      ],
    },
    {
      title: "For Shopkeepers",
      links: [
        { name: "Register Shop", to: "#" },
        { name: "Seller Center", to: "#" },
        { name: "Resources", to: "#" },
        { name: "Help Center", to: "#" },
      ],
    },
  ];

  const socials = [
    {
      label: "Facebook",
      href: "#",
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: "#",
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      svg: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative bg-[#0B1120] text-slate-400 overflow-hidden">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1B4332]/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center shadow-lg shadow-[#1B4332]/20 group-hover:shadow-[#1B4332]/30 transition-all">
                <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight block leading-none">
                  NearMart
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-widest uppercase mt-1 block">
                  Your Local Stores
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-xs text-slate-400">
              Connecting you with trusted neighborhood shops for fast, reliable delivery. Shop local, live better.
            </p>
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] hover:shadow-lg hover:shadow-[#1B4332]/20 transition-all duration-300"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">
                {col.title}
              </h4>
              <div className="flex flex-col gap-3">
                {col.links.map((link) =>
                  link.to.startsWith("/") ? (
                    <Link
                      key={link.name}
                      to={link.to}
                      className="group text-sm text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ) : (
                    <a
                      key={link.name}
                      href={link.to}
                      className="group text-sm text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Strip */}
        <div className="relative mb-12 p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-[#1B4332]/20 to-slate-800/40 border border-slate-700/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B4332]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Join the NearMart Community
              </h3>
              <p className="text-sm text-slate-400">
                Get exclusive offers, updates, and local deals delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-5 py-3 rounded-l-xl bg-slate-900/60 border border-slate-700/50 text-sm text-white placeholder-slate-500 outline-none focus:border-[#1B4332] transition-colors"
              />
              <button className="px-6 py-3 bg-[#1B4332] text-white text-sm font-semibold rounded-r-xl hover:bg-[#143728] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2024 NearMart. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;