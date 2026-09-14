import { useState } from "react";
import { useToast } from "../components/common/Toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    showToast("You are subscribed to NearMart updates.");
    setEmail("");
  };

  return (
    <section className="on-green bg-[var(--color-primary)] py-5">
      <div className="container-app flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h3 className="text-sm font-bold text-white sm:text-base">Get local offers</h3>
        <form onSubmit={handleSubmit} className="flex w-full overflow-hidden rounded-xl bg-white sm:w-auto">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="min-h-10 flex-1 px-4 text-sm text-[var(--color-text)] outline-none sm:w-56"
          />
          <button type="submit" className="min-h-10 bg-[var(--color-primary-dark)] px-4 text-sm font-semibold text-white">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
