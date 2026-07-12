import React, { useState, useRef, useEffect } from "react";

// --- DESIGN TOKENS & STYLES ---
const C = {
  bg: "#F8FAFC", white: "#FFFFFF",
  primary: "#0F172A", primaryLight: "#E2E8F0",
  accent: "#3B82F6", accentLight: "#DBEAFE",
  warning: "#FFF7ED", warningText: "#C2410C",
  success: "#F0FDF4", successText: "#15803D",
  gray: "#64748B", grayLight: "#CBD5E1",
};

const inputStyle = {
  border: "none", borderBottom: "2px dashed #3B82F6",
  background: "transparent", color: "#0F172A",
  fontWeight: "bold", outline: "none",
  width: "100%", margin: "5px 0 10px 0",
  fontSize: 14, paddingBottom: 4
};

const btnStyle = {
  background: "#3B82F6", color: "#FFF",
  border: "none", padding: "10px", borderRadius: 8,
  width: "100%", marginTop: 10, cursor: "pointer", fontWeight: "bold",
  transition: "0.2s"
};

// --- QUESTION & SUGGESTION BANKS ---
const EMPATHY_BANK = [
  "I hear you. What part of this feels the most difficult to manage right now?",
  "Take a deep breath. How has this stress been affecting your daily routine?",
  "It's okay to feel overwhelmed. What support systems do you have around you right now?",
  "Let's tackle it one step at a time. What’s the very next thing on your mind?",
  "When you look back at how things unfolded over the last few months, what feels like the turning point?"
];

const FINANCE_BANK = [
  "To help structure a plan, could you tell me your approximate current monthly income?",
  "Let's look at the numbers. What are your essential fixed expenses for the next 30 days?",
  "Are there any upcoming bills or deadlines this week you are worried about missing?",
  "Do you have any emergency savings set aside that we could factor in?",
  "Did your income or expenses change drastically at a specific point recently?"
];

const SUGGESTION_BANK = [
  "Based on what you shared, I highly recommend mapping out a 'bare bones' budget today—suspending all automated non-essential payments. How feasible does this feel for you right now?",
  "A good immediate step is to call your service providers and request a 30-day hardship forbearance. Many offer this no-questions-asked. Would you feel comfortable making those calls today?",
  "I suggest we temporarily focus strictly on protecting your cash flow for immediate housing and food. What are your thoughts on prioritizing cash flow over credit scores temporarily?"
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Simulated user timeline events that the AI "extracts" throughout the chat
const MOCK_TIMELINE_EVENTS = [
  { period: "3-6 months ago", event: "Initial shift in income or an unexpected expense occurred." },
  { period: "1 month ago", event: "Started falling behind on standard billing cycles and minimum payments." },
  { period: "Today", event: "Seeking immediate triage for cash flow, housing, and food security." },
  { period: "Next 30 Days", event: "Need to negotiate extensions and pause automated withdrawals." }
];


// --- INTERACTIVE SUB-COMPONENTS ---

// 1. Drag & Drop Categorization Widget
const CategorizeBubble = ({ onConfirm }) => {
  const [pool, setPool] = useState(["Making next month's rent", "Inflation / Grocery prices", "Finding a new job", "Cutting my daily expenses"]);
  const [control, setControl] = useState([]);
  const [noControl, setNoControl] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const handleDragStart = (e, item, source) => {
    e.dataTransfer.setData("item", item);
    e.dataTransfer.setData("source", source);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const item = e.dataTransfer.getData("item");
    const source = e.dataTransfer.getData("source");
    if (source === target || confirmed) return;

    if (source === "pool") setPool(p => p.filter(i => i !== item));
    if (source === "control") setControl(c => c.filter(i => i !== item));
    if (source === "noControl") setNoControl(n => n.filter(i => i !== item));

    if (target === "pool") setPool(p => [...p, item]);
    if (target === "control") setControl(c => [...c, item]);
    if (target === "noControl") setNoControl(n => [...n, item]);
  };

  const Card = ({ item, source }) => (
    <div 
      draggable={!confirmed}
      onDragStart={(e) => handleDragStart(e, item, source)}
      style={{ background: C.white, padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.grayLight}`, fontSize: 13, cursor: confirmed ? "default" : "grab", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: 8 }}
    >
      ⠿ {item}
    </div>
  );

  return (
    <div style={{ alignSelf: "flex-start", background: C.white, border: `1px solid ${C.grayLight}`, padding: 15, borderRadius: "15px 15px 15px 0", maxWidth: "95%", width: "100%" }}>
      <p style={{ marginBottom: 15, fontSize: 14 }}>I've extracted some key concerns you've mentioned. Let's organize them. <b>Drag and drop them into the zones below:</b></p>
      
      <div style={{ opacity: confirmed ? 0.6 : 1, transition: "0.3s" }}>
        {pool.length > 0 && (
          <div onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, "pool")} style={{ minHeight: 40, background: C.primaryLight, padding: 10, borderRadius: 8, marginBottom: 15 }}>
            {pool.map(item => <Card key={item} item={item} source="pool" />)}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <div onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, "control")} style={{ flex: 1, minHeight: 120, border: `2px dashed ${C.grayLight}`, background: C.bg, borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 10, textAlign: "center" }}>In My Control</div>
            {control.map(item => <Card key={item} item={item} source="control" />)}
          </div>
          <div onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, "noControl")} style={{ flex: 1, minHeight: 120, border: `2px dashed ${C.grayLight}`, background: C.bg, borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 10, textAlign: "center" }}>Out of My Control</div>
            {noControl.map(item => <Card key={item} item={item} source="noControl" />)}
          </div>
        </div>
      </div>

      {!confirmed && pool.length === 0 && (
        <button onClick={() => { setConfirmed(true); onConfirm(); }} style={btnStyle}>Confirm Zones &rarr;</button>
      )}
    </div>
  );
};

// 2. Ranking Widget
const RankBubble = ({ onConfirm }) => {
  const [items, setItems] = useState(["Address Credit Card Minimums", "Secure Grocery Budget", "Negotiate Rent Extension"]);
  const [confirmed, setConfirmed] = useState(false);

  const move = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= items.length) return;
    const newItems = [...items];
    const temp = newItems[idx];
    newItems[idx] = newItems[idx + dir];
    newItems[idx + dir] = temp;
    setItems(newItems);
  };

  return (
    <div style={{ alignSelf: "flex-start", background: C.white, border: `1px solid ${C.grayLight}`, padding: 15, borderRadius: "15px 15px 15px 0", maxWidth: "95%", width: "100%" }}>
      <p style={{ marginBottom: 10, fontSize: 14 }}>Based on what we've established, please <b>rank these action items</b> from most urgent (Top) to least urgent (Bottom):</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: confirmed ? 0.6 : 1, transition: "0.3s" }}>
        {items.map((opt, i) => (
          <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, border: `1px solid ${C.grayLight}`, padding: "8px 12px", borderRadius: 8 }}>
            <div style={{ fontWeight: "bold", color: C.accent, width: 20 }}>{i + 1}.</div>
            <div style={{ flex: 1, fontSize: 14 }}>{opt}</div>
            {!confirmed && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ border: "none", background: i===0?"transparent":C.primaryLight, borderRadius: 4, cursor: i===0?"default":"pointer", width: 24, height: 20 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length-1} style={{ border: "none", background: i===items.length-1?"transparent":C.primaryLight, borderRadius: 4, cursor: i===items.length-1?"default":"pointer", width: 24, height: 20 }}>▼</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!confirmed && <button onClick={() => { setConfirmed(true); onConfirm(); }} style={btnStyle}>Confirm Ranking &rarr;</button>}
    </div>
  );
};

// 3. Autofill Template
const AutofillBubble = ({ variation, onConfirm }) => {
  const [v0, setV0] = useState(["my financial situation", "I will fall behind", "the end of the month"]);
  const [v1, setV1] = useState(["mounting bills", "inconsistent", "higher than normal"]);
  const [v2, setV2] = useState(["avoiding eviction", "this month's rent", "taking out a bad loan"]);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ alignSelf: "flex-start", background: C.white, border: `1px solid ${C.grayLight}`, padding: 15, borderRadius: "15px 15px 15px 0", maxWidth: "95%" }}>
      <p style={{ marginBottom: 10, fontSize: 14 }}>I've filled in what I understand so far—can you edit the blanks to make sure I have this right?</p>
      <div style={{ background: C.accentLight, padding: 15, borderRadius: 10, color: C.primary, lineHeight: "1.6", opacity: confirmed ? 0.6 : 1, transition: "0.3s" }}>
        {variation === 0 && (
          <>
            "The main source of my stress right now is <input disabled={confirmed} value={v0[0]} onChange={e=>setV0([e.target.value, v0[1], v0[2]])} style={inputStyle} />, because I am afraid that <input disabled={confirmed} value={v0[1]} onChange={e=>setV0([v0[0], e.target.value, v0[2]])} style={inputStyle} /> will happen by <input disabled={confirmed} value={v0[2]} onChange={e=>setV0([v0[0], v0[1], e.target.value])} style={inputStyle} />."
          </>
        )}
        {variation === 1 && (
          <>
            "I am feeling overwhelmed by <input disabled={confirmed} value={v1[0]} onChange={e=>setV1([e.target.value, v1[1], v1[2]])} style={inputStyle} />, especially since my income is currently <input disabled={confirmed} value={v1[1]} onChange={e=>setV1([v1[0], e.target.value, v1[2]])} style={inputStyle} /> and my expenses feel <input disabled={confirmed} value={v1[2]} onChange={e=>setV1([v1[0], v1[1], e.target.value])} style={inputStyle} />."
          </>
        )}
        {variation === 2 && (
          <>
            "Right now, my top financial priority is <input disabled={confirmed} value={v2[0]} onChange={e=>setV2([e.target.value, v2[1], v2[2]])} style={inputStyle} />, but I don't know how to handle <input disabled={confirmed} value={v2[1]} onChange={e=>setV2([v2[0], e.target.value, v2[2]])} style={inputStyle} /> without <input disabled={confirmed} value={v2[2]} onChange={e=>setV2([v2[0], v2[1], e.target.value])} style={inputStyle} />."
          </>
        )}
        {!confirmed && <button onClick={() => { setConfirmed(true); onConfirm(); }} style={btnStyle}>Looks correct &rarr;</button>}
      </div>
    </div>
  );
};

// 4. Editable Hypothesis Bubble (Checkboxes & Editable Text, No Strikethroughs)
const HypothesisBubble = ({ variation, onConfirm }) => {
  const options = [
    ["My income or expenses recently shifted.", "I am dealing with unexpected compounding costs.", "My housing costs recently increased."],
    ["I am currently supporting family members.", "High interest rates are making debt unmanageable.", "I do not have access to an emergency fund."],
    ["I have anxiety about potential job loss.", "There is an upcoming large bill I am dreading.", "I am worried about long-term credit score damage."]
  ][variation || 0];

  const [h1, setH1] = useState(options[0]);
  const [h2, setH2] = useState(options[1]);
  const [h3, setH3] = useState(options[2]);
  
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    const confirmedHypos = [];
    if (c1 && h1.trim() !== "") confirmedHypos.push(h1);
    if (c2 && h2.trim() !== "") confirmedHypos.push(h2);
    if (c3 && h3.trim() !== "") confirmedHypos.push(h3);
    onConfirm(confirmedHypos.length > 0 ? `Hypotheses True: ${confirmedHypos.join(" | ")}` : "All hypotheses marked false or removed.");
  };

  return (
    <div style={{ alignSelf: "flex-start", background: C.white, border: `1px solid ${C.grayLight}`, padding: 15, borderRadius: "15px 15px 15px 0", maxWidth: "95%" }}>
      <p style={{ marginBottom: 10, fontSize: 14 }}>I'm hypothesizing a few underlying conditions. Feel free to edit or uncheck any that aren't accurate:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: confirmed ? 0.6 : 1, transition: "0.3s" }}>
        
        <div style={{ display: "flex", alignItems: "center", background: C.primaryLight, padding: "8px 10px", borderRadius: 8 }}>
          <input type="checkbox" disabled={confirmed} checked={c1} onChange={e=>setC1(e.target.checked)} style={{ width: 18, height: 18, marginRight: 10, flexShrink: 0 }} />
          <input disabled={confirmed} value={h1} onChange={e=>setH1(e.target.value)} style={{ ...inputStyle, margin: 0, padding: 0, border: "none", opacity: c1 ? 1 : 0.5 }} placeholder="Clear to ignore..." />
        </div>

        <div style={{ display: "flex", alignItems: "center", background: C.primaryLight, padding: "8px 10px", borderRadius: 8 }}>
          <input type="checkbox" disabled={confirmed} checked={c2} onChange={e=>setC2(e.target.checked)} style={{ width: 18, height: 18, marginRight: 10, flexShrink: 0 }} />
          <input disabled={confirmed} value={h2} onChange={e=>setH2(e.target.value)} style={{ ...inputStyle, margin: 0, padding: 0, border: "none", opacity: c2 ? 1 : 0.5 }} placeholder="Clear to ignore..." />
        </div>

        <div style={{ display: "flex", alignItems: "center", background: C.primaryLight, padding: "8px 10px", borderRadius: 8 }}>
          <input type="checkbox" disabled={confirmed} checked={c3} onChange={e=>setC3(e.target.checked)} style={{ width: 18, height: 18, marginRight: 10, flexShrink: 0 }} />
          <input disabled={confirmed} value={h3} onChange={e=>setH3(e.target.value)} style={{ ...inputStyle, margin: 0, padding: 0, border: "none", opacity: c3 ? 1 : 0.5 }} placeholder="Clear to ignore..." />
        </div>

      </div>
      {!confirmed && <button onClick={handleConfirm} style={{ ...btnStyle, background: C.primary }}>Confirm Context &rarr;</button>}
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", type: "text", content: "I'm here for you. What's on your mind right now? Feel free to just let it all out." }
  ]);
  const [inputText, setInputText] = useState("");
  
  // App Logic State
  const [textCounter, setTextCounter] = useState(0); 
  const [widgetSequence, setWidgetSequence] = useState(["categorize", "rank", "autofill", "hypothesis"]);
  const [widgetIndex, setWidgetIndex] = useState(0);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  
  // Overlay & Timeline State
  const [financialTimeline, setFinancialTimeline] = useState([]); 
  const [timelineIndex, setTimelineIndex] = useState(0);

  const [isFrantic, setIsFrantic] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HANDLERS ---
  const handleTyping = (e) => {
    const text = e.target.value;
    setInputText(text);
    if (text.length > 40 && !isFrantic) setIsFrantic(true);
    else if (text.length <= 40 && isFrantic) setIsFrantic(false);
  };

  // Helper to progress the AI chat flow
  const progressAIFlow = () => {
    // Populate financial timeline implicitly behind the scenes
    if (timelineIndex < MOCK_TIMELINE_EVENTS.length) {
      setFinancialTimeline(prev => [...prev, MOCK_TIMELINE_EVENTS[timelineIndex]]);
      setTimelineIndex(prev => prev + 1);
    }

    const newCounter = textCounter + 1;

    setTimeout(() => {
      // REQUIRE AT LEAST 2 TEXT EXCHANGES BEFORE A WIDGET
      if (newCounter < 2) {
        setTextCounter(newCounter);
        const replyType = newCounter % 2 === 1 ? EMPATHY_BANK : FINANCE_BANK;
        setMessages(prev => [...prev, { id: Date.now()+1, sender: "ai", type: "text", content: getRandom(replyType) }]);
      } else {
        // TIME FOR A WIDGET
        setTextCounter(0); 
        setIsInputDisabled(true); // Lock text input until widget is completed/skipped
        const nextWidget = widgetSequence[widgetIndex];
        const v = Math.floor(Math.random() * 3); 
        
        setWidgetIndex((prev) => (prev + 1) % widgetSequence.length);

        setMessages(prev => [
          ...prev, 
          { id: Date.now()+1, sender: "ai", type: nextWidget, variation: v }
        ]);
      }
    }, 800);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", type: "text", content: inputText }]);
    setInputText("");
    setIsFrantic(false);
    progressAIFlow();
  };

  const handleSkip = () => {
    // Treat the skip as a user message
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", type: "text", content: "I'd rather skip this question." }]);
    setIsFrantic(false);
    
    if (isInputDisabled) {
      // Skipping an interactive widget
      setIsInputDisabled(false);
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { id: Date.now(), sender: "ai", type: "text", content: getRandom(SUGGESTION_BANK) }
        ]);
      }, 600);
    } else {
      // Skipping a text question
      progressAIFlow();
    }
  };

  const handleWidgetConfirm = () => {
    setIsInputDisabled(false);

    // Populate timeline if we still have events to show
    if (timelineIndex < MOCK_TIMELINE_EVENTS.length) {
      setFinancialTimeline(prev => [...prev, MOCK_TIMELINE_EVENTS[timelineIndex]]);
      setTimelineIndex(prev => prev + 1);
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now(), sender: "ai", type: "text", content: getRandom(SUGGESTION_BANK) }
      ]);
    }, 600);
  };

  // --- MAIN RENDER ---
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ width: 393, height: 852, borderRadius: 44, overflow: "hidden", position: "relative", background: C.bg, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        
        {/* Header */}
        <div style={{ background: C.white, padding: "50px 20px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.grayLight}`, position: "relative", zIndex: 5 }}>
          <button onClick={() => setShowTimeline(true)} style={{ background: C.accentLight, color: C.accent, border: "none", width: 36, height: 36, borderRadius: 18, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🗂️
          </button>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>AI Advisor</div>
          <button onClick={() => setActiveMedia('call')} style={{ background: C.accentLight, color: C.accent, border: "none", width: 36, height: 36, borderRadius: 18, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            📞
          </button>
        </div>

        {/* Financial Timeline Overlay */}
        {showTimeline && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, zIndex: 25, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "50px 20px 20px", background: C.white, borderBottom: `1px solid ${C.grayLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18 }}>Financial Timeline</h2>
              <button onClick={() => setShowTimeline(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✖</button>
            </div>
            
            <div style={{ padding: 20, overflowY: "auto", flex: 1, background: C.white }}>
              <p style={{ color: C.gray, fontSize: 14, marginBottom: 20 }}>This is a map of your financial events as we piece them together.</p>
              
              {financialTimeline.length === 0 ? (
                <p style={{ color: C.gray, textAlign: "center", marginTop: 40, fontStyle: "italic" }}>The timeline is empty. Chat with me to start building your profile.</p>
              ) : (
                <div style={{ position: "relative", marginLeft: 10 }}>
                  <div style={{ position: "absolute", left: 7, top: 10, bottom: 0, width: 2, background: C.grayLight }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {financialTimeline.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 15, zIndex: 1, position: "relative" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 8, background: C.accent, border: `3px solid ${C.white}`, marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: C.primary, marginBottom: 4, fontWeight: "bold" }}>
                            {item.period}
                          </div>
                          <div style={{ background: C.bg, padding: "10px 15px", borderRadius: 8, fontSize: 14, border: `1px solid ${C.grayLight}`, color: C.gray }}>
                            {item.event}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Overlay (GPT-Live / Voice / Camera Mode) */}
        {activeMedia && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.95)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.white, padding: 30, textAlign: "center", backdropFilter: "blur(5px)" }}>
            <div style={{ fontSize: 60, marginBottom: 20, animation: activeMedia !== 'camera' ? "pulse 1.5s infinite" : "none" }}>
              {activeMedia === 'call' ? '📞' : activeMedia === 'voice' ? '🎙️' : '📷'}
            </div>
            <h2 style={{ marginBottom: 10 }}>{activeMedia === 'call' ? 'Live AI Call Active' : activeMedia === 'voice' ? 'Listening...' : 'Camera Active'}</h2>
            <p style={{ color: C.grayLight, marginBottom: 40, lineHeight: 1.5 }}>
              {activeMedia === 'camera' ? 'Snap a photo of your bills, notices, or documents.' : 'Speak naturally. I am analyzing your tone to better assist you.'}
            </p>
            <button onClick={() => setActiveMedia(null)} style={{ background: "#EF4444", color: C.white, border: "none", padding: "15px 30px", borderRadius: 30, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
              ✖ End {activeMedia === 'call' ? 'Call' : 'Mode'}
            </button>
          </div>
        )}

        {/* Chat Feed */}
        <div style={{ padding: 20, height: "calc(100% - 165px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 15 }}>
          {messages.map((msg) => {
            if (msg.type === "categorize") return <CategorizeBubble key={msg.id} onConfirm={handleWidgetConfirm} />;
            if (msg.type === "rank") return <RankBubble key={msg.id} onConfirm={handleWidgetConfirm} />;
            if (msg.type === "autofill") return <AutofillBubble key={msg.id} variation={msg.variation} onConfirm={handleWidgetConfirm} />;
            if (msg.type === "hypothesis") return <HypothesisBubble key={msg.id} variation={msg.variation} onConfirm={handleWidgetConfirm} />;
            
            const isUser = msg.sender === "user";
            
            return (
              <div key={msg.id} style={{ 
                alignSelf: isUser ? "flex-end" : "flex-start", 
                background: isUser ? C.primary : C.white, 
                color: isUser ? C.white : C.primary,
                border: isUser ? "none" : `1px solid ${C.grayLight}`, 
                padding: 15, 
                borderRadius: isUser ? "15px 15px 0 15px" : "15px 15px 15px 0", 
                maxWidth: "85%", lineHeight: "1.4"
              }}>
                {msg.content}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Actions (Skip & Frantic) */}
        <div style={{ position: "absolute", bottom: 85, left: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 10, pointerEvents: "none" }}>
          
          {/* Universal Skip Button (Always visible when waiting for user) */}
          <button onClick={handleSkip} style={{ background: C.white, border: `1px solid ${C.grayLight}`, padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: "bold", color: C.gray, cursor: "pointer", pointerEvents: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            Skip Question ⏭️
          </button>

          {/* Frantic Typing Warning */}
          {isFrantic && (
            <div style={{ background: C.warning, border: `1px solid ${C.warningText}`, padding: "10px 15px", borderRadius: 20, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
              <span style={{ color: C.warningText, fontWeight: "bold" }}>Frantic typing detected.</span>
              <button onClick={() => { setIsFrantic(false); setActiveMedia('voice'); }} style={{ background: C.warningText, color: C.white, border: "none", padding: "6px 10px", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>🎙️ Speak</button>
              <button onClick={() => { setIsFrantic(false); setActiveMedia('call'); }} style={{ background: C.warningText, color: C.white, border: "none", padding: "6px 10px", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>📞 Call</button>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div style={{ position: "absolute", bottom: 0, width: "100%", background: C.white, padding: "15px 20px 30px", borderTop: `1px solid ${C.grayLight}`, display: "flex", gap: 10, alignItems: "center", zIndex: 5 }}>
          <button onClick={() => setActiveMedia('voice')} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", opacity: 0.7 }}>🎙️</button>
          <button onClick={() => setActiveMedia('camera')} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", opacity: 0.7 }}>📷</button>
          <input 
            value={inputText}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && !isInputDisabled && handleSendText()}
            disabled={isInputDisabled}
            placeholder={isInputDisabled ? "Please interact with the widget..." : "Message AI Advisor..."} 
            style={{ flex: 1, padding: "10px 15px", borderRadius: 20, border: `1px solid ${C.grayLight}`, outline: "none", background: isInputDisabled ? C.primaryLight : C.white }} 
          />
          <button onClick={() => handleSendText()} disabled={!inputText.trim() || isInputDisabled} style={{ background: inputText.trim() && !isInputDisabled ? C.accent : C.grayLight, color: C.white, border: "none", padding: "10px 15px", borderRadius: 20, fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
            Send
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}