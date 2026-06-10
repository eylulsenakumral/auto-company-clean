"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  seats: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

const plans: Plan[]  [
  {
    id: "free",
    name: "Free",
    description: "Perfect for individual developers",
    price: "$0",
    period: "forever",
    seats: "1 seat",
    features: [
      "Access to all 31+ CLI tools",
      "Unlimited local usage",
      "Community support",
      "Open source codebase",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals who need more",
    price: "$5",
    period: "per seat/month",
    seats: "Per-seat pricing",
    features: [
      "Everything in Free",
      "Unlimited CLI tool usage",
      "Priority support",
      "Team collaboration features",
      "API access",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For teams that ship together",
    price: "$49",
    period: "for 10 seats/month",
    seats: "10 seats included",
    features: [
      "Everything in Pro",
      "Unlimited seats included",
      "Admin dashboard",
      "SSO & security controls",
      "Custom integrations",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const faqs  [
  {
    q: "What is a seat?",
    a: "A seat represents one authenticated user account. Each team member needs their own seat to access the CLI tools and collaborate with your team.",
  },
  {
    q: "Is usage really unlimited?",
    a: "Yes. We don't count requests or impose usage limits. Use the tools as much as you need — we're selling access, not scarcity.",
  },
  {
    q: "Can I mix and match plans?",
    a: "Absolutely. Start with Free, upgrade to Pro when you need more seats, or move to Team when you're ready for enterprise features.",
  },
  {
    q: "What happens if I exceed my seats?",
    a: "On the Team plan, you get unlimited seats. On Pro, each additional seat is $5/month. We'll notify you when you need to add more.",
  },
  {
    q: "Do tools work offline?",
    a: "Yes. Once authenticated, all CLI tools work offline. The auth check happens periodically, not on every run.",
  },
];

export function PricingSection() {
  const [openFaq, setOpenFaq]  useState<number | null>(null);

  return (
    <section id"pricing" className"py-20 md:py-32 border-t border-dark-800">
      <div className"container mx-auto px-4">
        {/* Header */}
        <div className"max-w-3xl mx-auto text-center mb-16">
          <h2 className"text-3xl md:text-5xl font-bold text-white mb-4">
            Unlimited CLI Tools, One Price
          </h2>
          <p className"text-lg text-dark-300">
            Stop counting requests. Start shipping. Per-seat pricing means you
            pay for people, not usage.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className"grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {plans.map((plan) > (
            <div
              key{plan.id}
              className{`p-6 rounded-lg border ${
                plan.highlight
                  ? "bg-card border-accent relative"
                  : "bg-card border-dark-800"
              }`}
            >
              {plan.highlight && (
                <div className"absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className"bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className"mb-6">
                <h3 className"text-xl font-bold text-white">{plan.name}</h3>
                <p className"text-sm text-dark-400 mt-1">{plan.description}</p>
              </div>

              <div className"mb-6">
                <div className"flex items-baseline gap-1">
                  <span className"text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className"text-dark-400">{plan.period}</span>
                </div>
                <p className"text-sm text-dark-500 mt-1">{plan.seats}</p>
              </div>

              <ul className"space-y-3 mb-6">
                {plan.features.map((feature) > (
                  <li key{feature} className"flex items-start gap-2">
                    <svg
                      className"w-5 h-5 text-accent shrink-0 mt-0.5"
                      fill"none"
                      stroke"currentColor"
                      viewBox"0 0 24 24"
                    >
                      <path
                        strokeLinecap"round"
                        strokeLinejoin"round"
                        strokeWidth{2}
                        d"M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className"text-sm text-dark-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className{`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-accent hover:bg-accent-hover text-white"
                    : "bg-dark-800 hover:bg-dark-700 text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className"max-w-2xl mx-auto">
          <h3 className"text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className"space-y-4">
            {faqs.map((faq, index) > (
              <div
                key{index}
                className"border border-dark-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick{() > setOpenFaq(openFaq  index ? null : index)}
                  className"w-full px-5 py-4 text-left flex items-center justify-between hover:bg-dark-900 transition-colors"
                >
                  <span className"font-medium text-white">{faq.q}</span>
                  <svg
                    className{`w-5 h-5 text-dark-400 transition-transform ${
                      openFaq  index ? "rotate-180" : ""
                    }`}
                    fill"none"
                    stroke"currentColor"
                    viewBox"0 0 24 24"
                  >
                    <path
                      strokeLinecap"round"
                      strokeLinejoin"round"
                      strokeWidth{2}
                      d"M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq  index && (
                  <div className"px-5 pb-4">
                    <p className"text-dark-300">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
