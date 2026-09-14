import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Store,
  Truck,
  Users,
  Globe,
  Search,
  ShoppingBag,
  Package,
  Smile,
  ShieldCheck,
  Lock,
  UserCheck,
  BadgeCheck,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Hero from "./Hero";
import { aboutHero } from "../config/heroes";

const About = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  return (
    <MainLayout>
      <Hero
        tone="dark"
        eyebrow={aboutHero.eyebrow}
        titleLine={aboutHero.titleLine}
        rotating={aboutHero.rotating}
        description={aboutHero.description}
        stats={aboutHero.stats}
        primaryTo="/marketplace"
        primaryLabel="Start shopping"
        secondaryTo="/contact"
        secondaryLabel="Talk to us"
        footer="Built in Srinagar for neighborhood shops, riders and families"
      />

      {/* OUR STORY */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4 inline-block border-b-2 border-[#1B4332] pb-1">Our Story</h2>
            <p className="text-[15px] text-[#64748B] leading-relaxed max-w-3xl">
              NearMart was born out of a simple idea – strengthen local communities by bringing shops, customers and delivery partners onto one digital platform. We observed that local businesses struggle to reach more customers and customers often prefer shopping from nearby stores. NearMart bridges this gap with technology, trust and transparency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-2">Our Mission</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                To empower local shopkeepers, create reliable delivery opportunities and provide customers with a seamless shopping experience.
              </p>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-2">Our Vision</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                To become the most trusted local marketplace where every neighborhood thrives together.
              </p>
            </div>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] mb-2">Our Values</h3>
              <ul className="text-sm text-[#64748B] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-[#1B4332]">✓</span> Support Local Businesses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1B4332]">✓</span> Trust & Transparency
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1B4332]">✓</span> Customer First
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1B4332]">✓</span> Growth Together
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2 custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-xl font-bold text-[#0F172A] mb-8">
            Who We Serve
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Store, title: "Shopkeepers", desc: "We help local shops grow online by providing them a platform to showcase their products, receive orders and manage their business efficiently." },
              { icon: Truck, title: "Delivery Partners", desc: "We create flexible earning opportunities for delivery agents and ensure safe, secure and traceable deliveries." },
              { icon: Users, title: "Customers", desc: "We provide customers with quality products, best prices and fast delivery from trusted local shops." },
              { icon: Globe, title: "Community", desc: "We believe in strengthening local economies and building a community where everyone grows together." },
            ].map((item, idx) => (
              <motion.div key={item.title} custom={idx} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#1B4332]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-1">{item.title}</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW NEARMART WORKS */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2 custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-xl font-bold text-[#0F172A] mb-10">
            How NearMart Works
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative">
            {[
              { icon: Search, num: "1", title: "Browse & Shop", desc: "Explore products from local shops and add your favorites to cart." },
              { icon: ShoppingBag, num: "2", title: "Place Order", desc: "Place your order and choose a payment method." },
              { icon: Package, num: "3", title: "Prepare & Pickup", desc: "Shopkeeper prepares your order and delivery partner picks it up." },
              { icon: Truck, num: "4", title: "Fast Delivery", desc: "Order is delivered to your doorstep quickly and safely." },
              { icon: Smile, num: "5", title: "Enjoy & Repeat", desc: "Receive your order, enjoy and shop again for more amazing deals." },
            ].map((step, idx) => (
              <motion.div key={step.num} custom={idx} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative flex flex-col items-center text-center">
                {/* Arrow between items (hidden on last and mobile wrap) */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-6 -right-3 text-gray-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                <div className="w-14 h-14 rounded-full bg-[#1B4332]/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-[#1B4332]" />
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">
                  {step.num}. {step.title}
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-[180px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#1B4332]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Your Trust, Our Priority</h3>
                <p className="text-sm text-[#64748B] leading-relaxed max-w-xl">
                  We are committed to providing a safe, secure and reliable platform for all users. Your data is protected and all transactions are handled with the highest security standards.
                </p>
              </div>
            </div>

            <div className="flex gap-8 lg:gap-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#1B4332]" />
                </div>
                <span className="text-xs font-medium text-[#0F172A]">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[#1B4332]" />
                </div>
                <span className="text-xs font-medium text-[#0F172A]">Data Privacy</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-[#1B4332]" />
                </div>
                <span className="text-xs font-medium text-[#0F172A]">Trusted Platform</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TECH & PARTNERS */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Technology & Innovation</h3>
            <p className="text-sm text-[#64748B] leading-relaxed mb-6">
              We use modern technologies to ensure a smooth and reliable experience for our users. Our platform is built for speed, security and scalability.
            </p>
            <div className="flex flex-wrap gap-2">
              {["React Native", "Node.js", "MongoDB", "Firebase", "Google Maps", "Razorpay", "Cloud Hosting"].map((tech) => (
                <span key={tech} className="px-3 py-1.5 text-xs font-medium text-[#64748B] bg-gray-100 rounded-lg border border-gray-200">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Our Partners</h3>
            <p className="text-sm text-[#64748B] leading-relaxed mb-6">
              We collaborate with trusted partners to deliver better services and create more value for our community.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-lg font-bold text-slate-700 italic">Razorpay</span>
              <span className="text-lg font-bold text-slate-700">shiprocket</span>
              <span className="text-lg font-bold text-slate-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center">G</span>
                Google Maps
              </span>
              <span className="text-lg font-bold text-slate-700 italic">aws</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="overflow-hidden rounded-[28px] shadow-[0_24px_50px_-28px_rgba(6,78,59,0.4)]">
              <img
                src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1400&q=85"
                alt="NearMart community"
                className="h-64 w-full object-cover sm:h-80"
              />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-[#1B4332] mb-3">
                Thank you for being a part of NearMart Community.
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed mb-8">
                Together, let's build stronger neighborhoods and a better tomorrow.
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-3">Quick Links</h4>
                  <div className="flex flex-col gap-2">
                    {["Home", "Shops", "Categories", "Offers"].map((link) => (
                      <Link key={link} to={link === "Home" ? "/" : `/#${link.toLowerCase()}`} className="text-sm text-[#64748B] hover:text-[#1B4332] transition-colors">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-3 opacity-0">Links</h4>
                  <div className="flex flex-col gap-2">
                    {["About Us", "Contact", "Privacy Policy", "Terms & Conditions"].map((link) => (
                      <Link key={link} to={link === "About Us" ? "/about" : link === "Contact" ? "/contact" : "#"} className="text-sm text-[#64748B] hover:text-[#1B4332] transition-colors">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </MainLayout>
  );
};

export default About;