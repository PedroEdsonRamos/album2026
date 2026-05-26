import { useState, useCallback, useEffect, useRef } from "react";
import { C } from "@/styles/tokens.js";
import { useStickers } from "@/hooks/useStickers.js";
import { TEAMS } from "@/data/teams.js";
import { Toast } from "@/components/atoms/Toast.jsx";
import { CompletionModal } from "@/components/organisms/CompletionModal.jsx";
import { Header } from "@/components/organisms/Header.jsx";
import { BottomNav } from "@/components/organisms/BottomNav.jsx";
import { Footer } from "@/components/organisms/Footer.jsx";
import { QuickSearch } from "@/components/organisms/QuickSearch.jsx";
import { Dashboard } from "@/components/pages/Dashboard.jsx";
import { Teams } from "@/components/pages/Teams.jsx";
import { Stickers } from "@/components/pages/Stickers.jsx";
import { AddPage } from "@/components/pages/AddPage.jsx";
import { Trades } from "@/components/pages/Trades.jsx";
import { Status } from "@/components/pages/Status.jsx";

export default function App() {
  const { stickers, setStickers } = useStickers();
  const [page, setPage] = useState("dashboard");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [albumInitialFilter, setAlbumInitialFilter] = useState({});
  const [completion, setCompletion] = useState(null);
  const prevStickersRef = useRef(null);
  const mountedRef = useRef(false);

  const goToAlbum = (filter = {}) => {
    setSelectedTeam(null);
    setAlbumInitialFilter({ ...filter, _ts: Date.now() });
    setPage("stickers");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToast = useCallback((msg, type = "success", duration) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type, duration }]);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevStickersRef.current = stickers;
      return;
    }
    const prev = prevStickersRef.current;
    if (!prev) { prevStickersRef.current = stickers; return; }

    TEAMS.forEach((team) => {
      const prevOwned = prev.filter((s) => s.team === team.id && s.status === "Tenho").length;
      const nowOwned = stickers.filter((s) => s.team === team.id && s.status === "Tenho").length;
      if (prevOwned < 20 && nowOwned === 20) {
        addToast(`${team.flag} ${team.name} completo! Todos os 20 cromos!`, "success", 4000);
      }
    });

    const groups = [...new Set(TEAMS.map((t) => t.grp))];
    groups.forEach((grp) => {
      const grpTeams = TEAMS.filter((t) => t.grp === grp);
      const allComplete = grpTeams.every(
        (team) => stickers.filter((s) => s.team === team.id && s.status === "Tenho").length === 20
      );
      const wasComplete = grpTeams.every(
        (team) => prev.filter((s) => s.team === team.id && s.status === "Tenho").length === 20
      );
      if (!wasComplete && allComplete) {
        setCompletion({ type: "group", grp, teams: grpTeams });
      }
    });

    const prevTotal = prev.filter((s) => s.status === "Tenho").length;
    const nowTotal = stickers.filter((s) => s.status === "Tenho").length;
    if (prevTotal < 980 && nowTotal === 980) {
      setCompletion({ type: "album" });
    }

    prevStickersRef.current = stickers;
  }, [stickers]);

  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const handleNav = (id) => {
    if (id !== "stickers") setSelectedTeam(null);
    setAlbumInitialFilter({ _ts: 0 });
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Sora','DM Sans',system-ui,sans-serif",
        color: "#fff",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(168,85,247,0.08) 0%, transparent 60%)",
        }}
      />
      {toasts.map((t) => (
        <Toast key={t.id} msg={t.msg} type={t.type} duration={t.duration} onDone={() => removeToast(t.id)} />
      ))}
      <CompletionModal completion={completion} onClose={() => setCompletion(null)} />
      {searchOpen && (
        <QuickSearch
          stickers={stickers}
          onClose={() => setSearchOpen(false)}
          onGoTo={(s) => {
            setSelectedTeam(s.team);
            setPage("stickers");
          }}
        />
      )}
      <Header
        page={page}
        selectedTeam={selectedTeam}
        stickers={stickers}
        onBack={() => {
          setSelectedTeam(null);
          setPage("teams");
        }}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <div style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}>
        <div style={{ padding: "20px 16px 24px", position: "relative", zIndex: 1 }}>
          {page === "dashboard" && (
            <Dashboard
              stickers={stickers}
              setPage={setPage}
              setTeamFilter={setSelectedTeam}
              goToAlbum={goToAlbum}
            />
          )}
          {page === "teams" && (
            <Teams stickers={stickers} setPage={setPage} setTeamFilter={setSelectedTeam} />
          )}
          {page === "stickers" && (
            <Stickers
              stickers={stickers}
              selectedTeam={selectedTeam}
              setStickers={setStickers}
              addToast={addToast}
              initialFilter={albumInitialFilter}
            />
          )}
          {page === "add" && (
            <AddPage stickers={stickers} setStickers={setStickers} addToast={addToast} />
          )}
          {page === "trocas" && <Trades stickers={stickers} addToast={addToast} goToAlbum={goToAlbum} setPage={handleNav} setTeamFilter={setSelectedTeam} />}
          {page === "status" && (
            <Status
              stickers={stickers}
              setStickers={setStickers}
              addToast={addToast}
              setPage={setPage}
            />
          )}
        </div>
        <Footer />
      </div>
      <BottomNav page={page} onNav={handleNav} />
    </div>
  );
}
