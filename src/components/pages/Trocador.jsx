import { useState, useMemo } from "react";
import { ES_BY_CODE } from "@/data/extraStickers.js";
import { teamInfo } from "@/utils/teamInfo.js";
import {
  parseTraderCodes, computeTrade, getStickerType, getTypeLabel,
  buildTradeSummaryText,
} from "@/utils/tradeMatcher.js";
import { C } from "@/styles/tokens.js";

/* Cores por tipo de figurinha (badges) */
const TYPE_COLORS = {
  jogador: "#38bdf8",
  escudo: "#a855f7",
  fotoEquipe: "#22c55e",
  especial: "#fbbf24",
  fwc: "#f59e0b",
  cocacola: "#f40009",
  extra: "#ec4899",
};

/* Cores por posição (jogadores) */
const POS_COLORS = {
  "Goleiro": "#fbbf24",
  "Defensor": "#38bdf8",
  "Meio-Campista": "#22c55e",
  "Atacante": "#f87171",
};

export function Trocador({ stickers, addToast, applyTrade }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [parseInfo, setParseInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const validCodes = useMemo(() => new Set(stickers.map(s => s.code)), [stickers]);

  function handleProcess() {
    if (!raw.trim()) {
      addToast?.("Cole os códigos das repetidas do trocador primeiro.");
      return;
    }
    setApplied(false);
    setConfirming(false);
    setProcessing(true);
    setTimeout(() => {
      const parsed = parseTraderCodes(raw, validCodes);
      setParseInfo(parsed);
      if (parsed.valid.length === 0) {
        setResult(null);
        setProcessing(false);
        addToast?.("Nenhum código reconhecido. Verifique o texto colado.");
        return;
      }
      const r = computeTrade({ allStickers: stickers, traderCodes: parsed.valid, esByCode: ES_BY_CODE });
      setResult(r);
      setProcessing(false);
      requestAnimationFrame(() => {
        document.getElementById("trade-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 30);
  }

  function handleReset() {
    setRaw(""); setResult(null); setParseInfo(null);
    setApplied(false); setConfirming(false);
  }

  function handleCopy() {
    if (!result?.suggestedPairs?.length) return;
    copyToClipboard(buildTradeSummaryText(result.suggestedPairs, result.receiveWithoutPair), addToast);
  }

  function handleConfirmTrade() {
    if (!result?.suggestedPairs?.length || applied) return;
    applyTrade?.(result.suggestedPairs);
    setApplied(true);
    setConfirming(false);
    addToast?.("Álbum atualizado!");
  }

  return (
    <div style={{ minHeight: "100vh", color: "#fff", paddingBottom: 80 }}>
      {/* Intro */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>Trocador inteligente</h2>
        <p style={{ fontSize: 13, color: C.t2, margin: 0, lineHeight: 1.5 }}>
          Cole a lista de repetidas do trocador (qualquer formato). O app sugere uma troca equilibrada.
        </p>
      </div>

      {/* Input */}
      <textarea
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          if (v.length > 20000) {
            addToast?.("Texto muito longo — cole apenas a lista de figurinhas.");
            setRaw(v.slice(0, 20000));
          } else setRaw(v);
        }}
        placeholder="Cole aqui a lista do trocador..."
        rows={4}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 14px",
          color: "#fff", fontSize: 16, fontFamily: "inherit",
          outline: "none", resize: "vertical", lineHeight: 1.6,
        }}
      />

      {parseInfo && (
        <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
          <span style={{ color: C.green }}>{parseInfo.valid.length} reconhecidos</span>
          {parseInfo.invalid.length > 0 && (
            <span style={{ color: C.t3 }}>{parseInfo.invalid.length} não reconhecidos</span>
          )}
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button" onClick={handleProcess} disabled={processing}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
            background: processing ? "rgba(245,158,11,0.4)" : `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
            color: "#0c0c1a", fontWeight: 800, fontSize: 14,
            cursor: processing ? "default" : "pointer", fontFamily: "inherit",
          }}
        >{processing ? "Processando..." : "Calcular troca"}</button>
        {result && (
          <button type="button" onClick={handleReset} style={{
            padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.surface, color: C.t2, fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>Limpar</button>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div id="trade-result" style={{ marginTop: 24 }}>
          {/* Barra de equilíbrio */}
          <BalanceBar give={result.summary.willGive} receive={result.summary.willReceive} />

          {/* Seção 1: Troca sugerida */}
          {result.suggestedPairs.length > 0 ? (
            <Section title="Troca sugerida" subtitle="Pareada por tipo — equilibrada">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.suggestedPairs.map((pair) => (
                  <TradePair key={`${pair.give.code}-${pair.receive.code}`} pair={pair} />
                ))}
              </div>
              {/* Confirmar troca no álbum */}
              {applied ? (
                <div style={{
                  marginTop: 12, padding: "11px 12px", borderRadius: 10,
                  border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)",
                  color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center",
                }}>
                  ✓ Troca aplicada no seu álbum
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, marginTop: 4 }}>
                    Envie a proposta pro trocador aplicar o lado dele.
                  </div>
                </div>
              ) : confirming ? (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surface,
                }}>
                  <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.5, marginBottom: 10 }}>
                    Isso atualiza seu álbum: <b style={{ color: C.amber }}>−{result.summary.willGive}</b> repetidas
                    {" "}e <b style={{ color: C.green }}>+{result.summary.willReceive}</b> novas. Confirmar?
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={handleConfirmTrade} style={{
                      flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
                      background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
                      color: "#0c0c1a", fontWeight: 800, fontSize: 13,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Sim, atualizar álbum</button>
                    <button type="button" onClick={() => setConfirming(false)} style={{
                      padding: "10px 16px", borderRadius: 9, border: `1px solid ${C.border}`,
                      background: "transparent", color: C.t2, fontWeight: 700, fontSize: 13,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} style={{
                  width: "100%", marginTop: 12, padding: "12px 0", borderRadius: 10,
                  border: "none", background: `linear-gradient(135deg, ${C.amber}, ${C.amberLt})`,
                  color: "#0c0c1a", fontWeight: 800, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Confirmar troca no meu álbum</button>
              )}
              <button type="button" onClick={handleCopy} style={{
                width: "100%", marginTop: 12, padding: "11px 0", borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.surface, color: C.amber,
                fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>📋 Copiar proposta de troca</button>
            </Section>
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.t3, fontSize: 13 }}>
              Nenhuma troca equilibrada encontrada. Veja as opções abaixo.
            </div>
          )}

          {/* Seção 2: recebo sem par */}
          {result.receiveWithoutPair.length > 0 && (
            <Section title="Você precisa, falta contrapartida"
              subtitle="Sem figurinha do mesmo tipo para oferecer — escolha algo das suas repetidas abaixo">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.receiveWithoutPair.map((s) => (
                  <StickerRow key={s.code} sticker={s} side="receive" />
                ))}
              </div>
            </Section>
          )}

          {/* Seção 3: outras repetidas */}
          {result.allMyDuplicates.length > 0 && (
            <Section title="Outras repetidas suas"
              subtitle="Tudo que você pode oferecer — agrupado por tipo">
              {groupByType(result.allMyDuplicates).map(group => (
                <div key={group.type} style={{ marginBottom: 14 }}>
                  <TypeHeader type={group.type} count={group.items.length} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {group.items.map((s) => (
                      <StickerRow key={s.code} sticker={s} side="give" />
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Barra de equilíbrio ===== */
function BalanceBar({ give, receive }) {
  const total = give + receive;
  const givePct = total > 0 ? (give / total) * 100 : 50;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>{give}</div>
          <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Você dá</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>{receive}</div>
          <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Você recebe</div>
        </div>
      </div>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${givePct}%`, background: C.amber }}/>
        <div style={{ width: `${100 - givePct}%`, background: C.green }}/>
      </div>
    </div>
  );
}

/* ===== Section ===== */
function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.t3, marginBottom: 12, lineHeight: 1.4 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

/* ===== Par de troca (com bandeiras) ===== */
function TradePair({ pair }) {
  if (!pair?.give || !pair?.receive) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${pair.perfect ? "rgba(34,197,94,0.3)" : C.border}`,
      borderRadius: 12, padding: "10px 12px",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
        <StickerMini sticker={pair.give} align="left" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, color: pair.perfect ? C.green : C.amber }}>⇄</div>
        </div>
        <StickerMini sticker={pair.receive} align="right" />
      </div>
      {/* Badge de qualidade */}
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <span style={{
          fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
          color: pair.perfect ? C.green : C.t3,
          background: pair.perfect ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
          padding: "2px 8px", borderRadius: 5,
        }}>{pair.perfect ? "✓ match perfeito" : "sugestão"}</span>
      </div>
    </div>
  );
}

/* mini com bandeira + nome + código */
function StickerMini({ sticker, align }) {
  const info = teamInfo(sticker.team) ?? {};
  const flag = info.flag ?? "";
  const isRight = align === "right";
  return (
    <div style={{
      display: "flex", flexDirection: isRight ? "row-reverse" : "row",
      alignItems: "center", gap: 8, minWidth: 0,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{flag}</span>
      <div style={{ minWidth: 0, textAlign: isRight ? "right" : "left" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", wordBreak: "break-word", lineHeight: 1.2 }}>
          {sticker.name ?? sticker.code}
        </div>
        <div style={{ fontSize: 10, color: C.t3 }}>{sticker.code}</div>
      </div>
    </div>
  );
}

/* ===== Linha de figurinha (seções 2 e 3) ===== */
function StickerRow({ sticker, side }) {
  if (!sticker) return null;
  const info = teamInfo(sticker.team) ?? {};
  const flag = info.flag ?? "";
  const accent = side === "receive" ? C.green : C.amber;
  const type = getStickerType(sticker, ES_BY_CODE);
  const posColor = POS_COLORS[sticker.position];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "9px 12px",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{flag}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", wordBreak: "break-word", lineHeight: 1.2 }}>
          {sticker.name ?? sticker.code}
        </div>
        <div style={{ fontSize: 10, color: C.t3 }}>{sticker.teamName ?? ""}</div>
      </div>
      {/* badge de posição/tipo */}
      {type === "jogador" && posColor && (
        <span style={{
          fontSize: 8, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase",
          color: posColor, background: "rgba(255,255,255,0.04)", padding: "3px 6px",
          borderRadius: 5, flexShrink: 0,
        }}>{posAbbr(sticker.position)}</span>
      )}
      <span style={{
        fontSize: 11, fontWeight: 700, color: accent,
        background: "rgba(255,255,255,0.04)", padding: "3px 8px",
        borderRadius: 6, flexShrink: 0,
      }}>{sticker.code}</span>
    </div>
  );
}

/* ===== Cabeçalho de tipo (seção 3) ===== */
function TypeHeader({ type, count }) {
  const color = TYPE_COLORS[type] ?? C.t3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.t2, textTransform: "uppercase" }}>
        {getTypeLabel(type)}
      </span>
      <span style={{ fontSize: 11, color: C.t3 }}>({count})</span>
    </div>
  );
}

/* ===== Helpers ===== */
function posAbbr(position) {
  return { "Goleiro": "GOL", "Defensor": "DEF", "Meio-Campista": "MEI", "Atacante": "ATA" }[position] ?? "";
}

function copyToClipboard(text, addToast) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => addToast?.("Proposta copiada!"))
      .catch(() => fallbackCopy(text, addToast));
    return;
  }
  fallbackCopy(text, addToast);
}

function fallbackCopy(text, addToast) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    addToast?.(ok ? "Proposta copiada!" : "Não foi possível copiar automaticamente.");
  } catch {
    addToast?.("Não foi possível copiar automaticamente.");
  }
}

function groupByType(stickers) {
  const map = {};
  stickers.forEach(s => {
    const type = getStickerType(s, ES_BY_CODE);
    if (!map[type]) map[type] = { type, items: [] };
    map[type].items.push(s);
  });
  const order = ["jogador", "escudo", "fotoEquipe", "especial", "fwc", "cocacola", "extra"];
  return Object.values(map).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
}
