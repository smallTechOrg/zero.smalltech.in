"use client";

import { useState } from "react";
import Icon from "@/components/common/icon";

type ContactMethod = "email" | "phone";
type SignUpStep = "form" | "done";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const PRESET_COLOURS = [
  "#219EBC",
  "#023047",
  "#FB8500",
  "#FFB703",
  "#E63946",
  "#2D6A4F",
  "#7209B7",
  "#000000",
];

export default function SignUpPage() {
  const [step, setStep] = useState<SignUpStep>("form");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [colour, setColour] = useState("#219EBC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedScript, setEmbedScript] = useState("");
  const [copied, setCopied] = useState(false);

  const isFormValid =
    name.trim() !== "" &&
    website.trim() !== "" &&
    (contactMethod === "email" ? email.trim() !== "" : phone.trim() !== "");

  /* ---------------------------------------------------------------- */
  /*  Submit handler                                                   */
  /* ---------------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Register the domain
      const domainRes = await fetch(`${API_URL}/domains/`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website_url: website.trim() }),
      });
      if (!domainRes.ok)
        throw new Error("Failed to register domain. Please try again.");
      const domainData = await domainRes.json();
      const sessionId = domainData.session_id || domainData.id || "";

      // 2. Save custom prompt (company description)
      if (customPrompt.trim()) {
        const promptRes = await fetch(`${API_URL}/prompt`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: new URL(
              website.trim().startsWith("http")
                ? website.trim()
                : `https://${website.trim()}`
            ).hostname,
            agent_type: "sales",
            type: "company",
            text: customPrompt.trim(),
          }),
        });
        if (!promptRes.ok) console.warn("Prompt save failed, continuing...");
      }

      // 3. Save contact info
      if (sessionId) {
        const contactBody: Record<string, string> = {
          session_id: sessionId,
          name: name.trim(),
        };
        if (contactMethod === "email") contactBody.email = email.trim();
        else contactBody.mobile = phone.trim();

        await fetch(`${API_URL}/chat-info/contact`, {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactBody),
        });
      }

      // 4. Build the embed script tag
      const scriptTag = `<script\n  src="https://zero.smalltech.in/embed.js"\n  data-chat-url="https://zero.smalltech.in/embed"\n  data-colour="${colour}"\n  data-tagline="Chat with us"\n  defer\n><\/script>`;
      setEmbedScript(scriptTag);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Clipboard                                                        */
  /* ---------------------------------------------------------------- */
  function copyToClipboard() {
    navigator.clipboard
      .writeText(embedScript.replace("<\\/script>", "</script>"))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  }

  /* ---------------------------------------------------------------- */
  /*  Step: Done                                                       */
  /* ---------------------------------------------------------------- */
  if (step === "done") {
    return (
      <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-pacific/10 rounded-full flex items-center justify-center">
            <Icon
              icon="solar:check-circle-bold"
              width={48}
              className="text-pacific"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
            You&apos;re all set!
          </h2>
          <p className="text-navy/60 mb-10 text-lg">
            Copy the script below and paste it into your website&apos;s HTML,
            just before the closing{" "}
            <code className="bg-sky/20 px-1.5 py-0.5 rounded text-sm font-mono">
              &lt;/body&gt;
            </code>{" "}
            tag.
          </p>

          <div className="relative text-left">
            <pre className="bg-navy text-sky p-6 rounded-2xl text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {embedScript.replace("<\\/script>", "</script>")}
            </pre>
            <button
              onClick={copyToClipboard}
              className="cursor-pointer absolute top-4 right-4 px-4 py-2 text-xs font-bold rounded-lg transition-all bg-white/10 text-white hover:bg-white/20"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Live preview */}
          <div className="mt-12">
            <h3 className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-4">
              Preview
            </h3>
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg"
              style={{ background: colour }}
            >
              <span className="text-2xl">💬</span>
              <span className="text-white font-bold text-sm">Chat with us</span>
            </div>
          </div>

          <button
            onClick={() => {
              setStep("form");
              setEmbedScript("");
            }}
            className="cursor-pointer mt-10 text-sm font-bold text-pacific hover:underline"
          >
            &larr; Start over
          </button>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step: Form                                                       */
  /* ---------------------------------------------------------------- */
  return (
    <section className="pt-40 pb-20 lg:pt-56 lg:pb-32 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-sky/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-pacific/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-4 tracking-tight">
            Sign Up for Free
          </h2>
          <p className="text-navy/60 text-lg">
            Get your AI chat agent running on your website in under 2 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label
              htmlFor="su-name"
              className="block text-sm font-bold text-navy mb-2"
            >
              Your Name
            </label>
            <input
              id="su-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="su-website"
              className="block text-sm font-bold text-navy mb-2"
            >
              Website URL
            </label>
            <input
              id="su-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Contact Method Toggle */}
          <div>
            <label className="block text-sm font-bold text-navy mb-3">
              Contact Method
            </label>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setContactMethod("email")}
                className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  contactMethod === "email"
                    ? "bg-pacific text-white shadow-md shadow-pacific/20"
                    : "bg-sky/20 text-navy/60 hover:bg-sky/30"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactMethod("phone")}
                className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  contactMethod === "phone"
                    ? "bg-pacific text-white shadow-md shadow-pacific/20"
                    : "bg-sky/20 text-navy/60 hover:bg-sky/30"
                }`}
              >
                Phone
              </button>
            </div>
            {contactMethod === "email" ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all text-sm font-medium"
                required
              />
            ) : (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all text-sm font-medium"
                required
              />
            )}
          </div>

          {/* Custom Prompt */}
          <div>
            <label
              htmlFor="su-prompt"
              className="block text-sm font-bold text-navy mb-2"
            >
              Custom Prompt{" "}
              <span className="font-normal text-navy/40">
                (company description — the more details you provide, the smarter we will be)
              </span>
            </label>
            <textarea
              id="su-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="My company is a SaaS startup that provides AI-powered analytics tools for e-commerce businesses. We help online retailers optimize their sales and marketing strategies using data-driven insights. Our target audience is small to ...."
              rows={3}
              className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Colour Picker */}
          <div>
            <label className="block text-sm font-bold text-navy mb-3">
              Widget Colour
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-14 h-14 rounded-xl border-2 border-sky/50 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-sky/50 bg-white text-navy font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pacific/40 focus:border-pacific transition-all"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              {/* Preview bubble */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shrink-0"
                style={{ background: colour }}
              >
                💬
              </div>
            </div>
            {/* Preset swatches */}
            <div className="flex gap-2 mt-3">
              {PRESET_COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  className={`cursor-pointer w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    colour === c
                      ? "border-navy scale-110 shadow-md"
                      : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`cursor-pointer w-full py-4 rounded-xl font-bold text-white text-sm transition-all ${
              isFormValid && !isSubmitting
                ? "bg-pacific hover:bg-navy hover:shadow-lg hover:shadow-pacific/20 transform hover:-translate-y-0.5"
                : "bg-navy/20 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Setting up your agent...
              </span>
            ) : (
              "Get My Embed Script"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
