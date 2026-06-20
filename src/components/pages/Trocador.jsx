import { useState, useMemo } from "react";
import { ES_BY_CODE } from "@/data/extraStickers.js";
import {
  parseTraderCodes, computeTrade, getStickerType, getTypeLabel,
  buildTradeSummaryText,
} from "@/utils/tradeMatcher.js";
import { C } from "@/styles/tokens.js";

export function Trocador({ stickers, addToast }) {
  const [raw, setRaw] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validCodes = useMemo(
    () => new Set(stickers.map(s => s.code)),
    [stickers]
  );

  const parsed = useMemo(
    () => parseTraderCodes(raw, validCodes),
    [raw, validCodes]
  );

  const result = useMemo(() => {
    if (!submitted || parsed.valid.length === 0) return null;
    return computeTrade({
      allStickers: stickers,
      traderCodes: parsed.valid,
      esByCode: ES_BY_CODE,
    });
  }, [submitted, parsed.valid, stickers]);

  function handleProcess() {
    if (parsed.valid.length === 0) {
      addToast?.("Cole ao menos um código válido das repetidas do trocador.");
      return;
    }
    setSubmitted(true);
  }

  function handleReset() {
    setRaw("");
    setSubmitted(false);
  }

  function handleCopy() {
    if (!result?.suggestedPairs?.length) return;
    const text = buildTradeSummaryText(result.suggestedPairs);
    navigator.clipboard?.writeText(text);
    addToast?.("Resumo da troca copiado!");
  }

  return (
    <div style={{ minHeight: "100vh", color: "#fff", paddingBottom: 80 }}>
      {/* Intro */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
          Trocador inteligente
        </h2>
        <p style={{ fontSize: 13, color: C.t2, margin: 0, lineHeight: 1.5 }}>
          Cole os códigos das figurinhas repetidas do trocador. O app sugere uma
          troca equilibrada com as suas repetidas.
        </p>
      </div>

      {/* Input */}
      <textarea
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setSubmitted(false); }}
        placeholder="Ex: BRA10, ARG05, FWC3, ES7..."
        rows={4}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 14px",
          color: "#fff", fontSize: 16, fontFamily: "inherit",
          outline: "none", resize: "vertical", lineHeight: 1.6,
        }}
      />

      {/* Contadores de parsing */}
      {raw.trim() && (
        <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
          <span style={{ color: C.green }}>{parsed.valid.length} válidos</span>
          {parsed.invalid.length > 0 && (
            <span style={{ color: C.t3 }}>{parsed.invalid.length} não reconhecidos</span>
          )}
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={handleProcess}
          style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
            color: "#0c0c1a", fontWeight: 800, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Calcular troca
        </button>
        {submitted && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "11px 16px", borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.surface,
              color: C.t2, fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div style={{ marginTop: 24 }}>
          {/* Resumo */}
          <div style={{
            display: "flex", justifyContent: "space-around",
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px", marginBottom: 20,
          }}>
            <SummaryStat label="Você dá" value={result.summary.willGive} color={C.amber} />
            <div style={{ width: 1, background: C.border }} />
            <SummaryStat label="Você recebe" value={result.summary.willReceive} color={C.green} />
          </div>

          {/* Seção 1: Troca sugerida */}
          {result.suggestedPairs.length > 0 ? (
            <Section title="Troca sugerida" subtitle="Equilibrada, pareada por tipo">
              {result.suggestedPairs.map((pair, i) => (
                <TradePair key={i} pair={pair} />
              ))}
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  width: "100%", marginTop: 12, padding: "10px 0",
                  borderRadius: 10, border: `1px solid ${C.border}`,
                  background: C.surface, color: C.amber,
                  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                📋 Copiar resumo da troca
              </button>
            </Section>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>
              Nenhuma troca equilibrada encontrada. Veja as opções abaixo.
            </div>
          )}

          {/* Seção 2: Recebo sem par */}
          {result.receiveWithoutPair.length > 0 && (
            <Section
              title="Você precisa, mas falta contrapartida"
              subtitle="Não há figurinha do mesmo tipo para oferecer — escolha algo das suas repetidas abaixo"
            >
              {result.receiveWithoutPair.map((s, i) => (
                <StickerRow key={i} sticker={s} accent={C.green} />
              ))}
            </Section>
          )}

          {/* Seção 3: Outras opções */}
          {result.allMyDuplicates.length > 0 && (
            <Section
              title="Outras repetidas suas"
              subtitle="Todas as suas repetidas que o trocador não listou — para escolher manualmente"
            >
              {groupByType(result.allMyDuplicates).map(group => (
                <div key={group.type} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                    color: C.t3, textTransform: "uppercase", marginBottom: 8,
                  }}>
                    {getTypeLabel(group.type)} ({group.items.length})
                  </div>
                  {group.items.map((s, i) => (
                    <StickerRow key={i} sticker={s} accent={C.amber} />
                  ))}
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Sub-componentes ===== */

function SummaryStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.t3, marginBottom: 12, lineHeight: 1.4 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function TradePair({ pair }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto 1fr",
      gap: 8, alignItems: "center",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "10px 12px", marginBottom: 8,
    }}>
      {/* Eu dou */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", wordBreak: "break-word" }}>{pair.give.name}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>{pair.give.code}</div>
      </div>

      {/* Seta + badge */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, color: C.amber }}>⇄</div>
        <div style={{
          fontSize: 8, fontWeight: 700, letterSpacing: "0.05em",
          color: pair.perfect ? C.green : C.t3,
          textTransform: "uppercase", marginTop: 2,
        }}>
          {pair.perfect ? "perfeito" : "sugestão"}
        </div>
      </div>

      {/* Eu recebo */}
      <div style={{ minWidth: 0, textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", wordBreak: "break-word" }}>{pair.receive.name}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>{pair.receive.code}</div>
      </div>
    </div>
  );
}

function StickerRow({ sticker, accent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "9px 12px", marginBottom: 6,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", wordBreak: "break-word" }}>{sticker.name}</div>
        <div style={{ fontSize: 10, color: C.t3 }}>{sticker.teamName}</div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: accent,
        background: "rgba(255,255,255,0.04)", padding: "3px 8px",
        borderRadius: 6, flexShrink: 0, marginLeft: 8,
      }}>{sticker.code}</span>
    </div>
  );
}

/* ===== Helper de agrupamento por tipo ===== */
function groupByType(stickers) {
  const map = {};
  stickers.forEach(s => {
    const type = getStickerType(s, ES_BY_CODE);
    if (!map[type]) map[type] = { type, items: [] };
    map[type].items.push(s);
  });
  // ordem: jogador, escudo, fotoEquipe, especial, fwc, cocacola, extra
  const order = ["jogador", "escudo", "fotoEquipe", "especial", "fwc", "cocacola", "extra"];
  return Object.values(map).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
}
