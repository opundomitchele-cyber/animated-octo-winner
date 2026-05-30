import { useState, useEffect, useRef } from "react";

// ─── PAYSTACK CONFIG ────────────────────────────────────────────────────────
// STEP 1: Replace with your Paystack Public Key from:
//         https://dashboard.paystack.com/#/settings/developer
const PAYSTACK_PUBLIC_KEY = "pk_test_1a955e0cc968ee4da79831054eca398923dc01a5";

// STEP 2: Create 3 recurring plans on Paystack dashboard, then paste codes here:
//         https://dashboard.paystack.com/#/plans
const PLANS = {
  starter: { code: "PLN_n1kro73pot4nrmv", label: "Starter", price: 19, credits: 50,  color: "#666",    unlimited: false },
  pro:     { code: "PLN_bqwjwjhzy84299g", label: "Pro",     price: 49, credits: 999, color: "#E8621A", unlimited: true  },
  agency:  { code: "PLN_bywh5hcbj87gwu2", label: "Agency",  price: 99, credits: 999, color: "#7C3AED", unlimited: true  },
};
// ───────────────────────────────────────────────────────────────────────────

const NICHES = [
  { id: "realestate", label: "Real Estate",    icon: "🏠", color: "#E8621A" },
  { id: "hr",         label: "HR & Recruiting", icon: "👥", color: "#2563EB" },
  { id: "ecommerce",  label: "E-Commerce",     icon: "🛍️", color: "#7C3AED" },
  { id: "legal",      label: "Legal",           icon: "⚖️", color: "#0F766E" },
];

const TEMPLATES = {
  realestate: [
    { id: "listing",   label: "Property Listing",   prompt: "Write a compelling real estate listing description for: " },
    { id: "coldmail",  label: "Cold Outreach Email", prompt: "Write a cold email from a realtor to a potential home seller about: " },
    { id: "socialbio", label: "Agent Bio",           prompt: "Write a professional real estate agent bio for someone who: " },
    { id: "openhouse", label: "Open House Invite",   prompt: "Write an engaging open house invitation for a property that: " },
  ],
  hr: [
    { id: "jobdesc",     label: "Job Description",    prompt: "Write a detailed job description for a role that: " },
    { id: "offerletter", label: "Offer Letter",       prompt: "Write a warm but professional offer letter for a candidate who: " },
    { id: "rejection",   label: "Rejection Email",    prompt: "Write a kind rejection email for a candidate who applied for: " },
    { id: "onboarding",  label: "Onboarding Welcome", prompt: "Write a welcome email for a new employee starting at a company where: " },
  ],
  ecommerce: [
    { id: "productdesc",   label: "Product Description", prompt: "Write a compelling product description for: " },
    { id: "abandonedcart", label: "Abandoned Cart Email", prompt: "Write an abandoned cart recovery email for a store that sells: " },
    { id: "reviewrequest", label: "Review Request",       prompt: "Write a review request email after a customer bought: " },
    { id: "salescopy",     label: "Sales Page Copy",      prompt: "Write persuasive sales page copy for: " },
  ],
  legal: [
    { id: "contractsummary", label: "Contract Summary",   prompt: "Summarize the key points of a contract that covers: " },
    { id: "clientemail",     label: "Client Update Email", prompt: "Write a professional client update email about a case involving: " },
    { id: "disclaimer",      label: "Legal Disclaimer",    prompt: "Write a legal disclaimer for a business that: " },
    { id: "nda",             label: "NDA Overview",        prompt: "Explain in plain language what an NDA should cover for: " },
  ],
};

const NICHE_COLORS = {
  realestate: { accent: "#E8621A" },
  hr:         { accent: "#2563EB" },
  ecommerce:  { accent: "#7C3AED" },
  legal:      { accent: "#0F766E" },
};

// Load Paystack script dynamically
function loadPaystack() {
  return new Promise((resolve) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve(window.PaystackPop);
    document.head.appendChild(script);
  });
}

// ── Paywall Screen ──────────────────────────────────────────────────────────
function Paywall({ onPaid }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError]     = useState("");

  const pay = async (planKey) => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setLoading(planKey);
    const plan = PLANS[planKey];

    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: plan.price * 100,
        currency: "USD",
        plan: plan.code,
        channels: ["card"],
        metadata: { plan: planKey },
        callback: (response) => {
          const userData = {
            email,
            plan: planKey,
            credits: plan.credits,
            unlimited: plan.unlimited,
            ref: response.reference,
            paidAt: new Date().toISOString(),
          };
          localStorage.setItem("writeniche_user", JSON.stringify(userData));
          onPaid(userData);
        },
        onClose: () => setLoading(null),
      });
      handler.openIframe();
    } catch (e) {
      setError("Could not open payment. Please try again.");
      setLoading(null);
    }
  };

  const restoreAccess = () => {
    const saved = localStorage.getItem("writeniche_user");
    if (saved) onPaid(JSON.parse(saved));
    else setError("No active subscription found. Please subscribe below.");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A", color: "#F5F0EB",
      fontFamily: "'Georgia', serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 500 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 36 }}>✍</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-1px", marginTop: 8 }}>WriteNiche</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: 4 }}>
            AI Copy Studio
          </div>
        </div>

        <div style={{
          background: "#0D0D0D", border: "1px solid #1E1E1E",
          borderRadius: 16, padding: "32px 28px",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
            Choose your plan
          </div>
          <div style={{ fontSize: 13, color: "#555", textAlign: "center", marginBottom: 28 }}>
            Get access instantly. Cancel anytime.
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: "#555", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
              Your Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              style={{
                width: "100%", background: "#111", border: "1px solid #222",
                borderRadius: 8, padding: "11px 14px", color: "#D4CFC9",
                fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "#E8621A"}
              onBlur={e => e.target.style.borderColor = "#222"}
            />
            {error && <div style={{ fontSize: 12, color: "#F87171", marginTop: 6 }}>{error}</div>}
          </div>

          {/* Plans */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(PLANS).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => pay(key)}
                disabled={!!loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "15px 16px",
                  background: key === "pro" ? "#161616" : "#111",
                  border: key === "pro" ? `1px solid ${plan.color}44` : "1px solid #1E1E1E",
                  borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s", opacity: loading && loading !== key ? 0.4 : 1,
                  textAlign: "left",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = plan.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = key === "pro" ? `${plan.color}44` : "#1E1E1E"; }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F5F0EB" }}>{plan.label}</span>
                    {key === "pro" && (
                      <span style={{
                        fontSize: 9, background: plan.color, color: "#fff",
                        padding: "2px 7px", borderRadius: 20, letterSpacing: "1px",
                        textTransform: "uppercase", fontFamily: "monospace",
                      }}>Most Popular</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                    {plan.unlimited ? "Unlimited generations/month" : `${plan.credits} generations/month`}
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 60 }}>
                  {loading === key
                    ? <span style={{ fontSize: 20, color: plan.color, animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span>
                    : <>
                        <div style={{ fontSize: 22, fontWeight: 700, color: plan.color }}>${plan.price}</div>
                        <div style={{ fontSize: 10, color: "#444" }}>/month</div>
                      </>
                  }
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "#3A3A3A" }}>
            🔒 Secured by Paystack · Accepts cards globally · Cancel anytime
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#444" }}>
          Already subscribed?{" "}
          <span onClick={restoreAccess} style={{ color: "#E8621A", cursor: "pointer", textDecoration: "underline" }}>
            Restore access
          </span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Upgrade Modal ───────────────────────────────────────────────────────────
function UpgradeModal({ onClose, onUpgrade }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 24,
    }}>
      <div style={{
        background: "#0D0D0D", border: "1px solid #2A2A2A",
        borderRadius: 16, padding: "36px 32px", maxWidth: 380, width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Out of credits</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 28 }}>
          You've used all your generations this month. Upgrade to Pro or Agency for unlimited access.
        </div>
        <button onClick={onUpgrade} style={{
          width: "100%", padding: 14, background: "#E8621A",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10,
        }}>Upgrade Now →</button>
        <button onClick={onClose} style={{
          width: "100%", padding: 12, background: "transparent",
          color: "#555", border: "1px solid #222", borderRadius: 8,
          fontSize: 13, cursor: "pointer",
        }}>Maybe Later</button>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function AIWritingTool() {
  const [user, setUser]                         = useState(null);
  const [selectedNiche, setSelectedNiche]       = useState("realestate");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES.realestate[0]);
  const [userInput, setUserInput]               = useState("");
  const [output, setOutput]                     = useState("");
  const [isLoading, setIsLoading]               = useState(false);
  const [copied, setCopied]                     = useState(false);
  const [wordCount, setWordCount]               = useState(0);
  const [showUpgrade, setShowUpgrade]           = useState(false);
  const outputRef = useRef(null);

  const colors = NICHE_COLORS[selectedNiche];

  useEffect(() => {
    const saved = localStorage.getItem("writeniche_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setSelectedTemplate(TEMPLATES[selectedNiche][0]);
    setOutput(""); setUserInput("");
  }, [selectedNiche]);

  useEffect(() => {
    setWordCount(output ? output.trim().split(/\s+/).filter(Boolean).length : 0);
  }, [output]);

  const handlePaid = (userData) => setUser(userData);

  const logout = () => { localStorage.removeItem("writeniche_user"); setUser(null); };

  const deductCredit = () => {
    if (user.unlimited) return true;
    if (user.credits <= 0) return false;
    const updated = { ...user, credits: user.credits - 1 };
    setUser(updated);
    localStorage.setItem("writeniche_user", JSON.stringify(updated));
    return true;
  };

  const generate = async () => {
    if (!userInput.trim()) return;
    if (!user.unlimited && user.credits <= 0) { setShowUpgrade(true); return; }

    setIsLoading(true); setOutput("");
    if (!deductCredit()) { setIsLoading(false); setShowUpgrade(true); return; }

    const systemPrompt = `You are an expert copywriter specializing in the ${NICHES.find(n => n.id === selectedNiche)?.label} industry. Write professional, compelling, and conversion-focused content. Be specific, engaging, and avoid generic filler phrases. Output only the requested content with no preamble or explanation.`;

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: selectedTemplate.prompt + userInput }],
        }),
      });
      const data = await res.json();
      setOutput(data.content?.map(b => b.text || "").join("") || "Something went wrong.");
    } catch { setOutput("Error generating content. Please try again."); }
    finally   { setIsLoading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <Paywall onPaid={handlePaid} />;

  const planInfo     = PLANS[user.plan] || PLANS.starter;
  const creditsLabel = user.unlimited ? "Unlimited" : `${user.credits} credits`;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Georgia', serif", color: "#F5F0EB" }}>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => { setShowUpgrade(false); logout(); }}
        />
      )}

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1E1E1E", padding: "15px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0D0D0D",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7, background: colors.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "#fff", transition: "background 0.3s",
          }}>✍</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.5px" }}>WriteNiche</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Copy Studio</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            fontSize: 11, padding: "4px 12px", borderRadius: 20,
            color: user.unlimited ? "#4ADE80" : user.credits < 5 ? "#F87171" : "#888",
            border: `1px solid ${user.unlimited ? "#166534" : user.credits < 5 ? "#7F1D1D" : "#2A2A2A"}`,
            background: user.unlimited ? "#052e16" : user.credits < 5 ? "#1c0606" : "transparent",
          }}>
            {planInfo.label} · {creditsLabel}
          </div>
          <div style={{ fontSize: 11, color: "#3A3A3A" }}>{user.email}</div>
          <button onClick={logout} style={{
            background: "transparent", border: "1px solid #222", borderRadius: 6,
            color: "#555", fontSize: 11, padding: "4px 10px", cursor: "pointer",
          }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 63px)" }}>
        {/* Sidebar */}
        <div style={{
          width: 205, borderRight: "1px solid #1A1A1A",
          background: "#0D0D0D", padding: "18px 0", flexShrink: 0, overflowY: "auto",
        }}>
          <div style={{ padding: "0 14px 8px", fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase" }}>Industry</div>
          {NICHES.map(n => (
            <button key={n.id} onClick={() => setSelectedNiche(n.id)} style={{
              width: "100%", textAlign: "left", padding: "9px 16px",
              background: selectedNiche === n.id ? "#161616" : "transparent",
              border: "none", cursor: "pointer",
              color: selectedNiche === n.id ? "#F5F0EB" : "#666",
              fontSize: 13, display: "flex", alignItems: "center", gap: 9,
              borderLeft: selectedNiche === n.id ? `3px solid ${n.color}` : "3px solid transparent",
              transition: "all 0.2s",
            }}><span>{n.icon}</span>{n.label}</button>
          ))}

          <div style={{ padding: "18px 14px 8px", fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase" }}>Templates</div>
          {TEMPLATES[selectedNiche].map(t => (
            <button key={t.id} onClick={() => { setSelectedTemplate(t); setOutput(""); }} style={{
              width: "100%", textAlign: "left", padding: "8px 16px",
              background: selectedTemplate.id === t.id ? "#161616" : "transparent",
              border: "none", cursor: "pointer",
              color: selectedTemplate.id === t.id ? colors.accent : "#555",
              fontSize: 12,
              borderLeft: selectedTemplate.id === t.id ? `3px solid ${colors.accent}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{
            padding: "13px 22px", borderBottom: "1px solid #1A1A1A",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 17 }}>{NICHES.find(n => n.id === selectedNiche)?.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{selectedTemplate.label}</span>
            <span style={{
              marginLeft: "auto", fontSize: 11, color: colors.accent,
              border: `1px solid ${colors.accent}33`, borderRadius: 20,
              padding: "2px 10px", background: `${colors.accent}11`,
            }}>{NICHES.find(n => n.id === selectedNiche)?.label}</span>
          </div>

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Input panel */}
            <div style={{ flex: 1, padding: 22, borderRight: "1px solid #1A1A1A", display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={{ fontSize: 10, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                  Describe your context
                </label>
                <textarea
                  value={userInput} onChange={e => setUserInput(e.target.value)}
                  placeholder="Describe what you need copy for..."
                  style={{
                    width: "100%", minHeight: 130, background: "#111",
                    border: "1px solid #222", borderRadius: 10, padding: "12px 14px",
                    color: "#D4CFC9", fontSize: 14, resize: "vertical",
                    fontFamily: "inherit", lineHeight: 1.6, outline: "none",
                    boxSizing: "border-box", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = colors.accent}
                  onBlur={e => e.target.style.borderColor = "#222"}
                />
              </div>

              <button onClick={generate} disabled={isLoading || !userInput.trim()} style={{
                padding: "12px 22px",
                background: isLoading || !userInput.trim() ? "#1A1A1A" : colors.accent,
                color: isLoading || !userInput.trim() ? "#444" : "#fff",
                border: "none", borderRadius: 10,
                cursor: isLoading || !userInput.trim() ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {isLoading
                  ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> Generating...</>
                  : "✦ Generate Copy"}
              </button>

              <div style={{ background: "#111", border: "1px solid #1A1A1A", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Prompt Preview</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                  <span style={{ color: colors.accent + "99" }}>{selectedTemplate.prompt}</span>
                  <span>{userInput || "..."}</span>
                </div>
              </div>
            </div>

            {/* Output panel */}
            <div style={{ flex: 1, padding: 22, display: "flex", flexDirection: "column", gap: 13 }} ref={outputRef}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 10, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase" }}>Generated Copy</label>
                {output && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#444" }}>{wordCount} words</span>
                    <button onClick={copyToClipboard} style={{
                      padding: "4px 12px",
                      background: copied ? "#166534" : "#161616",
                      color: copied ? "#86EFAC" : "#888",
                      border: `1px solid ${copied ? "#166534" : "#2A2A2A"}`,
                      borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                    }}>{copied ? "✓ Copied" : "Copy"}</button>
                  </div>
                )}
              </div>

              <div style={{
                flex: 1, background: "#111", border: "1px solid #1E1E1E",
                borderRadius: 10, padding: "16px 18px", overflowY: "auto", minHeight: 200,
              }}>
                {isLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                    {[100, 85, 92, 70, 88].map((w, i) => (
                      <div key={i} style={{
                        height: 13, background: "#1A1A1A", borderRadius: 4,
                        width: `${w}%`, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                      }} />
                    ))}
                  </div>
                ) : output ? (
                  <div style={{ fontSize: 14, lineHeight: 1.85, color: "#C8C3BC", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {output}
                  </div>
                ) : (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#333" }}>
                    <div style={{ fontSize: 36 }}>✦</div>
                    <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
                      Your generated copy will appear here.<br />Fill in the context and hit Generate.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D0D0D; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
      `}</style>
    </div>
  );
}
