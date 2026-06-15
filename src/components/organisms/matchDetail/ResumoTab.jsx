import { useState, useEffect } from "react";
import { getLiveEvents } from "@/services/worldcup";
import { LoadingTab, EmptyTab, SectionLabel } from "@/components/organisms/matchDetail/_shared";

/* Linha do tempo de eventos (jogo encerrado/ao vivo) */
export function ResumoTab({ match }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    let mounted = true;
    getLiveEvents(match.id ?? match.fixture?.id).then(data => {
      if (mounted) setEvents(data?.data ?? data ?? []);
    }).catch(() => mounted && setEvents([]));
    return () => { mounted = false; };
  }, [match.id, match.fixture?.id]);

  if (events === null) return <LoadingTab />;
  if (!events.length) return <EmptyTab message="Sem eventos registrados." />;

  return (
    <div>
      <SectionLabel>Linha do tempo</SectionLabel>
      {events.map((e, idx) => (
        <EventRow key={idx} event={e} />
      ))}
    </div>
  );
}

function EventRow({ event }) {
  const icon = {
    "Goal": "⚽",
    "Yellow Card": "🟨",
    "Red Card": "🟥",
    "subst": "🔄",
    "Substitution": "🔄",
  }[event.type] ?? "•";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "44px 28px 1fr",
      gap: 10,
      padding: "10px 4px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      alignItems: "center",
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#f59e0b",
      }}>{event.time?.elapsed ?? event.minute ?? "?"}{"'"}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ fontSize: 13, color: "#fff" }}>
        <div style={{ fontWeight: 600 }}>{event.player?.name ?? event.player ?? "—"}</div>
        {event.detail && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{event.detail}</div>
        )}
      </div>
    </div>
  );
}
