import { useState, useEffect, useRef } from "react";

const NICHES = [
  { id: "realestate", label: "Real Estate", icon: "🏠", color: "#E8621A" },
  { id: "hr", label: "HR & Recruiting", icon: "👥", color: "#2563EB" },
  { id: "ecommerce", label: "E-Commerce", icon: "🛍️", color: "#7C3AED" },
  { id: "legal", label: "Legal", icon: "⚖️", color: "#0F766E" },
];

const TEMPLATES = {
  realestate: [
    { id: "listing", label: "Property Listing", prompt: "Write a compelling real estate listing description for: " },
    { id: "coldmail", label: "Cold Outreach Email", prompt: "Write a cold email from a realtor to a potential home seller about: " },
    { id: "socialbio", label: "Agent Bio", prompt: "Write a professional real estate agent bio for someone who: " },
    { id: "openhouse", label: "Open House Invite", prompt: "Write an engaging open house invitation for a property that: " },
  ],
  hr: [
    { id: "jobdesc", label: "Job Description", prompt: "Write a detailed job description for a role that: " },
    { id: "offerletter", label: "Offer Letter", prompt: "Write a warm but professional offer letter for a candidate who: " },
    { id: "rejection", label: "Rejection Email", prompt: "Write a kind rejection email for a candidate who applied for: " },
    { id: "onboarding", label: "Onboarding Welcome", prompt: "Write a welcome email for a new employee starting at a company where: " },
  ],
  ecommerce: [
    { id: "productdesc", label: "Product Description", prompt: "Write a compelling product description for: " },
    { id: "abandonedcart", label: "Abandoned Cart Email", prompt: "Write an abandoned cart recovery email for a store that sells: " },
    { id: "reviewrequest", label: "Review Request", prompt: "Write a review request email after a customer bought: " },
    { id: "salescopy", label: "Sales Page Copy", prompt: "Write persuasive sales page copy for: " },
  ],
  legal: [
    { id: "contractsummary", label: "Contract Summary", prompt: "Summarize the key points of a contract that covers: " },
    { id: "clientemail", label: "Client Update Email", prompt: "Write a professional client update email about a case involving: " },
    { id: "disclaimer", label: "Legal Disclaimer", prompt: "Write a legal disclaimer for a business that: " },
    { id: "nda", label: "NDA Overview", prompt: "Explain in plain language what an NDA should cover for: " },
  ],
};

const NICHE_COLORS = {
  realestate: { bg: "#FFF7F0", accent: "#E8621A", dark: "#7C2D00" },
  hr: { bg: "#EFF6FF", accent: "#2563EB", dark: "#1E3A8A" },
  ecommerce: { bg: "#F5F3FF", accent: "#7C3AED", dark: "#3B0764" },
  legal: { bg: "#F0FDFA", accent: "#0F766E", dark: "#134E4A" },
};

export default function AIWritingTool() {
  const [selectedNiche, setSelectedNiche] = useState("realestate");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES.realestate[0]);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const outputRef = useRef(null);

  const colors = NICHE_COLORS[selectedNiche];

  useEffect(() => {
    setSelectedTemplate(TEMPLATES[selectedNiche][0]);
    setOutput("");
    setUserInput("");
  }, [selectedNiche]);

  useEffect(() => {
    if (output) {
      const words = output.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [output]);

  const generate = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setOutput("");

    const fullPrompt = selectedTemplate.prompt + userInput;
    const systemPrompt = `You are an expert copywriter specializing in the ${NICHES.find(n => n.id === selectedNiche)?.label} industry. Write professional, compelling, and conversion-focused content. Be specific, engaging, and avoid generic filler phrases. Output only the requested content with no preamble or explanation.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: fullPrompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";
      setOutput(text);
    } catch (err) {
      setOutput("Error generating content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      fontFamily: "'Georgia', serif",
      color: "#F5F0EB",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1E1E1E",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0D0D0D",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: colors.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: "bold", color: "#fff",
            transition: "background 0.3s",
          }}>✍</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#F5F0EB" }}>WriteNiche</div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Copy Studio</div>
          </div>
        </div>
        <div style={{
          fontSize: 12, color: "#555", border: "1px solid #222",
          borderRadius: 20, padding: "4px 12px",
        }}>Pro Plan · 47 credits left</div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 73px)" }}>
        {/* Sidebar */}
        <div style={{
          width: 220, borderRight: "1px solid #1A1A1A",
          background: "#0D0D0D", padding: "24px 0", flexShrink: 0,
          overflowY: "auto",
        }}>
          <div style={{ padding: "0 16px 12px", fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase" }}>
            Industry
          </div>
          {NICHES.map(niche => (
            <button key={niche.id} onClick={() => setSelectedNiche(niche.id)} style={{
              width: "100%", textAlign: "left", padding: "10px 20px",
              background: selectedNiche === niche.id ? "#161616" : "transparent",
              border: "none", cursor: "pointer", color: selectedNiche === niche.id ? "#F5F0EB" : "#666",
              fontSize: 14, display: "flex", alignItems: "center", gap: 10,
              borderLeft: selectedNiche === niche.id ? `3px solid ${niche.color}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 16 }}>{niche.icon}</span>
              {niche.label}
            </button>
          ))}

          <div style={{ padding: "24px 16px 12px", fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase" }}>
            Templates
          </div>
          {TEMPLATES[selectedNiche].map(t => (
            <button key={t.id} onClick={() => { setSelectedTemplate(t); setOutput(""); }} style={{
              width: "100%", textAlign: "left", padding: "9px 20px",
              background: selectedTemplate.id === t.id ? "#161616" : "transparent",
              border: "none", cursor: "pointer",
              color: selectedTemplate.id === t.id ? colors.accent : "#555",
              fontSize: 13, borderLeft: selectedTemplate.id === t.id ? `3px solid ${colors.accent}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top bar */}
          <div style={{
            padding: "16px 28px", borderBottom: "1px solid #1A1A1A",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{NICHES.find(n => n.id === selectedNiche)?.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{selectedTemplate.label}</span>
            <span style={{
              marginLeft: "auto", fontSize: 11, color: colors.accent,
              border: `1px solid ${colors.accent}33`, borderRadius: 20,
              padding: "2px 10px", background: `${colors.accent}11`,
            }}>
              {NICHES.find(n => n.id === selectedNiche)?.label}
            </span>
          </div>

          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Input panel */}
            <div style={{ flex: 1, padding: 28, borderRight: "1px solid #1A1A1A", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Describe your context
                </label>
                <textarea
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder={`e.g. ${selectedNiche === "realestate" ? "a 3-bed beachfront condo in Miami with ocean views and modern kitchen" : selectedNiche === "hr" ? "a senior product designer at a tech startup, 5+ years experience required" : selectedNiche === "ecommerce" ? "a handmade leather wallet with RFID blocking and minimalist design" : "a 2-year non-disclosure agreement between two software startups"}`}
                  style={{
                    width: "100%", minHeight: 140, background: "#111",
                    border: "1px solid #222", borderRadius: 10, padding: "14px 16px",
                    color: "#D4CFC9", fontSize: 14, resize: "vertical",
                    fontFamily: "inherit", lineHeight: 1.6,
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = colors.accent}
                  onBlur={e => e.target.style.borderColor = "#222"}
                />
              </div>

              <button
                onClick={generate}
                disabled={isLoading || !userInput.trim()}
                style={{
                  padding: "13px 24px", background: isLoading || !userInput.trim() ? "#1A1A1A" : colors.accent,
                  color: isLoading || !userInput.trim() ? "#444" : "#fff",
                  border: "none", borderRadius: 10, cursor: isLoading || !userInput.trim() ? "not-allowed" : "pointer",
                  fontSize: 14, fontWeight: 600, letterSpacing: "0.3px",
                  transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span>
                    Generating...
                  </>
                ) : "✦ Generate Copy"}
              </button>

              {/* Prompt preview */}
              <div style={{
                background: "#111", border: "1px solid #1A1A1A", borderRadius: 8,
                padding: "12px 14px",
              }}>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Prompt Preview</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                  <span style={{ color: colors.accent + "99" }}>{selectedTemplate.prompt}</span>
                  <span>{userInput || "..."}</span>
                </div>
              </div>
            </div>

            {/* Output panel */}
            <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column", gap: 16 }} ref={outputRef}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 11, color: "#555", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Generated Copy
                </label>
                {output && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#444" }}>{wordCount} words</span>
                    <button onClick={copyToClipboard} style={{
                      padding: "4px 12px", background: copied ? "#166534" : "#161616",
                      color: copied ? "#86EFAC" : "#888", border: `1px solid ${copied ? "#166534" : "#2A2A2A"}`,
                      borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                    }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              <div style={{
                flex: 1, background: "#111", border: "1px solid #1E1E1E",
                borderRadius: 10, padding: "18px 20px", overflowY: "auto",
                minHeight: 200,
              }}>
                {isLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                    {[100, 85, 92, 70, 88].map((w, i) => (
                      <div key={i} style={{
                        height: 14, background: "#1A1A1A", borderRadius: 4,
                        width: `${w}%`, animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                      }} />
                    ))}
                  </div>
                ) : output ? (
                  <div style={{
                    fontSize: 14, lineHeight: 1.85, color: "#C8C3BC",
                    whiteSpace: "pre-wrap", fontFamily: "inherit",
                  }}>
                    {output}
                  </div>
                ) : (
                  <div style={{
                    height: "100%", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 12, color: "#333",
                  }}>
                    <div style={{ fontSize: 40 }}>✦</div>
                    <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
                      Your generated copy will appear here.<br />
                      Fill in the context and hit Generate.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D0D0D; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }
      `}</style>
    </div>
  );
}
