import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  ShieldCheck,
  Headphones,
  MessageCircle,
  Handshake,
  Shield,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import PageHero from "../components/hero/PageHero";
import { pageHeroes } from "../config/heroes";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+91 98765 43210",
    },
    {
      icon: Mail,
      label: "Email",
      value: "support@nearmart.com",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "NearMart HQ, Srinagar, Jammu & Kashmir, India",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon - Sat: 9:00 AM - 8:00 PM\nSun: 10:00 AM - 6:00 PM",
    },
  ];

  const reasons = [
    {
      icon: Headphones,
      title: "Quick Support",
      desc: "Get fast and reliable support from our team.",
    },
    {
      icon: MessageCircle,
      title: "We Listen",
      desc: "Your feedback helps us improve NearMart for everyone.",
    },
    {
      icon: Handshake,
      title: "Partnerships",
      desc: "Interested in partnering with us? Let's build something great together.",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      desc: "We prioritize your trust and privacy above everything.",
    },
  ];

  return (
    <MainLayout>
      <PageHero {...pageHeroes.contact} />

      <main className="py-10 lg:py-14 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid: Contact Info + Form */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge-soft mb-5">Get in touch</span>

              <h2 className="font-display text-3xl font-bold text-[var(--color-text)] leading-[1.15] mb-4">
                Send a message
              </h2>

              <p className="text-base text-[var(--color-text-muted)] leading-relaxed mb-10 max-w-md">
                Have a question, suggestion, or need assistance? Our Srinagar team is ready to help.
              </p>

              <div className="space-y-5">
                {contactInfo.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-[#1B4332]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
                      <p className="text-sm text-[#64748B] whitespace-pre-line leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div id="contact-form" className="scroll-mt-32 bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-lg shadow-gray-100/50">
                <h2 className="text-xl font-bold text-[#0F172A] mb-1">
                  Send Us a Message
                </h2>
                <p className="text-sm text-[#64748B] mb-6">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-[#1B4332] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-[#64748B]">
                      Our team will get back to you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F172A] placeholder:text-gray-400 outline-none focus:border-[#1B4332] transition-all"
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F172A] placeholder:text-gray-400 outline-none focus:border-[#1B4332] transition-all"
                      />
                    </div>

                    <input
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F172A] placeholder:text-gray-400 outline-none focus:border-[#1B4332] transition-all"
                    />

                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F172A] placeholder:text-gray-400 outline-none focus:border-[#1B4332] transition-all resize-none"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#143728] transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send Message
                      </motion.button>

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">
                        <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                        <span>
                          We respect your privacy<br className="hidden sm:block" /> and keep your data safe.
                        </span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Section: Map + Why Contact */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Visit Our Office */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm"
            >
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                Visit Our Office
              </h3>
              <p className="text-sm text-[#64748B] mb-5">
                We'd love to meet you! Visit our office for any inquiries or collaborations.
              </p>
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-64 w-full">
                <iframe
                  title="NearMart Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105801.67476664573!2d74.7607348!3d34.0836708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e1855686e3c5ef%3A0x66244b7cc1e305c6!2sSrinagar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Why Contact NearMart? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm"
            >
              <h3 className="text-lg font-bold text-[#0F172A] mb-6">
                Why Contact NearMart?
              </h3>
              <div className="grid sm:grid-cols-2 gap-5">
                {reasons.map((reason, idx) => (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1B4332]/10 flex items-center justify-center flex-shrink-0">
                      <reason.icon className="w-5 h-5 text-[#1B4332]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0F172A] mb-0.5">
                        {reason.title}
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {reason.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

    </MainLayout>
  );
};

export default Contact;