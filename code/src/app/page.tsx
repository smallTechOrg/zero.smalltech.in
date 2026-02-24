"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";

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

function Icon({
  icon,
  width = 20,
  className = "",
}: {
  icon: string;
  width?: number;
  className?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Elem = "iconify-icon" as any;
  return <Elem icon={icon} width={width} class={className} />;
}

/* ------------------------------------------------------------------ */
/*  Sub-pages                                                          */
/* ------------------------------------------------------------------ */

type PageId = "home" | "pricing" | "sales" | "support" | "about" | "industry";

/* ------------------------------------------------------------------ */
/*  Page: Home                                                         */
/* ------------------------------------------------------------------ */

function HomePage({ openModal }: { openModal: () => void }) {
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
          }, 800);
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
        <span class="text-[10px] font-bold text-slate-900">${contact.name}</span>
        <span class="text-[10px] text-slate-600 truncate">${contact.email}</span>
        <span class="text-[9px] px-2 py-1 bg-green-100 text-green-700 font-black rounded-full text-center">NEW ${contact.source}</span>
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
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left */}
            <div className="w-full lg:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                NEW: SMART AGENTS V2.0
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-black mb-8 leading-[0.95]">
                Embeddable <br />
                Smart Agent
                <br />
                <span className="text-blue-600">For Your Site</span>
              </h1>
              <p className="text-xl text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
                Bring life into your static website by embedding our smart AI
                agent.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <button
                  onClick={openModal}
                  className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20 group transform hover:-translate-y-0.5"
                >
                  <Icon
                    icon="solar:bolt-bold"
                    className="text-white"
                    width={18}
                  />
                  Get Started
                </button>
              </div>
            </div>

            {/* Right — chat mockup */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative bg-white border border-slate-100 rounded-[3rem] p-6 shadow-2xl animate-float">
                <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 h-[450px] flex flex-col">
                  <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    </div>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">
                      zer0-platform.ai
                    </div>
                    <div className="w-4" />
                  </div>
                  <div className="flex-grow p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20" />
                      <div className="space-y-2 flex-grow">
                        <div className="h-2.5 bg-slate-200 rounded-full w-1/2" />
                        <div className="h-2.5 bg-slate-200 rounded-full w-1/3" />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 flex-grow relative">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white text-[11px] font-medium p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                            &quot;How do I setup the AI agent on my Shopify
                            store?&quot;
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-slate-100 text-slate-700 text-[11px] font-medium p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                            &quot;Just copy the 1-line script into your Shopify
                            theme settings. Would you like me to send you the
                            guide?&quot;
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-full">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Bot is typing...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating metric */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 animate-float-delayed hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                      <Icon icon="solar:cup-bold" width={24} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Leads Captured
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        +1,420
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
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              How it works?
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
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
                className="flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon icon={f.icon} width={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Automation CTA with live animation */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-5/12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-white">
                Automation that <br />
                actually works.
              </h2>
              <ul className="space-y-6 text-blue-50 font-semibold text-lg">
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-blue-300"
                    width={24}
                  />
                  Easy to Embed
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-blue-300"
                    width={24}
                  />
                  1000 Free Conversations
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-blue-300"
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
                  <div className="bg-white rounded-2xl shadow-2xl p-4 h-64 flex flex-col border border-slate-100 transform -rotate-1 z-10">
                    <div className="bg-blue-600 rounded-xl p-4 w-11/12 ml-auto text-[11px] text-white font-mono leading-relaxed shadow-lg min-h-[60px]">
                      <span ref={typingRef} />
                      <span className="w-0.5 h-3 bg-white cursor-blink inline-block align-middle ml-1" />
                    </div>
                  </div>
                  {/* CRM card */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 h-64 border border-slate-100 transform rotate-1 overflow-hidden z-10 flex flex-col">
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

function PricingPage({ openModal }: { openModal: () => void }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 text-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Flexible plans for every scale.
        </h2>
        <div className="flex items-center justify-center gap-4 mb-16">
          <span
            className={`text-sm font-bold transition-colors ${yearly ? "text-slate-400" : "text-slate-900"}`}
          >
            Monthly Billing
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={yearly}
              onChange={(e) => setYearly(e.target.checked)}
            />
            <div className="w-14 h-8 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
            <div className="toggle-dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md" />
          </label>
          <span
            className={`text-sm font-bold transition-colors flex items-center gap-2 ${yearly ? "text-slate-900" : "text-slate-400"}`}
          >
            Yearly Billing
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-black">
              SAVE 25%
            </span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 text-left hover:border-blue-200 hover:shadow-xl transition-all flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-4">
                Free Plan
              </h3>
              <div className="text-5xl font-black text-slate-900">Free</div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-blue-600"
                  width={20}
                />
                500 Conversations/mo
              </li>
            </ul>
            <button
              onClick={openModal}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Start Free
            </button>
          </div>

          {/* Basic */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 text-left hover:border-blue-200 hover:shadow-xl transition-all flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-4">
                Basic Plan
              </h3>
              <div className="text-5xl font-black text-slate-900">
                ${yearly ? "3" : "4"}
                <span className="text-lg font-medium text-slate-400">/mo</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-blue-600"
                  width={20}
                />
                2000 Conversations/mo
              </li>
            </ul>
            <button
              onClick={openModal}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Select Basic
            </button>
          </div>

          {/* Pro */}
          <div className="p-10 bg-blue-600 rounded-[2.5rem] text-white text-left shadow-2xl shadow-blue-600/30 transform md:scale-105 flex flex-col relative overflow-hidden">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-blue-100 uppercase tracking-widest mb-4">
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
                Unlimited Conversations/mo
              </li>
            </ul>
            <button
              onClick={openModal}
              className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl"
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

function SalesPage({ openModal }: { openModal: () => void }) {
  return (
    <>
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">
                Sales Intelligence &amp; Revenue Acceleration
              </span>
              <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight">
                AI Lead Generation: Close deals while you sleep.
              </h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                ZER0 identifies high-intent visitors, answers complex pricing
                questions, and books meetings automatically. It&apos;s the AI
                sales assistant that never takes a day off.
              </p>
              <button
                onClick={openModal}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Optimize Sales Funnel
              </button>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="subpage-visual-blob w-full aspect-square flex items-center justify-center p-12">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full border border-blue-50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-20 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
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

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Maximize Conversational Commerce ROI
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
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
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <Icon
                  icon={f.icon}
                  className="text-blue-600 mb-4"
                  width={32}
                />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm">{f.text}</p>
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

function SupportPage({ openModal }: { openModal: () => void }) {
  return (
    <>
      <section className="pt-40 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 text-left">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">
                CX Automation &amp; Support Excellence
              </span>
              <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight">
                Customer Support Automation: Instant answers, 24/7.
              </h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                Reduce resolution times from hours to milliseconds. ZER0&apos;s
                intelligent support agents connect to your documentation to
                resolve complex product queries and technical issues without
                human intervention.
              </p>
              <button
                onClick={openModal}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Scale My Support
              </button>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-indigo-600 rounded-[3rem] p-12 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/40 rounded-full w-1/3" />
                      <div className="h-24 bg-white rounded-2xl p-4 text-xs font-medium text-slate-700 leading-relaxed shadow-lg">
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

      <section className="py-24 bg-slate-50">
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
                className="p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all"
              >
                <div className="text-blue-600 font-black text-3xl mb-2">
                  {s.stat}
                </div>
                <div className="text-slate-900 font-bold mb-1">{s.label}</div>
                <p className="text-slate-500 text-xs">{s.text}</p>
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
  openModal,
}: {
  industry: IndustryKey;
  openModal: () => void;
}) {
  const config = INDUSTRY_CONFIGS[industry] ?? INDUSTRY_CONFIGS["Small Business"];
  return (
    <section className="pt-40 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="lg:w-3/5">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
              <Icon icon={config.icon} width={36} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">
              {config.seoTitle}
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
              {config.seoText}
            </p>
            <button
              onClick={openModal}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Get {industry} Case Study
            </button>
          </div>
          <div className="lg:w-2/5">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-float">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Industry-Specific AI
              </h3>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-4">
                <h4 className="font-bold text-blue-700 mb-2">
                  {config.feature}
                </h4>
                <p className="text-blue-900/60 text-sm leading-relaxed">
                  {config.desc}
                </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-green-500"
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
        <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">
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
              className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className="text-4xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                {s.v}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
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

export default function Home() {
  const [page, setPage] = useState<PageId>("home");
  const [industry, setIndustry] = useState<IndustryKey>("Small Business");
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const navigateTo = useCallback(
    (id: PageId, industryParam?: IndustryKey) => {
      if (id === "industry" && industryParam) setIndustry(industryParam);
      setPage(id);
      window.scrollTo(0, 0);
    },
    []
  );

  return (
    <div className="bg-white text-slate-500 antialiased selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      {/* Iconify web component */}
      <Script
        src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
        strategy="beforeInteractive"
      />

      {/* Lead Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <Icon icon="solar:close-circle-linear" width={28} />
            </button>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Get Started with ZER0
            </h3>
            <p className="text-slate-500 mb-6">
              Enter your details and our team will reach out to help you set up
              your smart agent.
            </p>
            <iframe
              src="https://form.typeform.com/to/VJB22RPe"
              frameBorder="0"
              width="100%"
              height="400px"
              style={{ borderRadius: "1rem" }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 top-0 glass-panel">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
              onClick={() => navigateTo("home")}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-600/20">
                <Icon icon="solar:chat-round-dots-linear" width={22} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-slate-900">
                ZER0
              </span>
            </div>

            {/* Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => navigateTo("pricing")}
                className={`text-sm font-semibold hover:text-blue-600 transition-colors ${page === "pricing" ? "text-blue-600" : "text-slate-600"}`}
              >
                Pricing
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://smalltech.in/?utm_source=zero&utm_medium=website&utm_campaign=z1",
                    "_blank"
                  )
                }
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                About
              </button>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={openModal}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>

            {/* Mobile hamburger placeholder */}
            <button className="lg:hidden text-slate-900">
              <Icon icon="solar:hamburger-menu-linear" width={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="page-content">
        {page === "home" && <HomePage openModal={openModal} />}
        {page === "pricing" && <PricingPage openModal={openModal} />}
        {page === "sales" && <SalesPage openModal={openModal} />}
        {page === "support" && <SupportPage openModal={openModal} />}
        {page === "industry" && (
          <IndustryPage industry={industry} openModal={openModal} />
        )}
        {page === "about" && <AboutPage />}
      </div>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join ZER0 today.</h2>
          <div className="mb-12">
            <a
              href="mailto:zero@smalltech.in"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors font-medium"
            >
              <Icon icon="solar:letter-linear" width={20} />
              zero@smalltech.in
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={openModal}
              className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all text-sm"
            >
              Get Started
            </button>
            <a
              href="https://calendly.com/admin-madhyamakist/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-8 py-3.5 border border-white/20 rounded-full font-bold hover:bg-white/5 transition-all text-sm">
                Book a Demo
              </button>
            </a>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigateTo("home")}
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                <Icon icon="solar:chat-round-dots-linear" width={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter">ZER0</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              &copy; 2026 ZER0. Built for the modern web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
