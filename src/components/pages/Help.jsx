import { useState } from "react";
import { Icon } from "@/components/atoms/Icon.jsx";
import { C } from "@/styles/tokens.js";
import { SECTIONS, WHATSAPP_CARD } from "@/components/pages/helpSections.jsx";

function HelpSection({ section, isOpen, onToggle }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          background: isOpen ? C.surfaceHi : C.surface,
          cursor: "pointer",
          transition: "background .2s",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontSize: 22 }}>{section.icon}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#fff" }}>{section.title}</span>
        <span style={{
          fontSize: 12, color: C.t3,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
          display: "inline-block",
        }}>▾</span>
      </div>
      {isOpen && (
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderTop: `1px solid ${C.border}` }}>
          {section.content}
        </div>
      )}
    </div>
  );
}

export function Help({ setPage }) {
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) => setOpenSection((prev) => prev === id ? null : id);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setPage("dashboard")}
          style={{ background: "none", border: "none", color: C.t2, cursor: "pointer", padding: 4, lineHeight: 0 }}
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Central de Ajuda</div>
          <div style={{ fontSize: 11, color: C.t3 }}>Manual completo do Álbum Copa 2026</div>
        </div>
      </div>

      {SECTIONS.map((sec) => (
        <HelpSection
          key={sec.id}
          section={sec}
          isOpen={openSection === sec.id}
          onToggle={() => toggleSection(sec.id)}
        />
      ))}
      {WHATSAPP_CARD}
    </div>
  );
}
