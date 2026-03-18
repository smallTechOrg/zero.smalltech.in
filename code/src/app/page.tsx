"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import SignUpPage from "./signup/signUpPage";
import { analytics } from "./lib/analytics";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const CRM_CONTACTS = [
  { name: "Alex Rivera", email: "alex@r.com", source: "E-COM" },
  { name: "Sarah Chen", email: "s.chen@dev.io", source: "WEB" },
  { name: "Marcus Wright", email: "m.wright@xyz.co", source: "API" },
  { name: "Elena Rossi", email: "elena@rossi.it", source: "ADS" },
  { name: "James Wilson", email: "james@tech.com", source: "CRM" },
  { name: "Sofia Gomez", email: "sofia@global.es", source: "E-COM" },
  { name: "David Kim", email: "dk@startup.kr", source: "WEB" },
];

const TYPING_SEQUENCES = [
  "I'd like to book a demo. I'm looking to automate my client intake process.",
  "How much does the Enterprise plan cost for a team of 50?",
  "Can I integrate this with my existing HubSpot setup?",
  "Does the AI support multi-language customer queries?",
  "We need a solution for our e-commerce returns process.",
];

type IndustryKey =
  | "E-Commerce"
  | "Customer Service"
  | "Education"
  | "Enterprises"
  | "Healthcare"
  | "Insurance"
  | "IT Support"
  | "Real Estate"
  | "Recruitment"
  | "Sales"
  | "Small Business";

const INDUSTRY_CONFIGS: Record<
  IndustryKey,
  {
    icon: string;
    feature: string;
    desc: string;
    seoTitle: string;
    seoText: string;
  }
> = {
  "E-Commerce": {
    icon: "solar:bag-bold",
    feature: "Product Recommendations",
    desc: "Sync with your inventory for live stock updates and tailored suggestions.",
    seoTitle: "Conversational E-Commerce & AI Personalization",
    seoText:
      "Boost your Average Order Value (AOV) and reduce cart abandonment with AI shopping assistants.",
  },
  "Customer Service": {
    icon: "solar:headset-bold",
    feature: "Knowledge Sync",
    desc: "Connect to Zendesk, Intercom, or Notion to build a custom brain.",
    seoTitle: "Omnichannel Customer Experience (CX) Solutions",
    seoText:
      "Deliver a unified support experience across all digital touchpoints.",
  },
  Education: {
    icon: "solar:notebook-bold",
    feature: "Enrollment Assistant",
    desc: "Guide students through courses and handle admissions questions.",
    seoTitle: "EdTech AI & Student Engagement Automation",
    seoText:
      "Streamline the student journey from inquiry to enrollment with high-efficiency AI.",
  },
  Enterprises: {
    icon: "solar:buildings-bold",
    feature: "SSO & Security",
    desc: "Enterprise-grade encryption with custom deployments for large teams.",
    seoTitle: "Enterprise AI Strategy & Governance",
    seoText:
      "Scale AI across your organization with robust security protocols and HIPAA/SOC2 readiness.",
  },
  Healthcare: {
    icon: "solar:heart-pulse-bold",
    feature: "HIPAA Compliant",
    desc: "Secure patient intake and appointment reminders with privacy first.",
    seoTitle: "Secure Healthcare AI & Patient Communication",
    seoText:
      "Improve patient outcomes through better communication and automated triage.",
  },
  Insurance: {
    icon: "solar:shield-check-bold",
    feature: "Policy Explainer",
    desc: "Simplify complex policy terms and assist with initial claim reports.",
    seoTitle: "InsurTech AI & Claims Process Automation",
    seoText:
      "Accelerate claims processing and policy renewals with intelligent underwriting assistance.",
  },
  "IT Support": {
    icon: "solar:monitor-bold",
    feature: "Auto-Ticketing",
    desc: "Automatically log issues in Jira or ServiceNow with full chat logs.",
    seoTitle: "ITSM Automation & Internal AI Support",
    seoText:
      "Reduce IT overhead by automating Tier-1 support and password resets.",
  },
  "Real Estate": {
    icon: "solar:home-2-bold",
    feature: "Property Tours",
    desc: "Book viewings and pre-qualify buyers based on budget and location.",
    seoTitle: "Real Estate Lead Nurturing & AI Virtual Assistants",
    seoText:
      "Capture high-quality real estate leads around the clock and pre-screen prospects.",
  },
  Recruitment: {
    icon: "solar:users-group-rounded-bold",
    feature: "Resume Screening",
    desc: "Pre-screen candidates and schedule interviews with top talent.",
    seoTitle: "HR Tech & AI-Driven Talent Acquisition",
    seoText:
      "Transform your hiring process with AI recruitment and automated screening.",
  },
  Sales: {
    icon: "solar:ticker-star-bold",
    feature: "Proactive Outreach",
    desc: "Trigger chats based on pricing page scrolls and exit intent.",
    seoTitle: "B2B Sales Automation & Revenue Operations (RevOps)",
    seoText:
      "Optimize your sales velocity with intelligent AI agents across the entire funnel.",
  },
  "Small Business": {
    icon: "solar:shop-bold",
    feature: "Simple Setup",
    desc: "Affordable, no-code AI that levels the playing field with giants.",
    seoTitle: "Affordable AI for SMBs & Local Businesses",
    seoText:
      "Compete with big brands by offering premium, 24/7 customer service at an SMB price.",
  },
};

/* ------------------------------------------------------------------ */
/*  Iconify helper — renders <iconify-icon> web-component              */
/* ------------------------------------------------------------------ */

import Icon from "@/components/common/icon";

/* ------------------------------------------------------------------ */
/*  Sub-pages                                                          */
/* ------------------------------------------------------------------ */

type PageId = "home" | "pricing" | "sales" | "support" | "about" | "industry" | "signup";

/* ------------------------------------------------------------------ */
/*  Page: Home                                                         */
/* ------------------------------------------------------------------ */

function HomePage({ openChatWidget }: { openChatWidget: (msg?: string) => void }) {
  const typingRef = useRef<HTMLSpanElement>(null);
  const crmRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function typeMessage() {
      const el = typingRef.current;
      if (!el || cancelled) return;

      const msg = TYPING_SEQUENCES[indexRef.current % TYPING_SEQUENCES.length];
      el.textContent = "";
      let i = 0;

      const typeInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(typeInterval);
          return;
        }
        if (i < msg.length) {
          el.textContent += msg.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            if (!cancelled) addCrmLead();
          }, 400);
        }
      }, 40);
    }

    function addCrmLead() {
      const container = crmRef.current;
      if (!container || cancelled) return;

      const contact =
        CRM_CONTACTS[indexRef.current % CRM_CONTACTS.length];
      indexRef.current++;

      const div = document.createElement("div");
      div.className =
        "crm-item grid grid-cols-3 gap-3 p-3 rounded-xl border border-transparent opacity-0 translate-y-4 transition-all duration-500";
      div.innerHTML = `
        <span class="text-[10px] font-bold text-navy">${contact.name}</span>
        <span class="text-[10px] text-navy/70 truncate">${contact.email}</span>
        <span class="text-[9px] px-2 py-1 bg-sky/40 text-pacific font-black rounded-full text-center">NEW ${contact.source}</span>
      `;

      if (container.children.length >= 4) {
        const last = container.children[container.children.length - 1];
        last.classList.replace("opacity-100", "opacity-0");
        last.classList.add("translate-y-2");
        setTimeout(() => last.remove(), 500);
      }

      container.prepend(div);
      setTimeout(() => {
        div.classList.remove("opacity-0", "translate-y-4");
        div.classList.add("opacity-100", "translate-y-0", "row-update");
      }, 50);
    }

    function runSequence() {
      typeMessage();
    }

    runSequence();
    const interval = setInterval(runSequence, 12000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-sky rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left */}
            <div className="w-full lg:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky/30 border border-sky/50 text-pacific text-xs font-bold mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pacific opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pacific" />
                </span>
                NEW: Custom Backend Integration Support
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-navy mb-8 leading-[0.95]">
                Embeddable <br />
                Smart Agent{" "}
                <br />
                <span className="text-pacific">For Your Site</span>
              </h1>
              <p className="text-xl text-navy/60 mb-10 max-w-xl leading-relaxed font-medium">
                Tired of losing customers to boring contact forms?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <button
                  onClick={() => {
                  analytics.track('cta_click', { cta_text: 'Find A Better Way', location: 'hero', page: 'home' });
                  openChatWidget("I keep losing customers on my website.");
                }}
                  className="cursor-pointer flex-1 px-6 py-3.5 text-sm font-bold text-white bg-pacific rounded-full hover:bg-navy transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-pacific/20 group transform hover:-translate-y-0.5"
                >
                  <Icon
                    icon="solar:bolt-bold"
                    className="text-white"
                    width={18}
                  />
                  Find A Better Way
                </button>
              </div>
            </div>

            {/* Right — chat mockup */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative bg-white border border-sky/30 rounded-[3rem] p-6 shadow-2xl animate-float">
                <div className="bg-sky/20 rounded-3xl overflow-hidden border border-sky/50 h-[450px] flex flex-col">
                  <div className="bg-white p-4 border-b border-sky/50 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-sky/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-sky/50" />
                    </div>
                    <div className="px-3 py-1 bg-sky/40 rounded-full text-[10px] font-bold text-navy/40">
                      smallbusiness.com
                    </div>
                    <div className="w-4" />
                  </div>
                  <div className="flex-grow p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-navy shadow-lg shadow-navy/20" />
                      <div className="space-y-2 flex-grow">
                        <div className="h-2.5 bg-sky/50 rounded-full w-1/2" />
                        <div className="h-2.5 bg-sky/50 rounded-full w-1/3" />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky/30 flex-grow relative">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-end">
                          <div className="bg-pacific text-white text-[11px] font-medium p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                            In how many days can I expect the shipment for my order?
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-sky/40 text-navy/80 text-[11px] font-medium p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                            You should receive your order within 5-7 business days. 
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 p-3 bg-sky/20 border border-sky/50 rounded-full">
                        <div className="w-3 h-3 rounded-full bg-pacific animate-pulse" />
                        <div className="text-[10px] text-navy/40 font-bold tracking-widest">
                          And what is your return policy?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
              How it works?
            </h2>
            <p className="text-lg text-navy/60 font-medium max-w-2xl mx-auto">
              Transform your website from a static page into a dynamic
              conversation engine in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "solar:question-square-bold",
                title: "Answer FAQs",
                text: "Responds instantly to all your customer questions with human-like precision.",
              },
              {
                icon: "solar:user-plus-bold",
                title: "Collect Leads",
                text: "Captures contact details directly in your CRM dashboard while you sleep.",
              },
              {
                icon: "solar:clock-circle-bold",
                title: "24/7 Support",
                text: "Works as a dedicated reception desk round-the-clock, every single day.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-sky/20 border border-sky/30 hover:border-sky hover:bg-white hover:shadow-2xl hover:shadow-pacific/5 transition-all group"
              >
                <div className="w-14 h-14 bg-sky rounded-2xl flex items-center justify-center text-navy mb-6 group-hover:bg-pacific group-hover:text-white transition-colors duration-300">
                  <Icon icon={f.icon} width={30} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-navy/60 leading-relaxed font-medium">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content — substantive text about Zer0 for Google to index.
          Google requires 300+ words to consider a page "substantial content".
          This section also adds keyword-rich copy for ranking. */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-navy mb-6 tracking-tight leading-tight">
                The smartest AI agent for your small business website.
              </h2>
              <p className="text-navy/60 mb-6 leading-relaxed">
                Zer0 is an embeddable AI agent built specifically for small businesses. Unlike enterprise chatbots that require months of setup and six-figure budgets, Zer0 goes live on your website in minutes — with zero coding required.
              </p>
              <p className="text-navy/60 mb-6 leading-relaxed">
                Our AI understands your products, services, and FAQs right out of the box. It qualifies leads, answers customer queries, and books meetings automatically — 24 hours a day, 7 days a week, even when your team is offline.
              </p>
              <p className="text-navy/60 leading-relaxed">
                Trusted by businesses in e-commerce, real estate, healthcare, and more, Zer0 helps you compete with larger companies by delivering a premium customer experience at an SMB-friendly price. Start free with 200 conversations per month, or upgrade to Pro for unlimited conversations and backend integrations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Setup Time", value: "< 5 min", desc: "Paste one line of code and you're live on any website." },
                { label: "Industries", value: "All", desc: "Built for every industry and sector, from retail to healthcare." },
                { label: "Free Conversations", value: "200", desc: "Start free — no credit card required." },
                { label: "Uptime", value: "99.9%", desc: "Always on — nights, weekends, and holidays." },
              ].map((s) => (
                <div key={s.label} className="p-6 bg-sky/10 rounded-3xl border border-sky/20">
                  <div className="text-3xl font-black text-navy mb-1">{s.value}</div>
                  <div className="text-xs font-bold text-pacific uppercase tracking-wider mb-2">{s.label}</div>
                  <p className="text-navy/60 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automation CTA with live animation */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-5/12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-white">
                Automation that <br />
                actually works.
              </h2>
              <ul className="space-y-6 text-white font-semibold text-lg">
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-sky"
                    width={24}
                  />
                  Easy to Embed
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-sky"
                    width={24}
                  />
                  1000 Free Conversations
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-sky"
                    width={24}
                  />
                  Built-in CRM
                </li>
              </ul>
            </div>
            <div className="w-full lg:w-7/12 relative">
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 lg:p-12 shadow-2xl overflow-visible aspect-[4/3] flex items-center justify-center">
                <div className="w-full h-full grid grid-cols-2 gap-8 items-center relative">
                  {/* Typing card */}
                  <div className="bg-white rounded-2xl shadow-2xl p-4 h-64 flex flex-col border border-sky/30 transform -rotate-1 z-10">
                    <div className="bg-pacific rounded-xl p-4 w-11/12 ml-auto text-[11px] text-white font-mono leading-relaxed shadow-lg min-h-[60px]">
                      <span ref={typingRef} />
                      <span className="w-0.5 h-3 bg-white cursor-blink inline-block align-middle ml-1" />
                    </div>
                  </div>
                  {/* CRM card */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 h-64 border border-sky/30 transform rotate-1 overflow-hidden z-10 flex flex-col">
                    <div ref={crmRef} className="space-y-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: Pricing                                                      */
/* ------------------------------------------------------------------ */

function PricingPage({ openChatWidget }: { openChatWidget: (msg?: string) => void }) {
  const [yearly, setYearly] = useState(false);

  const handleBillingToggle = (isYearly: boolean) => {
    setYearly(isYearly);
    analytics.track('pricing_billing_toggle', {
      billing_cycle: isYearly ? 'yearly' : 'monthly',
    });
  };

  return (
    <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 text-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-black text-navy mb-6 tracking-tight">
          Flexible plans for every scale.
        </h2>
        <div className="flex items-center justify-center gap-4 mb-16">
          <span
            className={`text-sm font-bold transition-colors ${yearly ? "text-navy/40" : "text-navy"}`}
          >
            Monthly Billing
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={yearly}
              onChange={(e) => handleBillingToggle(e.target.checked)}
            />
            <div className="w-14 h-8 bg-sky/50 rounded-full peer-checked:bg-pacific transition-colors" />
            <div className="toggle-dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md" />
          </label>
          <span
            className={`text-sm font-bold transition-colors flex items-center gap-2 ${yearly ? "text-navy" : "text-navy/40"}`}
          >
            Yearly Billing
            <span className="bg-sky/40 text-pacific text-[10px] px-2 py-0.5 rounded-full font-black">
              SAVE 25%
            </span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-sky/50 text-left hover:border-sky hover:shadow-xl transition-all flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-navy/40 uppercase tracking-widest mb-4">
                Free Plan
              </h3>
              <div className="text-5xl font-black text-navy">Free</div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-pacific"
                  width={20}
                />
                200 Conversations/mo
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:close-circle-bold"
                  className="text-red-500"
                  width={20}
                />
                Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:close-circle-bold"
                  className="text-red-500"
                  width={20}
                />
                Free Customisations
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:close-circle-bold"
                  className="text-red-500"
                  width={20}
                />
                Free Backend Integration
              </li>
            </ul>
            <button
              onClick={() => {
                analytics.track('pricing_plan_click', { plan: 'free', billing_cycle: yearly ? 'yearly' : 'monthly', price: '0' });
                openChatWidget("I want to start with the free plan");
              }}
              className="cursor-pointer w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all"
            >
              Start Free
            </button>
          </div>

          {/* Basic */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-sky/50 text-left hover:border-sky hover:shadow-xl transition-all flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-navy/40 uppercase tracking-widest mb-4">
                Basic Plan
              </h3>
              <div className="text-5xl font-black text-navy">
                ${yearly ? "3" : "4"}
                <span className="text-lg font-medium text-navy/40">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-pacific"
                  width={20}
                />
                1000 Conversations/mo
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-pacific"
                  width={20}
                />
                Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-pacific"
                  width={20}
                />
                Free Customisations
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-navy/80">
                <Icon
                  icon="solar:close-circle-bold"
                  className="text-red-500"
                  width={20}
                />
                Free Backend Integration
              </li>
            </ul>
            <button
              onClick={() => {
                analytics.track('pricing_plan_click', { plan: 'basic', billing_cycle: yearly ? 'yearly' : 'monthly', price: yearly ? '$3/mo' : '$4/mo' });
                openChatWidget("I want to start with the basic plan");
              }}
              className="cursor-pointer w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all"
            >
              Select Basic
            </button>
          </div>

          {/* Pro */}
          <div className="p-10 bg-pacific rounded-[2.5rem] text-white text-left shadow-2xl shadow-pacific/30 transform md:scale-105 flex flex-col relative overflow-hidden">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-sky uppercase tracking-widest mb-4">
                Pro Plan
              </h3>
              <div className="text-5xl font-black">
                ${yearly ? "10" : "12"}
                <span className="text-lg font-medium opacity-70">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold">
                <Icon icon="solar:check-circle-bold" width={20} />
                Unlimited Conversations
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Icon icon="solar:check-circle-bold" width={20} />
                Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Icon icon="solar:check-circle-bold" width={20} />
                Free Customisations
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Icon icon="solar:check-circle-bold" width={20} />
                Free Backend Integration
              </li>
            </ul>
            <button
              onClick={() => {
                analytics.track('pricing_plan_click', { plan: 'pro', billing_cycle: yearly ? 'yearly' : 'monthly', price: yearly ? '$10/mo' : '$12/mo' });
                openChatWidget("I want to start with the pro plan");
              }}
              className="cursor-pointer w-full py-4 bg-white text-pacific rounded-2xl font-bold hover:bg-sky/30 transition-all shadow-xl"
            >
              Get Pro Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: Sales                                                        */
/* ------------------------------------------------------------------ */

function SalesPage({ openChatWidget }: { openChatWidget: (msg?: string) => void }) {
  return (
    <>
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-pacific font-bold tracking-widest uppercase text-xs mb-4 block">
                Sales Intelligence &amp; Revenue Acceleration
              </span>
              <h1 className="text-6xl font-black text-navy mb-6 leading-tight">
                AI Lead Generation: Close deals while you sleep.
              </h1>
              <p className="text-xl text-navy/60 mb-10 leading-relaxed font-medium">
                Zer0 identifies high-intent visitors, answers complex pricing
                questions, and books meetings automatically. It&apos;s the AI
                sales assistant that never takes a day off.
              </p>
              <button
                onClick={() => {
                  analytics.track('cta_click', { cta_text: 'Optimize Sales Funnel', location: 'sales_hero', page: 'sales' });
                  openChatWidget("I want to optimize my sales funnel with Zer0");
                }}
                className="cursor-pointer px-8 py-4 bg-pacific text-white rounded-full font-bold shadow-lg shadow-pacific/20 hover:bg-navy transition-all"
              >
                Optimize Sales Funnel
              </button>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="subpage-visual-blob w-full aspect-square flex items-center justify-center p-12">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full border border-sky/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-tangerine" />
                    <div className="w-3 h-3 rounded-full bg-amber" />
                    <div className="w-3 h-3 rounded-full bg-pacific" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-sky/40 rounded-full w-3/4" />
                    <div className="h-4 bg-sky/40 rounded-full w-1/2" />
                    <div className="h-20 bg-sky/30 rounded-2xl border-2 border-dashed border-sky flex items-center justify-center">
                      <span className="text-pacific font-bold text-sm">
                        Automated Lead Qualified: $12k Opportunity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-sky/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy">
              Maximize Conversational Commerce ROI
            </h2>
            <p className="text-navy/60 mt-4 max-w-2xl mx-auto">
              Scale your sales operation with intelligent automation that works
              across your entire customer lifecycle.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "solar:graph-up-bold",
                title: "Automated Lead Scoring",
                text: "Intelligently qualify prospects based on behavioral signals. Our AI ensures your sales team focuses only on high-value, hot leads.",
              },
              {
                icon: "solar:calendar-bold",
                title: "24/7 Meeting Scheduling",
                text: "Integrated with Google Calendar and Outlook. Book demos and sales calls directly inside the chat window to reduce friction.",
              },
              {
                icon: "solar:dollar-bold",
                title: "Sales Pipeline Integration",
                text: "Sync leads directly to Salesforce, HubSpot, or Pipedrive. Keep your sales pipeline updated in real-time with conversational data.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white p-8 rounded-3xl shadow-sm border border-sky/30"
              >
                <Icon
                  icon={f.icon}
                  className="text-pacific mb-4"
                  width={32}
                />
                <h3 className="text-xl font-bold text-navy mb-2">
                  {f.title}
                </h3>
                <p className="text-navy/60 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: Support                                                      */
/* ------------------------------------------------------------------ */

function SupportPage({ openChatWidget }: { openChatWidget: (msg?: string) => void }) {
  return (
    <>
      <section className="pt-40 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 text-left">
              <span className="text-pacific font-bold tracking-widest uppercase text-xs mb-4 block">
                CX Automation &amp; Support Excellence
              </span>
              <h1 className="text-6xl font-black text-navy mb-6 leading-tight">
                Customer Support Automation: Instant answers, 24/7.
              </h1>
              <p className="text-xl text-navy/60 mb-10 leading-relaxed font-medium">
                Reduce resolution times from hours to milliseconds. ZER0&apos;s
                intelligent support agents connect to your documentation to
                resolve complex product queries and technical issues without
                human intervention.
              </p>
              <button
                onClick={() => {
                  analytics.track('cta_click', { cta_text: 'Scale My Support', location: 'support_hero', page: 'support' });
                  openChatWidget("I want to scale my customer support with Zer0");
                }}
                className="cursor-pointer px-8 py-4 bg-navy text-white rounded-full font-bold shadow-lg shadow-navy/20 hover:bg-pacific transition-all"
              >
                Scale My Support
              </button>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-navy rounded-[3rem] p-12 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/40 rounded-full w-1/3" />
                      <div className="h-24 bg-white rounded-2xl p-4 text-xs font-medium text-navy/80 leading-relaxed shadow-lg">
                        &quot;I found the technical documentation for your SSO
                        setup. Here is the step-by-step guide to resolving the
                        403 error.&quot;
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-sky/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                stat: "90%",
                label: "Ticket Deflection",
                text: "Standardize common query responses and resolve repetitive tickets automatically.",
              },
              {
                stat: "< 5s",
                label: "Response Time",
                text: "AI never puts a customer on hold. Eliminate wait times and increase CSAT scores.",
              },
              {
                stat: "50+",
                label: "Languages",
                text: "Provide global customer support in over 50 languages without hiring expensive teams.",
              },
              {
                stat: "24/7",
                label: "Always-On",
                text: "Consistent, high-quality service during nights, weekends, and holidays.",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="p-6 bg-white border border-sky/30 rounded-3xl hover:shadow-md transition-all"
              >
                <div className="text-navy font-black text-3xl mb-2">
                  {s.stat}
                </div>
                <div className="text-pacific font-bold mb-1">{s.label}</div>
                <p className="text-navy/60 text-xs">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: Industry                                                     */
/* ------------------------------------------------------------------ */

function IndustryPage({
  industry,
  openChatWidget,
}: {
  industry: IndustryKey;
  openChatWidget: (msg?: string) => void;
}) {
  const config = INDUSTRY_CONFIGS[industry] ?? INDUSTRY_CONFIGS["Small Business"];
  return (
    <section className="pt-40 pb-20 bg-sky/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="lg:w-3/5">
            <div className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-navy/20">
              <Icon icon={config.icon} width={36} />
            </div>
            <h1 className="text-6xl font-black text-navy mb-6 tracking-tight">
              {config.seoTitle}
            </h1>
            <p className="text-xl text-navy/60 font-medium leading-relaxed mb-8">
              {config.seoText}
            </p>
            <button
              onClick={() => {
                analytics.track('cta_click', { cta_text: `Get ${industry} Case Study`, location: 'industry_hero', page: 'industry', variant: industry });
                openChatWidget(`I'd like to learn more about Zer0 for ${industry}`);
              }}
              className="cursor-pointer px-8 py-4 bg-pacific text-white rounded-full font-bold shadow-lg shadow-pacific/20 hover:bg-navy transition-all"
            >
              Get {industry} Case Study
            </button>
          </div>
          <div className="lg:w-2/5">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-sky/30 animate-float">
              <h3 className="text-xl font-bold text-navy mb-6">
                Industry-Specific AI
              </h3>
              <div className="bg-sky/30 p-6 rounded-2xl border border-sky/50 mb-4">
                <h4 className="font-bold text-navy mb-2">
                  {config.feature}
                </h4>
                <p className="text-navy/60 text-sm leading-relaxed">
                  {config.desc}
                </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-sky/30">
                <div className="flex items-center gap-3 text-navy/70 text-xs font-bold uppercase tracking-wider">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-pacific"
                    width={16}
                  />
                  GDPR &amp; SOC2 Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: About                                                        */
/* ------------------------------------------------------------------ */

function AboutPage() {
  return (
    <section className="pt-40 pb-20 lg:pt-56 lg:pb-40">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-black text-navy mb-8 tracking-tight">
          Humanizing Digital Interactions through AI.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "50M+", l: "Chats" },
            { v: "10k+", l: "Clients" },
            { v: "24/7", l: "Uptime" },
            { v: "0.1s", l: "Latency" },
          ].map((s) => (
            <div
              key={s.l}
              className="p-8 bg-sky/20 rounded-3xl border border-sky/30 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className="text-4xl font-black text-navy mb-2 group-hover:scale-110 transition-transform">
                {s.v}
              </div>
              <div className="text-xs font-bold text-navy/40 uppercase tracking-widest">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Root Page                                                          */
/* ================================================================== */

export default function Home({
  initialPage = "home",
  initialIndustry = "Small Business",
}: {
  initialPage?: PageId;
  initialIndustry?: IndustryKey;
} = {}) {
  const router = useRouter();
  const [page, setPage] = useState<PageId>(initialPage);
  const [industry, setIndustry] = useState<IndustryKey>(initialIndustry);
  const openChatWidget = useCallback((message?: string) => {
    analytics.track('chat_widget_opened', {
      trigger: 'cta',
      page,
      prefilled_message: message,
    });
    window.dispatchEvent(
      new CustomEvent("open-chat-widget", { detail: message ? { message } : undefined })
    );
  }, [page]);

  const navigateTo = useCallback(
    (id: PageId, industryParam?: IndustryKey) => {
      const url =
        id === "home" ? "/" :
        id === "industry" ? `/industry${industryParam ? `?industry=${encodeURIComponent(industryParam)}` : ""}` :
        `/${id}`;

      analytics.track('spa_navigation', {
        from_page: page,
        to_page: id,
        to_industry: industryParam,
      });
      analytics.pageView(url, `Zer0 — ${id.charAt(0).toUpperCase() + id.slice(1)}`);

      setPage(id);
      if (id === "industry" && industryParam) setIndustry(industryParam);
      router.push(url);
      window.scrollTo(0, 0);
    },
    [page, router]
  );

  return (
    <div className="bg-white text-navy/60 antialiased selection:bg-sky selection:text-navy overflow-x-hidden">
      {/* Iconify web component */}
      <Script
        src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
        strategy="beforeInteractive"
      />

      {/* Embedded chat widget */}
      <Script
        src="/embed.js"
        data-chat-url="/embed"
        data-colour="#219EBC"
        strategy="lazyOnload"
      />

      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 top-0 glass-panel">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 flex items-center gap-2 group"
              onClick={(e) => { e.preventDefault(); navigateTo("home"); }}
            >
              {/* img tag ensures Google can index this as an image (fixes "0 img tags" warning) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Zer0 logo"
                width={36}
                height={36}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-navy">Zer0</span>
                <span className="text-[10px] font-medium text-navy/40 tracking-wide">AI Agents for Small Businesses</span>
              </div>
            </Link>

            {/* Nav links — using <a> tags with href so Google indexes them as real links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="/pricing"
                onClick={(e) => { e.preventDefault(); navigateTo("pricing"); }}
                className={`text-sm font-semibold hover:text-pacific transition-colors ${page === "pricing" ? "text-pacific" : "text-navy/70"}`}
              >
                Pricing
              </a>
              <a
                href="/sales"
                onClick={(e) => { e.preventDefault(); navigateTo("sales"); }}
                className={`text-sm font-semibold hover:text-pacific transition-colors ${page === "sales" ? "text-pacific" : "text-navy/70"}`}
              >
                Sales
              </a>
              <a
                href="/support"
                onClick={(e) => { e.preventDefault(); navigateTo("support"); }}
                className={`text-sm font-semibold hover:text-pacific transition-colors ${page === "support" ? "text-pacific" : "text-navy/70"}`}
              >
                Support
              </a>
              <a
                href="https://smalltech.in/?utm_source=zero&utm_medium=website&utm_campaign=z1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.track('external_link_click', { link_text: 'About', link_url: 'https://smalltech.in/?utm_source=zero&utm_medium=website&utm_campaign=z1', location: 'header' })}
                className="text-sm font-semibold text-navy/70 hover:text-pacific transition-colors"
              >
                About
              </a>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/signup"
                onClick={(e) => { e.preventDefault(); navigateTo("signup"); }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-pacific rounded-full hover:bg-navy hover:shadow-lg hover:shadow-pacific/20 transition-all transform hover:-translate-y-0.5"
              >
                Sign Up for Free
              </a>
            </div>

            {/* Mobile hamburger placeholder */}
            <button className="lg:hidden text-navy">
              <Icon icon="solar:hamburger-menu-linear" width={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="page-content">
        {page === "home" && <HomePage openChatWidget={openChatWidget} />}
        {page === "pricing" && <PricingPage openChatWidget={openChatWidget} />}
        {page === "sales" && <SalesPage openChatWidget={openChatWidget} />}
        {page === "support" && <SupportPage openChatWidget={openChatWidget} />}
        {page === "industry" && (
          <IndustryPage industry={industry} openChatWidget={openChatWidget} />
        )}
        {page === "about" && <AboutPage />}
        {page === "signup" && <SignUpPage />}
      </div>

      {/* Footer */}
      <footer className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Use Zer0 today.</h2>
          <div className="mb-12">
            <a
              href="mailto:zero@smalltech.in"
              className="inline-flex items-center gap-2 text-navy/40 hover:text-sky transition-colors font-medium"
            >
              <Icon icon="solar:letter-linear" width={20} />
              zero@smalltech.in
            </a>
          </div>

          {/* Footer nav links — adds internal linking for SEO */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-12">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo("home"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">Home</a>
            <a href="/pricing" onClick={(e) => { e.preventDefault(); navigateTo("pricing"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">Pricing</a>
            <a href="/sales" onClick={(e) => { e.preventDefault(); navigateTo("sales"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">Sales Agent</a>
            <a href="/support" onClick={(e) => { e.preventDefault(); navigateTo("support"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">Support Agent</a>
            <a href="/industry" onClick={(e) => { e.preventDefault(); navigateTo("industry"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">Industries</a>
            <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo("about"); }} className="text-sm text-white/60 hover:text-white transition-colors font-medium">About</a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/signup"
              onClick={(e) => { e.preventDefault(); navigateTo("signup"); }}
              className="px-8 py-3.5 bg-white text-navy rounded-full font-bold hover:bg-sky/30 transition-all text-sm"
            >
              Sign Up for Free
            </a>
            <a
              href="https://calendly.com/admin-madhyamakist/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.track('external_link_click', { link_text: 'Book a Demo', link_url: 'https://calendly.com/admin-madhyamakist/30min', location: 'footer' })}
              className="px-8 py-3.5 border border-white/20 rounded-full font-bold hover:bg-white/5 transition-all text-sm"
            >
              Book a Demo
            </a>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); navigateTo("home"); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Zer0" width={32} height={32} />
              <span className="text-xl font-bold tracking-tighter">Zer0</span>
            </a>
            <p className="text-white text-sm font-medium">
              &copy; 2026 Zer0. Built for the modern web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
